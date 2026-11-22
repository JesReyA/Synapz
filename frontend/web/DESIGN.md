# DESIGN.md — Synapz (Home del alumno)

Fuente única de verdad para la UI del alumno. Referencia visual: mockup aprobado "Modo Claro / Modo Oscuro" (producto mostrado como **Aula** en el sidebar).
Raíz de la app: `frontend/web/` (donde viven `package.json`, `src/` y `public/`).

---

## 1. Identidad de Marca y Assets (`/public`)

Extensiones verificadas en disco:

| Asset          | Archivo             | URL en código | Tamaño  |
| -------------- | ------------------- | ------------- | ------- |
| Isotipo Synapz | `public/synapz.png` | `/synapz.png` | ~609 KB |
| Isotipo Feyn   | `public/feyn.png`   | `/feyn.png`   | ~1 MB   |

Ambos son **PNG** (no SVG). `public/icons.svg` y `public/favicon.ico` son restos de la plantilla de Vite y no forman parte de la marca.

### 1.1 Synapz (`/synapz.png`)

- Ubicación: parte superior de la barra lateral izquierda, centrado horizontalmente, encima de la navegación.
- Se usa **solo el símbolo geométrico**. Sin texto, wordmark ni subtítulo debajo.
- Render: `<img src="/synapz.png" alt="Synapz" className="size-10 object-contain" />` (40 px; 32 px en sidebar colapsado).
- `alt` obligatorio. Enlaza a `/` (Home).
- No recolorear, no estirar (`object-contain`), no aplicar filtros. Espacio libre mínimo alrededor: 8 px.
- Si el PNG no tiene variante para fondo oscuro y pierde contraste, colocarlo sin fondo extra; no se inventa otro logo. Validar visualmente en ambos temas.

### 1.2 Feyn (`/feyn.png`)

- Ubicación: dentro del botón flotante circular azul (FAB) en la esquina inferior derecha. Representa al asistente de IA.
- Render dentro del botón: `<img src="/feyn.png" alt="" className="size-7 object-contain" />`. El `alt` va vacío porque el nombre accesible lo da el botón: `aria-label="Abrir chat con Feyn"`.
- El botón es `fixed bottom-6 right-6 z-50 size-14 rounded-full bg-blue-500`. El isotipo no debe tocar el borde (padding interno ≥ 12 px).
- Se usa solo para Feyn. No usarlo como decoración ni en otras partes de la UI.
- El PNG pesa ~1 MB para un ícono de 28 px. Optimizar a ≤ 128×128 px (o convertir a WebP/SVG) antes de producción, sin cambiar el nombre base.

---

## 2. Stack UI y Convenciones Técnicas

### 2.1 Tailwind CSS v4

- Plugin: `@tailwindcss/vite`. Sin `tailwind.config.js`. Los tokens se definen en CSS con `@theme`.
- `src/index.css` actual (no modificar la línea del variant):
  ```css
  @import "tailwindcss";
  @custom-variant dark (&:where(.dark, .dark *));
  ```
- Tema manual por clase `.dark` en `<html>`. Persistir la preferencia en `localStorage` (`theme: "light" | "dark"`) y aplicar la clase antes del primer render para evitar parpadeo.
- Se escribe cada utilidad como `clase-claro dark:clase-oscuro`. Prohibido `style={{}}` para color y prohibido CSS suelto fuera de `index.css`.
- Los hex del punto 3 se registran una vez como tokens semánticos en `@theme` (propuesta, aún no aplicada):
  ```css
  @theme {
    --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
    --color-brand: #3b6ef5;
    --color-amber-cta: #f0a94a;
    --color-emerald-progress: #3fae8c;
  }
  ```
- Las clases estándar de Tailwind (`slate`, `blue`, etc.) son válidas. Los tokens personalizados solo cubren colores de marca.

### 2.2 Iconos: `lucide-react`

- Único set de iconos. Tamaño por defecto `size-5` (nav) y `size-4` (acciones en línea), `strokeWidth={1.75}`.
- Mapeo:

