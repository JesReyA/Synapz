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

---

## 6. Sudoku de Retos (9×9)

Componentes: `LogicSudokuCard`, `SudokuBoard` y `SudokuPalette` en `src/components/challenges/`. Esta sección fija los colores y las señales visuales del tablero. Los colores de las secciones 3.x no se usan para los dígitos.

### 6.1 Fuente única de la paleta

- Los colores de los 9 números viven solo en `src/lib/sudokuPalette.ts`, en el mapa `DIGIT_STYLES: Record<SudokuDigit, DigitStyle>`. Cada entrada tiene tres cadenas: `cell`, `button` y `buttonActive`. El mismo archivo exporta `SELECTED_CELL`, el gris de selección (ver 6.2).
- Las clases se escriben **completas y literales**. No se arman con plantillas (`bg-${tono}-200`), porque Tailwind v4 solo genera las clases que aparecen como texto en el código. Los componentes no repiten clases de color: leen `DIGIT_STYLES[n]`.
- Para cambiar un tono se edita ese archivo y se vuelve a medir el contraste (ver 6.4).

### 6.2 Tonos por número

Mientras la partida no está resuelta, las casillas del tablero tienen tres aspectos posibles. El resaltado solo afecta a las casillas cuyo valor es el número activo (el seleccionado en la paleta). Cuando la partida se resuelve rige un cuarto estado, que ignora el número activo:

| Situación                                                                 | Aspecto de las casillas                                                 |
| ------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Ningún número seleccionado (partida sin resolver)                         | Todo el tablero en blanco (`bg-white dark:bg-[#161E30]`), pistas incluidas |
| Número seleccionado y aún incompleto (partida sin resolver)               | Casillas con ese número en gris de selección `SELECTED_CELL`            |
| Número seleccionado y completo (sus 9 casillas correctas según la solución) | Casillas con ese número en el color del número, `DIGIT_STYLES[n].cell`  |
| **Partida resuelta** (tablero completo y sin conflictos)                  | **Todas** las casillas a la vez, cada una con el color de su propio número, `DIGIT_STYLES[n].cell`. Sin gris de selección y sin importar el número activo |

- Un número completo que no está seleccionado queda en blanco, igual que los demás, salvo en la partida resuelta (ver 6.8).
- Al seleccionar otro número desaparece todo el resaltado anterior, gris o color, y solo se resalta el nuevo.
- Volver a tocar el número seleccionado lo desactiva y todo el tablero vuelve a blanco.
- Al colocar o borrar un número, el resaltado cambia de inmediato entre gris y color según el número esté completo o no.

Gris de selección (`SELECTED_CELL`), para las casillas del número seleccionado que aún no está completo:

```
bg-slate-300 text-slate-900 dark:bg-slate-500/50 dark:text-white
```

Casilla del tablero cuando su valor es el número seleccionado y está completo (`DIGIT_STYLES[n].cell`):

| Dígito | Tono    | Casilla resaltada, claro                | Casilla resaltada, oscuro                    |
| ------ | ------- | --------------------------------------- | -------------------------------------------- |
| 1      | blue    | `bg-blue-200 text-slate-900`            | `dark:bg-blue-400/40 dark:text-white`        |
| 2      | orange  | `bg-orange-200 text-slate-900`          | `dark:bg-orange-400/40 dark:text-white`      |
| 3      | emerald | `bg-emerald-200 text-slate-900`         | `dark:bg-emerald-400/40 dark:text-white`     |
| 4      | violet  | `bg-violet-200 text-slate-900`          | `dark:bg-violet-400/40 dark:text-white`      |
| 5      | yellow  | `bg-yellow-200 text-slate-900`          | `dark:bg-yellow-400/40 dark:text-white`      |
| 6      | pink    | `bg-pink-200 text-slate-900`            | `dark:bg-pink-400/40 dark:text-white`        |
| 7      | cyan    | `bg-cyan-200 text-slate-900`            | `dark:bg-cyan-400/40 dark:text-white`        |
| 8      | red     | `bg-red-200 text-slate-900`             | `dark:bg-red-400/40 dark:text-white`         |
| 9      | lime    | `bg-lime-200 text-slate-900`            | `dark:bg-lime-400/40 dark:text-white`        |

Botones de la paleta inferior. Conservan siempre su color, estén o no completos los números (`button` en reposo y `buttonActive` cuando el número está activo):

