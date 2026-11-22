# Reglas permanentes de Synapz

- **Estructura:** monorepo con `frontend/web/` (React) y `backend/` (FastAPI). No mezclar código ni dependencias entre ambos. Ver `ARCHITECTURE.md`.
- **TypeScript siempre:** archivos `.tsx` / `.ts`. Prohibido `.jsx` y el tipo `any` (usar `unknown`).
- **Diseño:** respetar `frontend/web/DESIGN.md` (tokens, tipografía, layout, logos `public/synapz.png` y `public/feyn.png`). Tailwind v4 con modo oscuro por clase `.dark`. Iconos solo de `lucide-react`, gráficas solo de `recharts`.
- **Componentes pequeños:** dividir cada pantalla en componentes de `src/components/`. Las páginas van en `src/pages/`, la red en `src/services/`, la lógica de estado en `src/hooks/` y los tipos en `src/types/`.
- **API tipada:** toda respuesta del backend se tipa según `API_CONTRACT.md`. Si hay que cambiar un contrato, se edita primero ese archivo y después `src/types/` y `backend/app/schemas/`.
- **Regla de Oro de IA:** Feyn nunca inventa el contenido del curso. Todo se ancla al material del profesor y las respuestas incluyen `grounding`.
- **Requisitos:** consultar `requirements.md`. No construir lo marcado como FASE 2 sin que el usuario lo pida.
- **Backend:** routers delgados, lógica en `services/`, modelos Pydantic v2 en `schemas/`, secretos solo en variables de entorno.
- **Seguridad:** nunca exponer `service_role` ni `GEMINI_API_KEY` en el frontend. RLS activo en todas las tablas.