| Uso                    | Icono                            |
| ---------------------- | -------------------------------- |
| Inicio                 | `Home`                           |
| Mis clases             | `CalendarDays`                   |
| Aprender               | `Play`                           |
| Retos                  | `Trophy`                         |
| Progreso               | `BarChart3`                      |
| Configuración          | `Settings`                       |
| Notificaciones         | `Bell`                           |
| Selector "Esta semana" | `ChevronDown`                    |
| Botón Continuar        | `Play` (relleno: `fill-current`) |
| Botón Comenzar         | `ArrowRight`                     |
| Racha                  | `Flame`                          |
| Matemáticas            | `Calculator`                     |
| Comprensión lectora    | `BookOpen`                       |
| Ciencias               | `FlaskConical`                   |
| Chispa de "IA"         | `Sparkles`                       |

### 2.3 Gráficas: `recharts`

- Ya instalado (`^3.11`). Solo se usa para datos:
  - **Anillo de porcentaje** (Tu progreso, 74 %): `RadialBarChart` con un `RadialBar` y `startAngle={90} endAngle={-270}`, o `PieChart` con `innerRadius`. Pista en gris/azul tenue, avance en verde esmeralda, `cornerRadius` redondeado. El número va centrado con HTML absoluto, no con `<text>` de SVG.
  - **Barras semanales** (Tu progreso): `BarChart` con `Bar` de `radius={[4,4,0,0]}`, sin ejes, sin grilla, sin leyenda. Azul primario en 7 barras, la barra más alta con mayor opacidad.
- Siempre dentro de `ResponsiveContainer`. El padre debe tener altura explícita.
- Los colores se pasan por `fill` con valores de las constantes de tema, resueltas según `.dark`. Recomendado: leer el tema desde un hook `useTheme()` y elegir la paleta.
- El círculo de fracciones 3/4 de "Continuar aprendiendo" es un `PieChart` de 4 sectores iguales (3 resaltados). Puede ser SVG propio si se prefiere.
- El proyecto usa **TypeScript**, así que los componentes son `.tsx`.

---

## 3. Tokens de Color

Valores aproximados leídos del mockup. Ajustar con un color picker si hace falta.

### 3.1 Superficies y bordes

| Token                      | Claro                         | Tailwind (claro)                             | Oscuro                              | Tailwind (oscuro)                       |
| -------------------------- | ----------------------------- | -------------------------------------------- | ----------------------------------- | --------------------------------------- |
| `bg` (canvas de la app)    | `#FFFFFF`                     | `bg-white`                                   | `#0B0F1A`                           | `dark:bg-[#0B0F1A]`                     |
| `sidebar`                  | `#FFFFFF`                     | `bg-white`                                   | `#0D111C`                           | `dark:bg-[#0D111C]`                     |
| Borde sidebar / divisores  | `#E8ECF2`                     | `border-slate-200`                           | `#1E2535`                           | `dark:border-[#1E2535]`                 |
| `nav-active`               | `#E3EDFF` texto `#2F66E8`     | `bg-blue-100 text-blue-600`                  | `#1E3A8A` al ~60 %, texto `#FFFFFF` | `dark:bg-blue-500/25 dark:text-white`   |
| `nav-idle`                 | texto `#475569`               | `text-slate-600`                             | texto `#B6BED0`                     | `dark:text-slate-300`                   |
| `card`                     | `#FFFFFF`                     | `bg-white`                                   | `#131A29`                           | `dark:bg-[#131A29]`                     |
| Borde de card              | `#E8ECF2`                     | `border border-slate-200`                    | `#222B3E`                           | `dark:border-[#222B3E]`                 |
| Card hero "Continuar"      | degradado `#EAF1FF`→`#DCE8FF` | `bg-gradient-to-br from-blue-50 to-blue-100` | `#16233F`→`#1B2C52`                 | `dark:from-[#16233F] dark:to-[#1B2C52]` |
| Sub-tarjeta (materia)      | `#FFFFFF`                     | `bg-white`                                   | `#161E30`                           | `dark:bg-[#161E30]`                     |
| Pista de barra de progreso | `#E5EAF1`                     | `bg-slate-200`                               | `#2A3347`                           | `dark:bg-[#2A3347]`                     |

### 3.2 Texto