| Dígito | Tono    | Botón en reposo                                                                                      | Botón activo                                                                                          |
| ------ | ------- | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 1      | blue    | `bg-blue-100 border border-blue-300 text-slate-900 dark:bg-blue-400/20 dark:border-blue-400/50 dark:text-white`             | `bg-blue-200 ring-2 ring-blue-500 scale-110 text-slate-900 dark:bg-blue-400/40 dark:ring-blue-300 dark:text-white`             |
| 2      | orange  | `bg-orange-100 border border-orange-300 text-slate-900 dark:bg-orange-400/20 dark:border-orange-400/50 dark:text-white`     | `bg-orange-200 ring-2 ring-orange-500 scale-110 text-slate-900 dark:bg-orange-400/40 dark:ring-orange-300 dark:text-white`     |
| 3      | emerald | `bg-emerald-100 border border-emerald-300 text-slate-900 dark:bg-emerald-400/20 dark:border-emerald-400/50 dark:text-white` | `bg-emerald-200 ring-2 ring-emerald-500 scale-110 text-slate-900 dark:bg-emerald-400/40 dark:ring-emerald-300 dark:text-white` |
| 4      | violet  | `bg-violet-100 border border-violet-300 text-slate-900 dark:bg-violet-400/20 dark:border-violet-400/50 dark:text-white`     | `bg-violet-200 ring-2 ring-violet-500 scale-110 text-slate-900 dark:bg-violet-400/40 dark:ring-violet-300 dark:text-white`     |
| 5      | yellow  | `bg-yellow-100 border border-yellow-300 text-slate-900 dark:bg-yellow-400/20 dark:border-yellow-400/50 dark:text-white`     | `bg-yellow-200 ring-2 ring-yellow-500 scale-110 text-slate-900 dark:bg-yellow-400/40 dark:ring-yellow-300 dark:text-white`     |
| 6      | pink    | `bg-pink-100 border border-pink-300 text-slate-900 dark:bg-pink-400/20 dark:border-pink-400/50 dark:text-white`             | `bg-pink-200 ring-2 ring-pink-500 scale-110 text-slate-900 dark:bg-pink-400/40 dark:ring-pink-300 dark:text-white`             |
| 7      | cyan    | `bg-cyan-100 border border-cyan-300 text-slate-900 dark:bg-cyan-400/20 dark:border-cyan-400/50 dark:text-white`             | `bg-cyan-200 ring-2 ring-cyan-500 scale-110 text-slate-900 dark:bg-cyan-400/40 dark:ring-cyan-300 dark:text-white`             |
| 8      | red     | `bg-red-100 border border-red-300 text-slate-900 dark:bg-red-400/20 dark:border-red-400/50 dark:text-white`                 | `bg-red-200 ring-2 ring-red-500 scale-110 text-slate-900 dark:bg-red-400/40 dark:ring-red-300 dark:text-white`                 |
| 9      | lime    | `bg-lime-100 border border-lime-300 text-slate-900 dark:bg-lime-400/20 dark:border-lime-400/50 dark:text-white`             | `bg-lime-200 ring-2 ring-lime-500 scale-110 text-slate-900 dark:bg-lime-400/40 dark:ring-lime-300 dark:text-white`             |

Se evita `rose` y cualquier rojo cercano al indicador de conflicto como señal de error. El dígito 8 usa `red` solo como color de número. El conflicto se marca con un contorno (ver 6.5).

### 6.3 Pista y casilla del jugador

Todas las casillas empiezan con el mismo fondo blanco, pistas incluidas. Las pistas **no llevan fondo gris**. Se distinguen de las casillas del jugador por el peso de fuente y el color de texto. Un número resaltado (6.2) sustituye el fondo y el color de texto de la casilla, pero conserva el peso de fuente.

| Tipo de casilla     | Peso          | Fondo, claro | Fondo, oscuro       | Texto, claro     | Texto, oscuro        |
| ------------------- | ------------- | ------------ | ------------------- | ---------------- | -------------------- |
| Pista               | `font-bold`   | `bg-white`   | `dark:bg-[#161E30]` | `text-slate-900` | `dark:text-white`    |
| Casilla del jugador | `font-normal` | `bg-white`   | `dark:bg-[#161E30]` | `text-blue-700`  | `dark:text-blue-300` |

`#161E30` es el fondo de la sub-tarjeta de la sección 3.1. Las líneas de los bloques 3×3 son `border-slate-700 dark:border-slate-400` (2 px). Las líneas internas son `border-slate-200 dark:border-[#2A3347]` (1 px).

### 6.4 Contraste

Se midieron los pares de texto y fondo de cada número con la relación de contraste de WCAG. Los 54 pares superan 4.5:1 (AA para texto normal). El mínimo es **5.93:1**, en el dígito 9 (lime) en modo oscuro.

