import { useState } from "react";
import { Check, Copy, FileUp, Plus } from "lucide-react";
import { CreateClassAndMaterialModal } from "../../components/teacher/CreateClassAndMaterialModal.tsx";
import { KIND_LABEL, STATUS_META, formatChars, formatLongDate } from "../../lib/teacherLabels.ts";
import type {
  CreateClassroomInput,
  CreateTopicInput,
  TeacherClassroomSummary,
  TeacherTopic,
  UploadMaterialResponse,
} from "../../types/teacher.ts";

interface TeacherClassesPageProps {
  classrooms: TeacherClassroomSummary[];
  topics: Record<string, TeacherTopic[]>;
  onCreateClassroom: (input: CreateClassroomInput) => Promise<TeacherClassroomSummary>;
  onAddTopic: (classroomId: string, input: CreateTopicInput) => Promise<TeacherTopic>;
  onUploadMaterial: (classroomId: string, topicId: string, file: File) => Promise<UploadMaterialResponse>;
}

type Dialog = { mode: "closed" } | { mode: "create" } | { mode: "manage"; classroomId: string };

function CodeChip({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }
  return (
    <button
      type="button"
      onClick={() => void copy()}
      aria-label={`Copiar código de invitación ${code}`}
      className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-200 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none dark:bg-[#1B2438] dark:text-slate-200 dark:hover:bg-[#222d47]"
    >
      {copied ? <Check className="size-3.5" strokeWidth={2.5} /> : <Copy className="size-3.5" strokeWidth={2} />}
      <span className="tracking-widest">{code}</span>
    </button>
  );
}

export function TeacherClassesPage({ classrooms, topics, onCreateClassroom, onAddTopic, onUploadMaterial }: TeacherClassesPageProps) {
  const [dialog, setDialog] = useState<Dialog>({ mode: "closed" });
  const managed = dialog.mode === "manage" ? (classrooms.find((c) => c.id === dialog.classroomId) ?? null) : null;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Tus aulas ({classrooms.length})</h2>
        <button
          type="button"
          onClick={() => setDialog({ mode: "create" })}
          className="inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-5 py-2.5 text-sm font-semibold text-slate-900 transition-colors duration-150 hover:bg-amber-300 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none dark:focus-visible:ring-offset-[#0B0F1A]"
        >
          <Plus className="size-4" strokeWidth={2} />
          Nueva aula
        </button>
      </div>

      {classrooms.map((c) => {
        const list = topics[c.id] ?? [];
        return (
          <section
            key={c.id}
            aria-label={c.name}
            className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#222B3E] dark:bg-[#131A29] dark:shadow-none"
          >
            <header className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{c.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {c.grade_group} · {c.student_count} alumnos
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <CodeChip code={c.invite_code} />
                <button
                  type="button"
                  onClick={() => setDialog({ mode: "manage", classroomId: c.id })}
                  className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-600 transition-colors duration-150 hover:bg-blue-100 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none dark:bg-[#1B2438] dark:text-blue-100 dark:hover:bg-[#222d47]"
                >
                  <FileUp className="size-3.5" strokeWidth={1.75} />
                  Temario y material
                </button>
              </div>
            </header>

            {list.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-300 p-5 text-center text-sm text-slate-600 dark:border-[#2A3347] dark:text-slate-300">
                Esta aula aún no tiene temas.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[40rem] text-left text-sm">
                  <thead>
                    <tr className="text-xs text-slate-500 dark:text-slate-400">
                      <th scope="col" className="pb-2 font-medium">Tema</th>
                      <th scope="col" className="pb-2 font-medium">Tipo</th>
                      <th scope="col" className="pb-2 font-medium">Fecha</th>
                      <th scope="col" className="pb-2 font-medium">Estado</th>
                      <th scope="col" className="pb-2 font-medium">Material para Feyn</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((t) => {
                      const status = STATUS_META[t.status];
                      const chars = t.material_files.reduce((s, f) => s + f.chars, 0);
                      return (
                        <tr key={t.id} className="border-t border-slate-100 align-top dark:border-[#222B3E]">
                          <td className="py-2.5 pr-3 font-medium text-slate-900 dark:text-white">{t.title}</td>
                          <td className="py-2.5 pr-3 text-xs text-slate-600 dark:text-slate-300">{KIND_LABEL[t.kind]}</td>
                          <td className="py-2.5 pr-3 text-xs text-slate-600 dark:text-slate-300">{formatLongDate(t.scheduled_date)}</td>
                          <td className="py-2.5 pr-3">
                            <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${status.tone}`}>{status.label}</span>
                          </td>
                          <td className="py-2.5 text-xs">
                            {t.material_files.length === 0 ? (
                              <span className="text-orange-600 dark:text-amber-400">Sin material</span>
                            ) : (
                              <span className="text-emerald-600 dark:text-emerald-400">
                                {t.material_files.length} archivo(s) · {formatChars(chars)} caracteres
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        );
      })}

      {dialog.mode !== "closed" && (
        <CreateClassAndMaterialModal
          classroom={managed}
          topicsByClassroom={topics}
          onClose={() => setDialog({ mode: "closed" })}
          onCreateClassroom={onCreateClassroom}
          onAddTopic={onAddTopic}
          onUploadMaterial={onUploadMaterial}
        />
      )}
    </>
  );
}