| Rol                                                           | Claro     | Tailwind (claro) | Oscuro    | Tailwind (oscuro)     |
| ------------------------------------------------------------- | --------- | ---------------- | --------- | --------------------- |
| Títulos (saludo, títulos de tarjeta, cifras)                  | `#0F172A` | `text-slate-900` | `#FFFFFF` | `dark:text-white`     |
| Subtítulos / descripciones                                    | `#475569` | `text-slate-600` | `#B6BED0` | `dark:text-slate-300` |
| Etiquetas de apoyo (porcentajes, "Esta semana", "Basada en…") | `#64748B` | `text-slate-500` | `#8B95AB` | `dark:text-slate-400` |

### 3.3 Acentos y semánticos

| Rol                                                            | Claro                            | Tailwind (claro)                        | Oscuro                                  | Tailwind (oscuro)                          |
| -------------------------------------------------------------- | -------------------------------- | --------------------------------------- | --------------------------------------- | ------------------------------------------ |
| Azul primario (FAB Feyn, avatar, barras, "Matemáticas")        | `#3B6EF5`                        | `bg-blue-500`                           | `#4A7BFF`                               | `dark:bg-blue-500`                         |
| Azul tenue (sectores del pie, pista del anillo)                | `#C5D6FB`                        | `bg-blue-200`                           | `#2B3C5E`                               | `dark:bg-[#2B3C5E]`                        |
| Ámbar (botón "Continuar")                                      | `#F0A94A`                        | `bg-amber-400 text-slate-900`           | `#F0A94A`                               | `dark:bg-amber-400` (igual)                |
| Racha (tarjeta)                                                | fondo `#FDE9D3`, llama `#F97316` | `bg-orange-100 text-orange-500`         | fondo `#4A3A2C`, llama `#F59E0B`        | `dark:bg-amber-900/40 dark:text-amber-400` |
| Verde esmeralda (progreso, anillo, barra Matemáticas/Ciencias) | `#3FAE8C`                        | `bg-emerald-500` / `stroke-emerald-500` | `#7AD9A8` (anillo) / `#3FAE8C` (barras) | `dark:bg-emerald-400`                      |
| Materia: Matemáticas                                           | `#3B6EF5`                        | `bg-blue-500`                           | `#4A7BFF`                               | `dark:bg-blue-500`                         |
| Materia: Comprensión lectora                                   | `#8B6CF0`                        | `bg-violet-500`                         | `#8B6CF0`                               | `dark:bg-violet-400`                       |
| Materia: Ciencias                                              | `#3FAE8C` (verde agua)           | `bg-teal-500`                           | `#3FAE8C`                               | `dark:bg-teal-400`                         |
| Chip "IA"                                                      | fondo `#E3EDFF`, texto `#2F66E8` | `bg-blue-100 text-blue-600`             | fondo `#1E3A8A`/40, texto `#8FB1FF`     | `dark:bg-blue-500/20 dark:text-blue-300`   |
| Botón "Comenzar" (secundario)                                  | fondo `#E3EDFF`, texto `#2F66E8` | `bg-blue-50 text-blue-600`              | fondo `#1B2438`, texto `#DCE5FF`        | `dark:bg-[#1B2438] dark:text-blue-100`     |

Notas:

- Los porcentajes del mockup son datos de ejemplo: Matemáticas 72 %, Comprensión lectora 61 %, Ciencias 80 %, Tu progreso 74 %, fracciones 68 % (3/4).
- Contraste del texto del botón ámbar: usar `text-slate-900` y no blanco.
- Cada materia define un objeto `{ icon, accentBg, accentText, bar }` en un único archivo de constantes (`src/lib/subjects.ts`). No se repiten clases en los componentes.

---

## 4. Tipografía, Espaciado y Geometría

### 4.1 Tipografía

Fuente sans geométrica (Inter), cargada con `<link>` en `index.html` o `@fontsource-variable/inter`. Pesos usados: 400, 500, 600, 700.