| Elemento                             | Modo claro                        | Modo oscuro                           |
| ------------------------------------ | --------------------------------- | ------------------------------------- |
| Casilla resaltada y botón activo     | fondo `{tono}-200`                | fondo `{tono}-400/40`                 |
| Botón en reposo                      | fondo `{tono}-100`                | fondo `{tono}-400/20`                 |
| Texto de todos los anteriores        | `text-slate-900`                  | `dark:text-white`                     |

Gris de selección (`SELECTED_CELL`), 2 pares adicionales:

| Par                                                                  | Relación de contraste |
| -------------------------------------------------------------------- | --------------------- |
| Modo claro: `text-slate-900` sobre `bg-slate-300`                    | **12.02:1**           |
| Modo oscuro: `text-white` sobre `bg-slate-500/50` mezclado sobre `#161E30` | **9.09:1**      |

Con estos dos pares son 56 pares medidos, todos por encima de 4.5:1. El mínimo global sigue siendo 5.93:1.

El estado de partida resuelta (6.8) reutiliza `DIGIT_STYLES[n].cell` en todas las casillas. Por eso no añade pares: sigue valiendo el mínimo de 5.93:1.

En modo oscuro el fondo con opacidad se mezcla sobre la superficie de la casilla o de la tarjeta. Si se cambia un tono o una opacidad, hay que repetir la medición y mantener el mínimo de 4.5:1.

### 6.5 Indicador de conflicto

- Una casilla que repite un número en su fila, columna o bloque lleva un contorno punteado: `outline-2 -outline-offset-2 outline-dashed outline-slate-900 dark:outline-white`.
- El indicador **no depende del color** (es forma y trazo) y **no usa ningún tono de la paleta de dígitos**, así que no se confunde con el resaltado de un número.
- Se combina con el fondo de la casilla sin reemplazarlo. El `aria-label` de la casilla añade "en conflicto".

### 6.6 Estado activo de la paleta

- El botón del número activo cambia de más de una forma además del color: anillo (`ring-2` con el tono 500 en claro y 300 en oscuro), `scale-110` y fondo más intenso.
- El botón lleva `aria-pressed` (`true` solo en el activo) y `aria-label="Número N"`.
- Los botones miden al menos 36 px de lado. Tocar el número activo lo desactiva (queda sin ninguno activo).

### 6.7 Mecánica de toque

- No hay botón de borrar. Se borra tocando de nuevo con el mismo número activo.
- Con un número activo, un toque en una casilla del jugador hace una sola de estas cosas:
  - casilla vacía: coloca el número;
  - casilla con ese mismo número: la deja vacía;
  - casilla con otro número: lo reemplaza por el activo.
- Las pistas nunca cambian. Sin número activo, tocar una casilla no hace nada.
- Todas las casillas con el número activo se resaltan, pistas incluidas: en gris si el número aún no está completo y con su color si ya lo está (ver 6.2). Esta regla rige solo mientras la partida no está resuelta; al resolverla se aplica 6.8.

### 6.8 Partida resuelta

- La partida está resuelta cuando el tablero queda completo y sin conflictos (`solved` en `useSudoku`).
- En ese momento **todas** las casillas se pintan a la vez y cada una usa el color de su propio número, `DIGIT_STYLES[n].cell` (por ejemplo, un 1 lleva `bg-blue-200 text-slate-900 dark:bg-blue-400/40 dark:text-white`). Es la única excepción a la regla "el color solo aparece con el número completo y seleccionado" de 6.2.
- No se usa el gris de selección (`SELECTED_CELL`) en ninguna casilla, y el resultado no depende del número activo: es igual con cualquier número seleccionado o con ninguno.
- Esta prioridad se aplica antes que el resaltado por número activo (en `SudokuBoard.tsx`, la condición `solved && isDigit(value)` se evalúa primero). El peso de fuente se conserva: pistas en `font-bold`, casillas del jugador en `font-normal`.
- Los toques en el tablero y en la paleta quedan deshabilitados (`disabled`) y las teclas 1 a 9 se ignoran. El reloj se detiene y el botón "Nueva partida" pasa a estilo primario.
- "Nueva partida" o cambiar de dificultad generan otro tablero sin resolver, que vuelve a las reglas de blanco, gris y color de 6.2.
- Contraste: los colores usados son los mismos 18 pares de `DIGIT_STYLES[n].cell` ya medidos en 6.4 (9 dígitos, 2 temas, mínimo 5.93:1). No hay pares nuevos que medir.
