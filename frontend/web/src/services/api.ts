/** URL base del backend (`VITE_API_BASE_URL`), sin barra final. Vacía si no está configurada. */
export const API_URL: string = String(import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/+$/, "");
