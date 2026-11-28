# Synapz: frontend web

App del alumno y del profesor. React 19, Vite, TypeScript estricto, Tailwind CSS v4, `recharts` y `lucide-react`. Se despliega en Vercel con `frontend/web` como raíz del proyecto.

La estructura y las reglas de modularidad están en [`../../ARCHITECTURE.md`](../../ARCHITECTURE.md), el diseño en [`DESIGN.md`](./DESIGN.md) y los contratos de datos en [`../../API_CONTRACT.md`](../../API_CONTRACT.md).

## Comandos

```bash
pnpm install
pnpm run dev    # servidor de desarrollo
pnpm build      # tsc -b && vite build
pnpm lint       # eslint
```

## Variables de entorno

Copia `.env.example` a `.env`. Vite incrusta estas variables al compilar: en Vercel, defínelas antes del build y vuelve a desplegar al cambiarlas.

| Variable                    | Uso                                                                                                  |
| --------------------------- | ---------------------------------------------------------------------------------------------------- |
| `VITE_API_URL`              | URL del backend en Render, sin barra final ni `/api` (por ejemplo `https://api.synapz.app`)          |
| `VITE_FOUNDATHYON_AUTH_URL` | Endpoint de Foundathyon Auth (`https://api.foundathyon.com`) para iniciar sesión con Google o correo |
| `VITE_DEMO_MODE`            | `true` activa los accesos rápidos de demostración. Debe ser `false` en producción                    |

## Datos y autenticación

- El frontend **no usa `supabase-js`** ni se conecta a ninguna base de datos. Todo dato pasa por el backend (`src/services/`, único lugar con `fetch`).
- El inicio de sesión es con Foundathyon Auth. El token de sesión viaja al backend como `Authorization: Bearer <token>`, y el backend decide el rol y los permisos.
- Los archivos (material del profesor y audios) los sube y firma el backend. El navegador no habla con Supabase.
- Nunca pongas `DATABASE_URL`, `SUPABASE_URL` ni `SUPABASE_SERVICE_ROLE_KEY` en este proyecto: son del backend.
- Hoy `src/services/auth.ts` es una simulación y varios servicios (`mock*.ts`) devuelven datos de ejemplo. Se sustituyen por llamadas reales al backend sin cambiar los componentes.
