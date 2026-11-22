import type { FormEvent } from "react";
import { useState } from "react";
import { Eye, BookOpen, Headphones } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { InterestProfile, Modality } from "../../types/classes.ts";
import { Modal } from "./Modal.tsx";
import { TagInput } from "./TagInput.tsx";

interface InterestProfileModalProps {
  initial: InterestProfile | null;
  /** `onboarding`: tras unirse a un aula. `edit`: desde el botón de editar perfil. */
  mode: "onboarding" | "edit";
  /** Si es false, el modal no se puede cerrar hasta guardar. */
  dismissible: boolean;
  onSave: (profile: InterestProfile) => Promise<void>;
  onClose: () => void;
}

const MODALITIES: { id: Modality; label: string; hint: string; icon: LucideIcon }[] = [
  { id: "visual", label: "Visual", hint: "Esquemas, dibujos y pasos", icon: Eye },
  { id: "reading", label: "Lectura", hint: "Textos y ejemplos escritos", icon: BookOpen },
  { id: "auditory", label: "Auditivo", hint: "Narración y canciones", icon: Headphones },
];

const LIKE_SUGGESTIONS = ["Videojuegos", "Minecraft", "Música", "Deportes", "Dibujo", "Cine", "Animales", "Tecnología"];
const HOBBY_SUGGESTIONS = ["Leer", "Fútbol", "Programar", "Bailar", "Cocinar"];
const IMPROVE_SUGGESTIONS = ["Fracciones", "Cálculo mental", "Leer en voz alta", "Concentrarme", "Ortografía"];

export function InterestProfileModal({ initial, mode, dismissible, onSave, onClose }: InterestProfileModalProps) {
  const [likes, setLikes] = useState<string[]>(initial?.likes ?? []);
  const [hobbies, setHobbies] = useState<string[]>(initial?.hobbies ?? []);
  const [daily, setDaily] = useState<string[]>(initial?.daily_activities ?? []);
  const [aspirations, setAspirations] = useState<string[]>(initial?.aspirations ?? []);
  const [improve, setImprove] = useState<string[]>(initial?.improvement_areas ?? []);
  const [modality, setModality] = useState<Modality | null>(initial?.preferred_modality ?? null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    if (likes.length + hobbies.length === 0) {
      setError("Cuéntanos al menos un gusto o pasatiempo.");
      return;
    }
    if (!modality) {
      setError("Elige cómo prefieres aprender.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onSave({
        likes,
        hobbies,
        daily_activities: daily,
        aspirations,
        preferred_modality: modality,
        improvement_areas: improve,
      });
    } catch {
      setError("No pudimos guardar tu perfil. Intenta de nuevo.");
      setBusy(false);
    }
  }

  return (
    <Modal
      wide
      title={mode === "onboarding" ? "Cuéntanos sobre ti" : "Mi perfil de aprendizaje"}
      description="Feyn usará esto para explicarte los temas con ejemplos de lo que te gusta. Puedes cambiarlo cuando quieras."
      {...(dismissible ? { onClose } : {})}
    >
      <form onSubmit={submit} className="flex flex-col gap-5" noValidate>
        <TagInput
          label="Gustos"
          hint="Videojuegos, música, deportes…"
          values={likes}
          onChange={setLikes}
          suggestions={LIKE_SUGGESTIONS}
          placeholder="Escribe y presiona Enter"
        />
        <TagInput
          label="Pasatiempos"
          values={hobbies}
          onChange={setHobbies}
          suggestions={HOBBY_SUGGESTIONS}
          placeholder="¿Qué haces en tu tiempo libre?"
        />
        <TagInput
          label="Actividades de tu día"
          hint="Lo que haces normalmente de lunes a viernes."
          values={daily}
          onChange={setDaily}
          placeholder="Ej. Ir en bici a la escuela"
        />
        <TagInput
          label="Aspiraciones"
          hint="¿Qué quieres ser o lograr?"
          values={aspirations}
          onChange={setAspirations}
          placeholder="Ej. Ser veterinaria"
        />

        <fieldset>
          <legend className="text-sm font-semibold text-slate-900 dark:text-white">
            ¿Cómo prefieres aprender?
          </legend>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
            {MODALITIES.map(({ id, label, hint, icon: Icon }) => {
              const selected = modality === id;
              return (
                <label
                  key={id}
                  className={`flex cursor-pointer flex-col gap-1 rounded-2xl border p-3 transition-colors focus-within:ring-2 focus-within:ring-blue-500 ${
                    selected
                      ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-500/15"
                      : "border-slate-200 hover:bg-slate-50 dark:border-[#2A3347] dark:hover:bg-white/5"
                  }`}
                >
                  <input
                    type="radio"
                    name="modality"
                    value={id}
                    checked={selected}
                    onChange={() => setModality(id)}
                    className="sr-only"
                  />
                  <Icon className="size-5 text-blue-500 dark:text-blue-300" strokeWidth={1.75} />
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">{label}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{hint}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <TagInput
          label="¿Qué sientes que necesitas mejorar?"
          values={improve}
          onChange={setImprove}
          suggestions={IMPROVE_SUGGESTIONS}
          placeholder="Ej. Fracciones"
        />

        {error && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2">
          {dismissible && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none dark:text-slate-300 dark:hover:bg-white/5"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={busy}
            className="rounded-full bg-blue-500 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-600 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-50"
          >
            {busy ? "Guardando…" : "Guardar perfil"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