| Elemento                                                                    | Clases                                                                         |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Saludo "¡Hola, Alex!"                                                       | `text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white` |
| Subtítulo del saludo                                                        | `text-sm text-slate-600 dark:text-slate-300`                                   |
| Título de sección (Continuar aprendiendo, Tu progreso, Recomendado para ti) | `text-sm font-semibold text-slate-900 dark:text-white`                         |
| Título de lección ("Fracciones y operaciones")                              | `text-2xl md:text-3xl font-bold leading-tight`                                 |
| Cifra destacada (74 %, 5 días)                                              | `text-3xl font-bold` (anillo: `text-2xl`)                                      |
| Fracción 3/4                                                                | `text-2xl font-bold tabular-nums`                                              |
| Título de materia                                                           | `text-sm font-semibold`                                                        |
| Cuerpo / descripciones                                                      | `text-sm`                                                                      |
| Etiquetas de apoyo, porcentajes de barras                                   | `text-xs text-slate-500 dark:text-slate-400`                                   |
| Nav del sidebar                                                             | `text-xs font-medium`                                                          |

### 4.2 Espaciado

- Escala de 4 px de Tailwind. Padding de tarjetas: `p-5` (hero `p-6`). Gap entre tarjetas: `gap-4` (`md:gap-5`).
- Padding del contenido principal: `p-4 md:p-6 lg:p-8`.
- Ancho del sidebar: `w-20` (iconos + etiqueta pequeña) en `md`, `w-24` en `lg`.

### 4.3 Geometría y profundidad

- Tarjetas grandes (hero, Tu progreso, Recomendado): `rounded-3xl`. Sub-tarjetas (materias, racha), chips y el banner interno: `rounded-2xl`. Ítem activo del sidebar: `rounded-xl`.
- Botones tipo píldora (Continuar, Comenzar, chip IA, barras de progreso, FAB, avatar): `rounded-full`. Altura de barras de progreso: `h-2`.
- **Modo claro**: bordes finos y sombra suave, `shadow-sm` (tarjetas) y `shadow-lg shadow-blue-500/30` (FAB).
- **Modo oscuro**: sin sombras. La jerarquía sale del contraste entre superficies (`bg` < `card` < sub-tarjeta) y de bordes `1 px` de baja luminosidad. Usar `dark:shadow-none`.
- Transiciones: `transition-colors duration-150` en elementos interactivos. Foco visible con `focus-visible:ring-2 ring-blue-500`.

---

## 5. Arquitectura Modular del Home del Alumno

Ubicación: `src/components/<Nombre>.tsx`. Cada componente recibe datos por props (tipados). Sin fetch dentro de los componentes de presentación. La página `src/pages/StudentHome.tsx` los compone.

### 5.1 Layout de la página

```
┌─────────┬───────────────────────────────────────────┐
│         │ TopHeader (saludo + campana + avatar)     │
│ Sidebar ├───────────────────────────────┬───────────┤
│         │ ContinueLearningCard          │ Progress  │
│         ├───────────────┬───────────────┤ Card      │
│         │ SubjectCardsGrid (3) + Racha  │ (+ Racha) │
│         ├───────────────────────────────┴───────────┤
│         │ RecommendedBanner                         │
└─────────┴───────────────────────────────────────────┘
                                         FeynChatFab ⟶ fixed
```

- Contenedor: `flex min-h-screen bg-white dark:bg-[#0B0F1A]`. Sidebar fijo a la izquierda, `<main>` con `flex-1`.
- Cuerpo del main: `grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_16rem] gap-4`.
  - Columna izquierda: Continuar aprendiendo, fila de materias + Racha, Recomendado.
  - Columna derecha (`lg`): ProgressCard arriba y tarjeta de Racha alineada con la fila de materias.
- Debajo de `lg`, todo en una columna con este orden: Header, Continuar, Progreso, Materias, Racha, Recomendado.

### 5.2 Componentes

**`Sidebar`**

- Contenedor: `hidden md:flex flex-col items-center w-20 lg:w-24 shrink-0 border-r py-5`.
- Arriba: isotipo `/synapz.png` (sin texto).
- Centro: `<nav>` en `flex flex-col gap-1` con 5 ítems (Inicio, Mis clases, Aprender, Retos, Progreso). Ítem: icono + etiqueta, `rounded-xl px-2 py-2`, activo con token `nav-active` y `aria-current="page"`.
- Abajo: `mt-auto` con divisor y "Configuración".
- En móvil (`< md`): se convierte en barra inferior fija `md:hidden fixed inset-x-0 bottom-0 flex justify-around` con los 5 ítems. Configuración pasa al header.

