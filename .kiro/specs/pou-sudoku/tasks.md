# Implementation Plan: Sudoku clásico 9×9 estilo Pou

## Overview

Todas las rutas son relativas a `Synapz/frontend/web/src/`, salvo que se indique otra cosa. Cada tarea debe terminar con `pnpm build` y `pnpm lint` sin errores, ejecutados en `Synapz/frontend/web`. No se añaden dependencias.

## Tasks

- [x] 1. Eliminar el modo 6×6
  - [x] 1.1 Simplificar tipos y lógica a 9×9
    - En `types/challenges.ts`: quitar `SudokuSize` y `SudokuGeometry`, y dejar `SudokuPuzzle` con `id`, `difficulty`, `cells` y `solution`.
    - En `lib/sudoku.ts`: quitar `SIZES`, `CLUES[6]` y `geometryFor`. Añadir las constantes `SIZE = 9` y `BOX = 3`. Cambiar las firmas a `generatePuzzle(difficulty)` y `findConflicts(values)`. Adaptar `buildSolution`, `countSolutions` y `boxIndex` para usar las constantes.
    - _Requirements: 1.2_
  - [x] 1.2 Adaptar el hook y la tarjeta al tamaño único
    - En `hooks/useSudoku.ts`: quitar `size`, `setSize` y `changeSize`. Generar con `generatePuzzle("facil")`.
    - En `components/challenges/LogicSudokuCard.tsx`: quitar el selector de tamaño y `SIZES`. El teclado numérico lista siempre los números 1 a 9.
    - En `components/challenges/SudokuBoard.tsx`: quitar el mapa `COLS` y `CELL` de 6×6, y usar `grid-cols-9`.
    - Verificar que `grep` de `SudokuSize|SudokuGeometry|geometryFor|SIZES|boxRows|boxCols` en `src/` no devuelve resultados.
    - _Requirements: 1.2_

- [x] 2. Añadir `applyTap` y los tipos del número activo
  - Añadir `SudokuDigit` en `types/challenges.ts`.
  - Añadir `applyTap(values, givens, index, active)` en `lib/sudoku.ts` con la regla del diseño: sin número activo o sobre una pista no cambia nada, si la casilla ya tiene el número activo se borra, en otro caso se coloca o reemplaza. Devuelve la misma referencia cuando no hay cambios.
  - Revisar el código contra las propiedades 1 a 7 del diseño.
  - _Requirements: 2.4, 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 3. Crear la paleta de 9 colores
  - [x] 3.1 Crear `lib/sudokuPalette.ts`
    - Exportar `DIGIT_STYLES: Record<SudokuDigit, DigitStyle>` con clases estáticas de Tailwind para casilla resaltada, botón en reposo y botón activo, en modo claro y oscuro, con los tonos del diseño.
    - _Requirements: 3.2, 3.3, 3.4, 3.6_
  - [x] 3.2 Comprobar el contraste
    - Medir los 18 pares de color de texto y fondo (9 dígitos, 2 temas). Ajustar la intensidad del fondo hasta que todos lleguen a 4.5:1.
    - _Requirements: 3.5_
  - [x] 3.3 Registrar la paleta en `frontend/web/DESIGN.md`
    - Añadir una sección con la tabla de los 9 tonos, el indicador de conflicto y la diferencia entre pistas y casillas del jugador.
    - _Requirements: 3.3_

- [x] 4. Reescribir el hook `useSudoku`
  - Sustituir la celda seleccionada por `activeDigit: SudokuDigit | null`. Exponer `toggleDigit` y `tapCell`, que usa `applyTap` e ignora los toques cuando la partida está resuelta.
  - Exponer `newGame` (misma dificultad) y `changeDifficulty`. Ambos reinician el tablero, `activeDigit` y el temporizador.
  - Conservar `conflicts`, `solved`, `filled` y `elapsed`. Quitar `select`, `setCell` y `moveSelection`.
  - _Requirements: 4.3, 4.4, 5.7, 7.2, 7.4, 7.5, 8.1, 8.2, 8.3_

- [x] 5. Reescribir el tablero y crear la paleta
  - [x] 5.1 Reescribir `components/challenges/SudokuBoard.tsx`
    - Props: `puzzle`, `values`, `activeDigit`, `conflicts`, `disabled` y `onCellTap`.
    - Resaltar con `DIGIT_STYLES[n].cell` las casillas cuyo valor es el número activo, pistas incluidas. Pistas en negrita con fondo gris, casillas del jugador en peso normal y color azul. Conflictos con contorno punteado. Bloques de 3×3 con borde grueso.
    - Foco itinerante con flechas, Enter y Espacio. `aria-label` por casilla con fila, columna, valor o "vacía", pista y conflicto. Tablero visible completo a 320 px.
    - _Requirements: 1.1, 1.3, 1.5, 1.6, 2.1, 2.2, 2.3, 4.1, 4.2, 4.5, 6.1, 6.2, 6.3, 6.4, 9.1, 9.3, 9.5_
  - [x] 5.2 Crear `components/challenges/SudokuPalette.tsx`
    - Nueve botones con `aria-label="Número N"`, `aria-pressed` y el estilo activo (anillo y escala) además del color. Sin botón de borrar.
    - _Requirements: 3.1, 3.7, 5.6, 9.4, 9.5_

