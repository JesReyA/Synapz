import { AlertTriangle, ArrowRight, BarChart3, ClipboardList, GraduationCap, Target, Users } from "lucide-react";
import { LiveLeaderboardTeacherCard } from "../../components/teacher/LiveLeaderboardTeacherCard.tsx";
import { TeacherKpiTile } from "../../components/teacher/TeacherKpiTile.tsx";
import { useLeaderboard } from "../../hooks/useLeaderboard.ts";
import { STATUS_META, formatLongDate } from "../../lib/teacherLabels.ts";
import { grantBonusPoints } from "../../services/mockChallenges.ts";
import type { TeacherClassroomSummary, TeacherTopic } from "../../types/teacher.ts";

interface TeacherHomePageProps {
  classrooms: TeacherClassroomSummary[];
  topics: Record<string, TeacherTopic[]>;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onOpenClasses: () => void;
  onOpenReports: () => void;
}

const CARD =
  "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#222B3E] dark:bg-[#131A29] dark:shadow-none";

const LINK_BUTTON =
  "inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-600 transition-colors duration-150 hover:bg-blue-100 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none dark:bg-[#1B2438] dark:text-blue-100 dark:hover:bg-[#222d47]";

export function TeacherHomePage({ classrooms, topics, selectedId, onSelect, onOpenClasses, onOpenReports }: TeacherHomePageProps) {
  const selected = classrooms.find((c) => c.id === selectedId) ?? null;
  const leaderboard = useLeaderboard(selected?.id ?? "");

  const students = classrooms.reduce((s, c) => s + c.student_count, 0);
  const atRisk = classrooms.reduce((s, c) => s + c.at_risk_count, 0);
  const withAvg = classrooms.filter((c) => c.overall_avg !== null && c.student_count > 0);
  const weighted = withAvg.reduce((s, c) => s + (c.overall_avg ?? 0) * c.student_count, 0);
  const average = withAvg.length ? Math.round(weighted / withAvg.reduce((s, c) => s + c.student_count, 0)) : null;

  const attention = (selected ? (topics[selected.id] ?? []) : []).filter((t) => t.status !== "taught");

  return (
    <>
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <TeacherKpiTile label="Aulas" value={String(classrooms.length)} icon={GraduationCap} tile="bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300" />
        <TeacherKpiTile label="Alumnos" value={String(students)} icon={Users} tile="bg-violet-100 text-violet-600 dark:bg-violet-400/15 dark:text-violet-300" />
        <TeacherKpiTile label="Promedio general" value={average === null ? "—" : `${average}%`} icon={Target} tile="bg-emerald-100 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-300" />
        <TeacherKpiTile label="Alumnos en riesgo" value={String(atRisk)} icon={AlertTriangle} tile="bg-orange-100 text-orange-600 dark:bg-amber-900/40 dark:text-amber-400" />
      </div>

      <section aria-label="Tus aulas" className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Tus aulas</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {classrooms.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelect(c.id)}
              aria-pressed={c.id === selectedId}
              className={`flex flex-col gap-3 rounded-2xl border bg-white p-4 text-left shadow-sm transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none dark:bg-[#161E30] dark:shadow-none ${
                c.id === selectedId
                  ? "border-blue-500 ring-2 ring-blue-500/30 dark:border-blue-400"
                  : "border-slate-200 hover:border-slate-300 dark:border-[#222B3E] dark:hover:border-[#34405a]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{c.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {c.grade_group} · {c.student_count} alumnos · Código {c.invite_code}
                  </p>
                </div>
                {c.at_risk_count > 0 && (
                  <span className="shrink-0 rounded-full bg-orange-100 px-2.5 py-1 text-[11px] font-semibold text-orange-700 dark:bg-amber-900/40 dark:text-amber-300">
                    {c.at_risk_count} en riesgo
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div
                  role="progressbar"
                  aria-label={`Promedio de ${c.name}`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={c.overall_avg ?? 0}
                  className="h-2 flex-1 rounded-full bg-slate-200 dark:bg-[#2A3347]"
                >
                  <div className="h-full rounded-full bg-emerald-500 dark:bg-emerald-400" style={{ width: `${c.overall_avg ?? 0}%` }} />
                </div>
                <span className="text-xs text-slate-500 tabular-nums dark:text-slate-400">
                  {c.overall_avg === null ? "Sin datos" : `${c.overall_avg}%`}
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {selected && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <section aria-label="Temas por atender" className={`${CARD} flex flex-col gap-3`}>
            <header>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Temas por impartir o repasar en {selected.name}</h2>
            </header>
            {attention.length === 0 ? (
              <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:bg-[#161E30] dark:text-slate-300">
                Todos los temas de esta aula están impartidos.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {attention.map((t) => {
                  const status = STATUS_META[t.status];
                  return (
                    <li key={t.id} className="flex flex-wrap items-center gap-2 rounded-2xl bg-slate-50 p-3 dark:bg-[#161E30]">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{t.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {formatLongDate(t.scheduled_date)}
                          {t.material_files.length === 0 && " · Sin material"}
                        </p>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${status.tone}`}>{status.label}</span>
                    </li>
                  );
                })}
              </ul>
            )}
            <div className="flex flex-wrap gap-2 pt-1">
              <button type="button" onClick={onOpenClasses} className={LINK_BUTTON}>
                <ClipboardList className="size-3.5" strokeWidth={1.75} />
                Gestionar temario
              </button>
              <button type="button" onClick={onOpenReports} className={LINK_BUTTON}>
                <BarChart3 className="size-3.5" strokeWidth={1.75} />
                Ver reportes
                <ArrowRight className="size-3.5" strokeWidth={2} />
              </button>
            </div>
          </section>

          {selected.subject_area === "math" ? (
            <LiveLeaderboardTeacherCard
              entries={leaderboard}
              onGrant={async (studentId, points, reason) => {
                await grantBonusPoints(selected.id, { student_id: studentId, points, reason });
              }}
            />
          ) : (
            <section aria-label="Ranking" className={`${CARD} grid place-items-center text-center text-sm text-slate-600 dark:text-slate-300`}>
              El ranking del juego rápido es de las aulas de Matemáticas.
            </section>
          )}
        </div>
      )}
    </>
  );
}
