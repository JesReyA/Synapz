import { useId, useRef, useState } from "react";
import type { DragEvent } from "react";
import { AlertTriangle, CheckCircle2, FileUp, Loader2 } from "lucide-react";
import { formatChars } from "../../lib/teacherLabels.ts";
import { validateMaterialFile } from "../../lib/materialFiles.ts";
import type { UploadItem, UploadMaterialResponse } from "../../types/teacher.ts";

interface MaterialDropzoneProps {
  topicTitle: string;
  onUpload: (file: File) => Promise<UploadMaterialResponse>;
}

/** Zona para arrastrar PDF y PPTX de un tema y ver el estado de la extracción de texto. */
export function MaterialDropzone({ topicTitle, onUpload }: MaterialDropzoneProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [items, setItems] = useState<UploadItem[]>([]);

  function patch(key: string, change: Partial<UploadItem>) {
    setItems((prev) => prev.map((it) => (it.key === key ? { ...it, ...change } : it)));
  }

  function handleFiles(list: FileList | null) {
    if (!list) return;
    for (const file of Array.from(list)) {
      const key = crypto.randomUUID();
      const invalid = validateMaterialFile(file);
      if (invalid) {
        setItems((prev) => [...prev, { key, filename: file.name, status: "error", message: invalid }]);
        continue;
      }
      setItems((prev) => [...prev, { key, filename: file.name, status: "uploading" }]);
      onUpload(file)
        .then((res) => patch(key, { status: "done", chars: res.extracted_chars, warnings: res.warnings }))
        .catch((err: unknown) =>
          patch(key, { status: "error", message: err instanceof Error ? err.message : "No se pudo subir el archivo." }),
        );
    }
  }

  function onDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setOver(false);
    handleFiles(e.dataTransfer.files);
  }

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={inputId}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={onDrop}
        className={`flex cursor-pointer flex-col items-center gap-1 rounded-2xl border-2 border-dashed px-4 py-4 text-center text-xs transition-colors duration-150 focus-within:ring-2 focus-within:ring-blue-500 ${
          over
            ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-500/10"
            : "border-slate-300 bg-slate-50 hover:border-slate-400 dark:border-[#2A3347] dark:bg-[#161E30] dark:hover:border-[#3a4663]"
        }`}
      >
        <FileUp className="size-5 text-slate-500 dark:text-slate-400" strokeWidth={1.75} />
        <span className="font-semibold text-slate-700 dark:text-slate-200">Arrastra PDF o PPTX aquí o haz clic para elegir</span>
        <span className="text-slate-500 dark:text-slate-400">Máximo 20 MB por archivo</span>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          multiple
          accept=".pdf,.pptx,application/pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation"
          aria-label={`Subir material de ${topicTitle}`}
          className="sr-only"
          onChange={(e) => {
            handleFiles(e.target.files);
            if (inputRef.current) inputRef.current.value = "";
          }}
        />
      </label>

      {items.length > 0 && (
        <ul className="flex flex-col gap-1.5" aria-live="polite">
          {items.map((it) => (
            <li key={it.key} className="flex items-start gap-2 text-xs">
              {it.status === "uploading" && <Loader2 className="mt-0.5 size-4 shrink-0 animate-spin text-blue-500" />}
              {it.status === "done" && (it.chars ?? 0) > 0 && (
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500 dark:text-emerald-400" strokeWidth={2} />
              )}
              {(it.status === "error" || (it.status === "done" && (it.chars ?? 0) === 0)) && (
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-orange-500 dark:text-amber-400" strokeWidth={2} />
              )}
              <span className="min-w-0 text-slate-700 dark:text-slate-300">
                <strong className="font-semibold break-all text-slate-900 dark:text-white">{it.filename}</strong>
                {" · "}
                {it.status === "uploading" && "Extrayendo texto para Feyn…"}
                {it.status === "done" && (it.chars ?? 0) > 0 && `Texto extraído: ${formatChars(it.chars ?? 0)} caracteres. Feyn ya puede usarlo.`}
                {it.status === "done" && (it.chars ?? 0) === 0 && (it.warnings?.[0] ?? "Sin texto extraíble.")}
                {it.status === "error" && it.message}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