**`TopHeader`**

- `flex items-start justify-between gap-4`.
- Izquierda: `h1` "¡Hola, {nombre}!" y subtítulo "Vamos paso a paso. Hoy tienes nuevas oportunidades para aprender."
- Derecha: botón campana (`Bell`, `aria-label="Notificaciones"`) y avatar circular `size-8 rounded-full bg-blue-500 text-white` con la inicial. Incluye el toggle de tema (`Sun`/`Moon`) a la izquierda de la campana.

**`ContinueLearningCard`**

- Card hero `rounded-3xl p-6` con degradado. Layout: `grid grid-cols-[1fr_auto] gap-4 items-center`; en `< sm` pasa a una columna con el gráfico arriba.
- Izquierda: etiqueta "Continuar aprendiendo", título de la lección, barra de progreso (`flex items-center gap-3`, barra `flex-1`, porcentaje a la derecha) y botón ámbar "Continuar" (`Play`).
- Derecha: pie de 4 sectores (≈ `size-28 md:size-32`) con la fracción `3/4` al lado. Decoración de destellos en ámbar arriba a la derecha (`aria-hidden`).
- Props: `{ title, progress, fraction: [number, number], onContinue }`.

**`ProgressCard`**

- `rounded-3xl p-5 flex flex-col items-center gap-3`. Título "Tu progreso" alineado a la izquierda.
- Anillo de `recharts` (`size-32`) con `74%` al centro, `BarChart` semanal debajo (`h-16 w-full`), y selector "Esta semana" con `ChevronDown` (`self-start text-xs`).
- Props: `{ percent, weekly: number[], range }`.

**`SubjectCardsGrid`**

- `grid grid-cols-1 sm:grid-cols-3 gap-4`. Tarjeta de materia: `rounded-2xl p-4 flex flex-col gap-3`, con icono en cuadrado `size-9 rounded-lg` con el color de la materia, nombre y barra de progreso con porcentaje.
- Ítems: Matemáticas (azul), Comprensión lectora (violeta), Ciencias (verde agua).
- La tarjeta de **Racha** (`Flame`, "Racha de aprendizaje", "5 días") es un componente interno `StreakCard` colocado en la columna derecha en `lg` y como cuarta celda en `< lg` (`col-span-full sm:col-span-1`).
- Props: `{ subjects: { id, name, percent }[] }`. El icono y el color salen de `src/lib/subjects.ts`.

**`RecommendedBanner`**

- Sección `rounded-3xl p-5` con título "Recomendado para ti" y una fila interna: `flex flex-col sm:flex-row sm:items-center gap-4`.
- Miniatura ilustrada `w-full sm:w-32 h-20 rounded-2xl` (azul tenue). Texto: chip "IA ✦", título "Práctica personalizada de fracciones" y "Basada en tus avances y áreas de mejora.". Botón "Comenzar →" `rounded-full` a la derecha (`sm:ml-auto`), pantalla completa en móvil.
- Props: `{ title, reason, onStart }`.

**`FeynChatFab`**

- `<button>` fijo `fixed bottom-6 right-6 z-50 size-14 rounded-full bg-blue-500 grid place-items-center shadow-lg shadow-blue-500/30 hover:bg-blue-600`, con `/feyn.png` dentro y un punto/indicador opcional arriba a la derecha.
- En móvil subir a `bottom-20` para no tapar la barra inferior del Sidebar.
- Props: `{ onClick, hasUnread? }`. Abre el panel de chat (fuera del alcance de este documento).

### 5.3 Reglas generales

- Un componente por archivo, nombre en PascalCase, export nombrado.
- Accesibilidad: landmarks (`aside`, `header`, `main`, `nav`), `aria-label` en botones solo-icono, contraste AA en ambos temas.
- Cualquier pantalla nueva reutiliza `Sidebar`, `TopHeader` y `FeynChatFab` dentro de un `AppLayout` y toma colores solo de la sección 3.
- Cualquier desviación respecto al mockup se discute y se actualiza primero en este documento.
