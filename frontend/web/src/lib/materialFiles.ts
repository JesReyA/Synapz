export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

/** Mismas reglas que el backend (API_CONTRACT.md §2.1): PDF o PPTX, máximo 20 MB. Devuelve el error o null. */
export function validateMaterialFile(file: File): string | null {
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext !== "pdf" && ext !== "pptx") return "Solo se aceptan archivos .pdf y .pptx.";
  if (file.size > MAX_UPLOAD_BYTES) return "El archivo supera los 20 MB.";
  return null;
}