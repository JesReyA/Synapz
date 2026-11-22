import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  CircleDot,
  FileText,
  Presentation,
  StickyNote,
  BookOpen,
} from "lucide-react";
import type {
  ClassroomSummary,
  StudentTopicState,
  SyllabusTopic,
  TopicMaterial,
  TopicStatus,
} from "../../types/classes.ts";

interface SyllabusTopicListProps {
  classroom: ClassroomSummary;
  onOpenTopic: (topic: SyllabusTopic) => void;
}

const STUDENT_STATE: Record<StudentTopicState, { label: string; icon: LucideIcon; tone: string }> = {
  not_started: { label: "Sin empezar", icon: Circle, tone: "text-slate-400 dark:text-slate-500" },
  in_progress: { label: "En progreso", icon: CircleDot, tone: "text-blue-500 dark:text-blue-300" },
  mastered: { label: "Dominado", icon: CheckCircle2, tone: "text-emerald-500 dark:text-emerald-400" },
};

const TEACHER_STATUS: Record<TopicStatus, { label: string; tone: string }> = {
  pending: { label: "Por impartir", tone: "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300" },
  taught: { label: "Impartido", tone: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" },
  review: { label: "A repasar", tone: "bg-orange-100 text-orange-700 dark:bg-amber-900/40 dark:text-amber-300" },
};

const MATERIAL_ICON: Record<TopicMaterial["kind"], LucideIcon> = {
  pdf: FileText,
  pptx: Presentation,
  notes: StickyNote,
};

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("es-MX", { day: "numeric", month: "short" });
}

function TopicRow({ topic, onOpen }: { topic: SyllabusTopic; onOpen: (t: SyllabusTopic) => void }) {
  const state = STUDENT_STATE[topic.student_state];
  const status = TEACHER_STATUS[topic.status];
  const StateIcon = state.icon;
  return (
    <li className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-[#222B3E] dark:bg-[#161E30]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <StateIcon className={`mt-0.5 size-5 shrink-0 ${state.tone}`} strokeWidth={1.75} aria-hidden="true" />
          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{topic.title}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {state.label} · {formatDate(topic.scheduled_date)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${status.tone}`}>{status.label}</span>
          <button
            type="button"
            onClick={() => onOpen(topic)}
            className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-4 py-1.5 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-100 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none dark:bg-[#1B2438] dark:text-blue-100 dark:hover:bg-[#222d47]"
          >
            <BookOpen className="size-3.5" strokeWidth={1.75} />
            Estudiar
          </button>
        </div>
      </div>

      {topic.materials.length > 0 ? (
        <ul className="flex flex-wrap gap-2" aria-label="Materiales del profesor">
          {topic.materials.map((m) => {
            const Icon = MATERIAL_ICON[m.kind];
            return (
              <li
                key={m.id}
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs text-slate-600 dark:bg-white/5 dark:text-slate-300"
              >
                <Icon className="size-3.5 shrink-0" strokeWidth={1.75} />
                {m.filename}
                <span className="text-slate-400 dark:text-slate-500">· {m.pages} pp.</span>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-xs text-slate-500 dark:text-slate-400">Tu profesor aún no ha subido material.</p>
      )}
    </li>
  );
}

function Section({
  title,
  description,
  topics,
  onOpen,
}: {
  title: string;
  description: string;
  topics: SyllabusTopic[];
  onOpen: (t: SyllabusTopic) => void;
}) {
  if (topics.length === 0) return null;
  return (
    <section className="flex flex-col gap-3">
      <div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      <ul className="flex flex-col gap-3">
        {topics.map((t) => (
          <TopicRow key={t.id} topic={t} onOpen={onOpen} />
        ))}
      </ul>
    </section>
  );
}

export function SyllabusTopicList({ classroom, onOpenTopic }: SyllabusTopicListProps) {
  const ordered = [...classroom.topics].sort((a, b) => a.position - b.position);
  const cycle = ordered.filter((t) => t.kind === "cycle");
  const prerequisites = ordered.filter((t) => t.kind === "prerequisite");

  return (
    <section
      aria-label={`Temario de ${classroom.name}`}
      className="flex flex-col gap-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#222B3E] dark:bg-[#131A29] dark:shadow-none"
    >
      <header>
        <h2 className="text-base font-bold text-slate-900 dark:text-white">Temario de {classroom.name}</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {classroom.teacher_name} · {classroom.grade_group}
        </p>
      </header>

      {classroom.diagnostic_pending && (
        <p
          role="status"
          className="flex items-center gap-2 rounded-2xl bg-orange-100 px-4 py-3 text-sm text-orange-800 dark:bg-amber-900/40 dark:text-amber-200"
        >
          <AlertTriangle className="size-4 shrink-0" strokeWidth={2} />
          Tienes un diagnóstico pendiente en esta aula. Te ayuda a saber qué temas previos reforzar.
        </p>
      )}

      <Section
        title="Ciclo actual"
        description="Temas que veremos en este ciclo escolar."
        topics={cycle}
        onOpen={onOpenTopic}
      />
      <Section
        title="Nivelación (temas previos)"
        description="Temas anteriores que necesitas dominar para avanzar sin rezago."
        topics={prerequisites}
        onOpen={onOpenTopic}
      />
    </section>
  );
}
