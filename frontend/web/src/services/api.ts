/**
 * URL base del backend. Variable de entorno: `VITE_API_URL`
 * (`VITE_API_BASE_URL` se acepta por compatibilidad con configuraciones anteriores).
 *
 * Vite incrusta el valor al compilar: en producción hay que definirla antes del build y volver a desplegar.
 * Se quitan la barra final y un `/api` final, porque las rutas ya empiezan por `/api`.
 */
const raw: unknown = import.meta.env.VITE_API_URL ?? import.meta.env.VITE_API_BASE_URL ?? "";

export const API_URL: string = String(raw)
  .trim()
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");