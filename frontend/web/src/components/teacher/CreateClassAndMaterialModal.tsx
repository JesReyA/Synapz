import { useState } from "react";
import type { FormEvent } from "react";
import { Check, Copy, FilePlus2, Loader2, Plus } from "lucide-react";
import { KIND_LABEL, STATUS_META, formatChars, formatLongDate } from "../../lib/teacherLabels.ts";
import type {
  CreateClassroomInput,
  CreateTopicInput,
  SubjectArea,
  TeacherClassroomSummary,
  TeacherTopic,
  TopicKind,
  UploadMaterialResponse,
} from "../../types/teacher.ts";
import { Modal } from "../classes/Modal.tsx";
import { MaterialDropzone } from "./MaterialDropzone.tsx";

interface CreateClassAndMaterialModalProps {
  /** Aula existente para gestionar su temario. Si es null, el modal empieza creando un aula. */
  classroom: TeacherClassroomSummary | null;
  topicsByClassroom: Record<string, TeacherTopic[]>;
  onClose: () => void;
  onCreateClassroom: (input: CreateClassroomInput) => Promise<TeacherClassroomSummary>;
  onAddTopic: (classroomId: string, input: CreateTopicInput) => Promise<TeacherTopic>;
  onUploadMaterial: (classroomId: string, topicId: string, file: File) => Promise<UploadMaterialResponse>;
}

const AREAS: { id: SubjectArea; label: string }[] = [
  { id: "math", label: "Matemáticas" },
  { id: "reading", label: "Comprensión lectora" },
  { id: "science", label: "Ciencias" },
];

const FIELD =
  "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none dark:border-[#2A3347] dark:bg-[#161E30] dark:text-white";

const PRIMARY =
  "inline-flex items-center justify-center gap-2 rounded-full bg-amber-400 px-5 py-2.5 text-sm font-semibold text-slate-900 transition-colors duration-150 hover:bg-amber-300 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-50 dark:focus-visible:ring-offset-[#131A29]";

function InviteCode({ code }: { code: string }) {
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
    <div className="flex items-center gap-2 rounded-2xl bg-amber-50 p-3 dark:bg-amber-400/10">
      <div className="min-w-0 flex-1">
        <p className="text-xs text-slate-600 dark:text-slate-300">Código de invitación para tus alumnos</p>
        <code className="text-xl font-bold tracking-[0.3em] text-slate-900 dark:text-white">{code}</code>
      </div>
      <button
        type="button"
        onClick={() => void copy()}
        aria-label="Copiar código de invitación"
        className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-50 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none dark:bg-[#1B2438] dark:text-blue-100"
      >
        {copied ? <Check className="size-3.5" strokeWidth={2.5} /> : <Copy className="size-3.5" strokeWidth={2} />}
        {copied ? "Copiado" : "Copiar"}
      </button>
    </div>
  );
}

function TopicCard({
  topic,
  onUpload,
}: {
  topic: TeacherTopic;
  onUpload: (file: File) => Promise<UploadMaterialResponse>;
}) {
  const status = STATUS_META[topic.status];
  const chars = topic.material_files.reduce((s, f) => s + f.chars, 0);
  return (
    <li className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-[#222B3E] dark:bg-[#161E30]">
      <div className="flex flex-wrap items-center gap-2">
        <h4 className="min-w-0 flex-1 text-sm font-semibold text-slate-900 dark:text-white">{topic.title}</h4>
        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            topic.kind === "cycle"
              ? "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300"
              : "bg-orange-100 text-orange-700 dark:bg-amber-900/40 dark:text-amber-300"
          }`}
        >
          {KIND_LABEL[topic.kind]}
        </span>
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${status.tone}`}>{status.label}</span>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        {formatLongDate(topic.scheduled_date)} ·{" "}
        {topic.material_files.length === 0
          ? "Sin material: Feyn no generará lecciones ni evaluaciones de este tema."
          : `${topic.material_files.length} archivo(s) · ${formatChars(chars)} caracteres para Feyn`}
      </p>
      {topic.material_files.length > 0 && (
        <ul className="flex flex-col gap-1 text-xs text-slate-600 dark:text-slate-300">
          {topic.material_files.map((f) => (
            <li key={f.id} className="flex items-center justify-between gap-2">
              <span className="min-w-0 truncate">{f.filename}</span>
              <span className={f.chars > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-orange-600 dark:text-amber-400"}>
                {f.chars > 0 ? `${formatChars(f.chars)} caracteres` : "Sin texto extraíble"}
              </span>
            </li>
          ))}
        </ul>
      )}
      <MaterialDropzone topicTitle={topic.title} onUpload={onUpload} />
    </li>
  );
}