- [x] 6. Integrar en `LogicSudokuCard`
  - Montar `SudokuBoard` y `SudokuPalette` con el hook. Quitar el teclado numérico antiguo y el ícono `Delete`.
  - Dejar el selector de dificultad y renombrar el botón a "Nueva partida". Al resolver, pasarlo a `PRIMARY_BUTTON`.
  - Región `aria-live="polite"` con los mensajes de victoria, conflictos y progreso, más la pista "Elige un número para empezar" cuando no hay número activo.
  - Teclas 1 a 9 en el contenedor de la tarjeta llaman a `toggleDigit`.
  - _Requirements: 6.5, 6.6, 7.1, 7.3, 8.2, 8.4, 8.5, 9.2, 9.6, 9.7_

- [x] 7. Actualizar el requisito original
  - En `Synapz/requirements.md`, sección D4 CA5: cambiar "Sudokus 6x6 y 9x9" por "Sudoku 9x9", conservando los niveles, la validación de errores y el temporizador.
  - _Requirements: 1.2_

- [x] 8. Verificación final
  - [x] 8.1 Compilación y lint
    - Ejecutar `pnpm build` y `pnpm lint` en `Synapz/frontend/web` sin errores.
  - [x] 8.2 Medir la generación
    - Medir `generatePuzzle` en los tres niveles. Si alguno supera 1 s, retrasar la generación con `setTimeout` o moverla a un `Worker`.
    - _Requirements: 7.6_
  - [x] 8.3 Revisión manual
    - Seguir la lista manual de la sección Testing Strategy del diseño, en modo claro, modo oscuro y a 320 px de ancho.
    - _Requirements: 1.5, 1.6, 4.1, 4.2, 5.1, 5.2, 5.3, 6.1, 8.1, 8.2_

- [x] 9. Resaltado gris y color solo al completar un número
  - [x] 9.1 Calcular los números completos
    - En `lib/sudoku.ts` añadir `completedDigits(values, solution)`: devuelve el conjunto de dígitos cuyas posiciones en `solution` están todas llenas con ese dígito en `values`.
    - En `hooks/useSudoku.ts` exponer `completedDigits` derivado con `useMemo` de `values` y `puzzle.solution`.
    - _Requirements: 4.3, 4.7_
  - [x] 9.2 Cambiar el resaltado del tablero
    - En `lib/sudokuPalette.ts` añadir `SELECTED_CELL` (gris claro con texto legible, claro y oscuro) y medir su contraste, mínimo 4.5:1.
    - En `components/challenges/SudokuBoard.tsx` añadir la prop `completedDigits` y aplicar: sin número activo, todo en blanco (pistas incluidas, sin fondo gris); con número activo, sus casillas en `SELECTED_CELL`, o en `DIGIT_STYLES[n].cell` si ese número está completo. Las demás casillas siempre en blanco.
    - En `components/challenges/LogicSudokuCard.tsx` pasar `completedDigits` al tablero.
    - _Requirements: 2.3, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_
  - [x] 9.3 Documentar y verificar
    - Actualizar la sección 6 de `frontend/web/DESIGN.md`: casillas en blanco al inicio, gris de selección, color solo al completar y estar seleccionado, y pista sin fondo gris.
    - Ejecutar `pnpm build` y `pnpm lint` sin errores y revisar por código las propiedades 12 a 14.
    - _Requirements: 4.1, 4.2, 4.3, 4.5_

- [x] 10. Colorear todo el tablero al resolver
  - [x] 10.1 Colorear cada casilla con el color de su número al ganar
    - En `components/challenges/SudokuBoard.tsx` añadir la prop `solved: boolean`. Si `solved` es verdadero, toda casilla llena usa `DIGIT_STYLES[value].cell`, sin gris y sin depender de `activeDigit`. Si es falso, el comportamiento actual no cambia.
    - En `components/challenges/LogicSudokuCard.tsx` pasar `solved={s.solved}` al tablero.
    - _Requirements: 8.6, 8.7_
  - [x] 10.2 Documentar y verificar
    - Añadir a la sección 6 de `frontend/web/DESIGN.md` el estado "partida resuelta": cada casilla con el color de su número.
    - Ejecutar `pnpm build` y `pnpm lint` sin errores y revisar por código las propiedades 12, 13 y 15.
    - _Requirements: 4.1, 4.5, 8.6, 8.7_

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 1, "tasks": ["1.1"] },
    { "id": 2, "tasks": ["1.2", "2"] },
    { "id": 3, "tasks": ["3.1", "4"] },
    { "id": 4, "tasks": ["3.2", "3.3", "5.1", "5.2"] },
    { "id": 5, "tasks": ["6", "7"] },
    { "id": 6, "tasks": ["8.1", "8.2", "8.3"] },
    { "id": 7, "tasks": ["9.1"] },
    { "id": 8, "tasks": ["9.2"] },
    { "id": 9, "tasks": ["9.3"] },
    { "id": 10, "tasks": ["10.1"] },
    { "id": 11, "tasks": ["10.2"] }
  ]
}
```

## Notes

- Las tareas 1.1 y 1.2 son el primer paso pedido: quitar 6×6 antes de añadir comportamiento nuevo, para que cada paso compile.
- La tarea 2 va después de 1.1 porque ambas editan `lib/sudoku.ts` y `types/challenges.ts`. La paleta (3.1) necesita el tipo `SudokuDigit` de la tarea 2.
- El repo no tiene framework de pruebas. Las propiedades del diseño se comprueban por revisión de código y revisión manual, y no se añaden dependencias.
- La paleta de colores es una propuesta. Se ajusta tras verla en pantalla y medir el contraste.