export function CreateClassAndMaterialModal({
  classroom,
  topicsByClassroom,
  onClose,
  onCreateClassroom,
  onAddTopic,
  onUploadMaterial,
}: CreateClassAndMaterialModalProps) {
  const [created, setCreated] = useState<TeacherClassroomSummary | null>(null);
  const active = classroom ?? created;

  const [name, setName] = useState("");
  const [area, setArea] = useState<SubjectArea>("math");
  const [group, setGroup] = useState("");
  const [creating, setCreating] = useState(false);

  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<TopicKind>("cycle");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [adding, setAdding] = useState(false);

  async function submitClassroom(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !group.trim() || creating) return;
    setCreating(true);
    const subject = AREAS.find((a) => a.id === area)?.label ?? "";
    setCreated(await onCreateClassroom({ name: name.trim(), subject, subject_area: area, grade_group: group.trim() }));
    setCreating(false);
  }

  async function submitTopic(e: FormEvent) {
    e.preventDefault();
    if (!active || !title.trim() || !date || adding) return;
    setAdding(true);
    await onAddTopic(active.id, { title: title.trim(), kind, scheduled_date: date });
    setTitle("");
    setAdding(false);
  }

  const topics = active ? (topicsByClassroom[active.id] ?? []) : [];

  return (
    <Modal
      wide
      title={active ? `Temario y material: ${active.name}` : "Nueva aula"}
      description={
        active
          ? "Añade temas del ciclo y temas de nivelación, y sube su material. Feyn solo usa lo que subas."
          : "Crea el aula y comparte el código con tus alumnos."
      }
      onClose={onClose}
    >
      {!active ? (
        <form onSubmit={(e) => void submitClassroom(e)} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
            Nombre del aula
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Matemáticas 6.º B" className={FIELD} />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
              Materia
              <select value={area} onChange={(e) => setArea(e.target.value as SubjectArea)} className={FIELD}>
                {AREAS.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
              Grupo
              <input value={group} onChange={(e) => setGroup(e.target.value)} placeholder="6.º B" className={FIELD} />
            </label>
          </div>
          <button type="submit" disabled={!name.trim() || !group.trim() || creating} className={`${PRIMARY} self-start`}>
            {creating ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" strokeWidth={2} />}
            Crear aula
          </button>
        </form>
      ) : (
        <div className="flex flex-col gap-5">
          <InviteCode code={active.invite_code} />

          <form onSubmit={(e) => void submitTopic(e)} className="grid gap-3 rounded-2xl border border-slate-200 p-4 sm:grid-cols-[minmax(0,1fr)_11rem_9rem_auto] sm:items-end dark:border-[#222B3E]">
            <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
              Nuevo tema
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Fracciones y operaciones" className={FIELD} />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
              Tipo
              <select value={kind} onChange={(e) => setKind(e.target.value as TopicKind)} className={FIELD}>
                <option value="cycle">{KIND_LABEL.cycle}</option>
                <option value="prerequisite">{KIND_LABEL.prerequisite}</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
              Fecha
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={FIELD} />
            </label>
            <button type="submit" disabled={!title.trim() || !date || adding} className={PRIMARY}>
              {adding ? <Loader2 className="size-4 animate-spin" /> : <FilePlus2 className="size-4" strokeWidth={1.75} />}
              Añadir
            </button>
          </form>

          {topics.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-600 dark:border-[#2A3347] dark:text-slate-300">
              Aún no hay temas. Añade el primero para subir su material.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {topics.map((t) => (
                <TopicCard key={t.id} topic={t} onUpload={(file) => onUploadMaterial(active.id, t.id, file)} />
              ))}
            </ul>
          )}

          <button type="button" onClick={onClose} className={`${PRIMARY} self-end`}>
            Listo
          </button>
        </div>
      )}
    </Modal>
  );
}
