# Implementation Plan: Juegos de Retos

## Overview

Todas las rutas son relativas a `Synapz/frontend/web/src/`, salvo que se indique otra cosa. Los comandos de `pnpm` se ejecutan en `Synapz/frontend/web`. Cada tarea debe terminar con `pnpm exec tsc -b` y `pnpm lint` sin errores en sus archivos. No se añaden dependencias, no se ejecuta `pnpm dev` y los scripts de verificación van en `/tmp` (Node 22 con `--experimental-strip-types`), nunca dentro del repo. Los motores de `lib/games/` son funciones puras, importan tipos de `types/<juego>.ts` y usan `lib/random.ts` para el azar. Ver `design.md` para la firma exacta de cada motor.

## Tasks

- [x] 1. Base de la sección Retos
  - [x] 1.1 Tipos compartidos, catálogo, cronómetro y marco común
    - Crear `types/games.ts` con `GameId` (9 ids), `GameInfo` y los tipos compartidos.
    - Crear `lib/games/catalog.ts` con `GAMES` (9 entradas con id, título, descripción, icono de `lucide-react`, tono, etiquetas y altura) en el orden y con las alturas del diseño. Verificar que cada icono existe en la versión instalada de `lucide-react`.
    - Crear `hooks/useGameTimer.ts` (`useGameTimer(running)` devuelve `{ elapsed, reset }`) y `components/games/GameShell.tsx` según el diseño.
    - _Requirements: 1.1, 8.1, 8.3, 8.4_
  - [x] 1.2 Cuadrícula Masonry, vista de juego y página de Retos
    - Crear `components/games/GameTile.tsx`, `GamesMasonry.tsx` y `GameView.tsx`, y el registro `components/games/gameRegistry.tsx` que asigna un componente a cada `GameId`. Los 3 juegos existentes se renderizan con sus componentes actuales (`QuickBattleGame`, `MentalMathTrainer`, `LogicSudokuCard`); los 6 nuevos usan un componente temporal "Próximamente" que la tarea 8.1 sustituye.
    - Reescribir `pages/RetosPage.tsx`: estado `openGame`, `useLeaderboard` en la página, cuadrícula Masonry o `GameView`, y la columna derecha siempre visible con `LiveLeaderboard` arriba y `FriendsStreakPanel` debajo (layout `lg:grid-cols-[minmax(0,1fr)_18rem]`). La Batalla rápida deja de llevar el ranking a su lado. Al volver, el foco regresa a la Tarjeta abierta.
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 8.3_

- [x] 2. Ajedrez
  - [x] 2.1 Motor: tablero y movimientos legales
    - Crear `types/chess.ts` y `lib/games/chess.ts` con `initialState`, `legalMoves`, `applyMove`, `isInCheck` y la generación de movimientos de todas las piezas, filtro por seguridad del rey, enroque, captura al paso y promoción (cuatro movimientos por promoción).
    - Verificar con un script en `/tmp`: perft desde la posición inicial (20, 400, 8902, 197281) y Kiwipete (48, 2039, 97862), cargando posiciones desde FEN con una función auxiliar solo del script; ningún movimiento legal deja al rey en jaque; reglas de enroque y captura al paso con posiciones concretas.
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  - [x] 2.2 Motor: estado de la partida y notación
    - Añadir en `lib/games/chess.ts` `statusOf` (jugando, jaque, jaque mate, ahogado, tablas por material insuficiente), `toSan` con desambiguación, `+` y `#`, y el historial (`MoveRecord`) en `applyMove`.
    - Verificar con un script en `/tmp`: mate del pastor (`e4 e5 Qh5 Nc6 Bc4 Nf6 Qxf7#`) da mate con ganador blancas, ahogado `7k/5Q2/6K1/8/8/8/8/8 b - -`, rey contra rey y rey y alfil o caballo contra rey dan tablas, y las notaciones `O-O`, `exd5`, `e8=Q+`, `Nbd7`.
    - _Requirements: 2.6, 2.7, 2.8, 2.9_
  - [x] 2.3 Hook e interfaz
    - Crear `hooks/useChess.ts` (estado, selección, destinos legales, promoción pendiente, reinicio) y `components/games/ChessGame.tsx`, `ChessBoard.tsx`, `ChessHistory.tsx` y `PromotionPicker.tsx` con glifos Unicode, casillas `button` con `aria-label`, destinos legales marcados, rey en jaque marcado, historial en dos columnas con scroll al último movimiento, mensajes de estado en `aria-live` y botón "Nueva partida", dentro de `GameShell`. Tablero sin scroll horizontal desde 320 px y con variantes `dark:`.
    - _Requirements: 2.1, 2.6, 2.7, 2.8, 2.9, 2.10, 2.11, 8.2, 8.3, 8.5, 8.6_

- [x] 3. Juego del 15
  - [x] 3.1 Motor
    - Crear `types/slidingPuzzle.ts` y `lib/games/slidingPuzzle.ts` con `solvedBoard`, `isSolved`, `isSolvable`, `shuffledBoard` (movimientos aleatorios válidos desde el resuelto, sin deshacer el anterior), `canMove`, `moveTile` y `moveByDirection`.
    - Verificar con un script en `/tmp` sobre al menos 1000 tableros: resolubles por paridad, no resueltos, valores 0 a 15 sin repetir, solo se mueven fichas adyacentes y mover y deshacer devuelve el tablero original.
    - _Requirements: 3.1, 3.2, 3.3_
  - [x] 3.2 Hook e interfaz
    - Crear `hooks/useSlidingPuzzle.ts` (movimientos, cronómetro desde el primer movimiento, victoria, reinicio) y `components/games/SlidingPuzzleGame.tsx` con la rejilla 4×4 de `button`, contador, cronómetro, flechas del teclado en el contenedor con foco, mensaje de victoria y "Nueva partida", dentro de `GameShell`.
    - _Requirements: 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 8.2, 8.3, 8.5, 8.6_

- [x] 4. Buscaminas
  - [x] 4.1 Motor
    - Crear `types/minesweeper.ts` y `lib/games/minesweeper.ts` con `MINE_LEVELS`, `createMineState`, `reveal` (minas colocadas en el primer clic excluyendo la casilla y sus vecinas, expansión iterativa con cola), `toggleFlag` y las condiciones de victoria y derrota. `chord` es opcional.
    - Verificar con un script en `/tmp`: primer clic seguro en todas las casillas de las tres dificultades, número de minas correcto, expansión de ceros, banderas que impiden revelar, derrota al revelar una mina y victoria solo cuando todas las casillas sin mina están reveladas.
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.6, 4.7_
  - [x] 4.2 Hook e interfaz
    - Crear `hooks/useMinesweeper.ts` (estado, modo bandera, cronómetro desde la primera casilla revelada, dificultad, reinicio) y `components/games/MinesweeperGame.tsx` con selector de dificultad, rejilla de `button`, clic derecho con `preventDefault` solo dentro del tablero, botón de modo bandera, contador de minas restantes, iconos `Flag` y `Bomb`, números con colores legibles en ambos temas, fin de partida con minas visibles y banderas erróneas, dentro de `GameShell`.
    - _Requirements: 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 8.2, 8.3, 8.5, 8.6_

- [x] 5. Tangram
  - [x] 5.1 Geometría, figuras y validación
    - Crear `types/tangram.ts` y `lib/games/tangram.ts` con la geometría de las 7 piezas (cuadrado completo de 4×4, área total 16), `polygonOf`, `snap`, `matchPieces`, `isFigureComplete`, `initialLayout` y `FIGURES` con al menos 4 figuras (cuadrado, triángulo grande, casa y una figura de animal) definidas con 7 colocaciones cada una.
    - Verificar con un script en `/tmp`: las áreas de cada figura suman 16, ninguna pareja de piezas de la solución se solapa, cada figura se reconoce como completa, rotar el cuadrado 90° mantiene la coincidencia, voltear el paralelogramo la rompe y las piezas del mismo tipo son intercambiables.
    - _Requirements: 5.1, 5.2, 5.5_
  - [x] 5.2 Hook e interfaz
    - Crear `hooks/useTangram.ts` (posiciones, pieza seleccionada, rotación, volteo, figura elegida, cronómetro desde el primer movimiento, reinicio) y `components/games/TangramGame.tsx` y `TangramBoard.tsx`: SVG con la silueta y las 7 piezas de colores con clases de Tailwind, arrastre con Pointer Events (`setPointerCapture`, `getScreenCTM`, `onPointerCancel`), ajuste a la rejilla, botones de rotar y voltear (y teclas `Q`/`E`), flechas para mover la pieza seleccionada, resalte de piezas bien colocadas, selector de figura, "Reiniciar figura" y mensaje de éxito, dentro de `GameShell`.
    - _Requirements: 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 8.2, 8.3, 8.5, 8.6_

- [x] 6. Tetris
  - [x] 6.1 Motor
    - Crear `types/tetris.ts` y `lib/games/tetris.ts` con las 7 piezas y sus 4 rotaciones, `createTetris` (bolsa de 7), `collides`, `moveHorizontal`, `rotate` (patada de pared simple), `softDrop`, `hardDrop`, `tick`, `ghostRow`, `dropIntervalMs`, `togglePause`, eliminación de líneas, puntuación (100/300/500/800 por nivel, 1 y 2 puntos por fila de caída), nivel cada 10 líneas y game over.
    - Verificar con un script en `/tmp`: ninguna acción deja celdas fuera o sobre celdas ocupadas, las líneas completas se eliminan y las superiores bajan, la puntuación coincide con la tabla, cada 7 piezas consecutivas de una bolsa contienen cada tetrominó una vez, y tras game over las acciones no cambian el estado.
    - _Requirements: 6.1, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9_
  - [x] 6.2 Hook e interfaz
    - Crear `hooks/useTetris.ts` (intervalo de gravedad reprogramado por nivel con limpieza, teclado en el contenedor con foco y `preventDefault`, pausa, reinicio) y `components/games/TetrisGame.tsx` y `TetrisBoard.tsx`: tablero 10×20, pieza activa, fantasma con borde punteado, siguientes dos piezas, panel de puntuación, líneas y nivel, botonera táctil con las mismas acciones, pausa, game over con reinicio, dentro de `GameShell`. Colores por pieza con clases `bg-*` literales y variantes `dark:`.
    - _Requirements: 6.1, 6.2, 6.5, 6.7, 6.8, 6.9, 6.10, 8.2, 8.3, 8.4, 8.5, 8.6_

- [x] 7. Memorama
  - [x] 7.1 Motor
    - Crear `types/memory.ts` y `lib/games/memory.ts` con `MEMORY_LEVELS`, `createMemory`, `flip`, `resolveMismatch` e `isLocked`.
    - Verificar con un script en `/tmp`: dos cartas por símbolo en los tres niveles, `flip` ignora cartas ya boca arriba, encontradas o con el estado bloqueado, una pareja suma un par y un intento, un fallo suma un intento y `resolveMismatch` las oculta sin cambiar los pares, y `status` es `won` solo con todas las parejas.
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.7_
  - [x] 7.2 Hook e interfaz
    - Crear `hooks/useMemoryGame.ts` (`setTimeout` de 900 ms al fallar, cancelado al reiniciar o desmontar, cronómetro desde el primer volteo) y `components/games/MemoryGame.tsx`: rejilla de cartas `button` con giro por transición de Tailwind y `motion-reduce:transition-none`, 12 símbolos de `lucide-react` con color propio, selector de nivel, contador de intentos y parejas, victoria y "Nueva partida", dentro de `GameShell`.
    - _Requirements: 7.1, 7.2, 7.4, 7.6, 7.7, 7.8, 8.2, 8.3, 8.4, 8.5, 8.6_

- [x] 8. Integración
  - [x] 8.1 Conectar los seis juegos al registro
    - En `components/games/gameRegistry.tsx` sustituir los seis componentes temporales por `ChessGame`, `SlidingPuzzleGame`, `MinesweeperGame`, `TangramGame`, `TetrisGame` y `MemoryGame`. Comprobar que cada `GameId` tiene un componente (el tipo debe obligarlo) y que solo se monta el juego abierto.
    - _Requirements: 1.1, 1.5, 1.6_

- [x] 9. Documentación
  - [x] 9.1 Documentar la interfaz y actualizar los requisitos del producto
    - Añadir a `frontend/web/DESIGN.md` una sección 7 "Retos: cuadrícula Masonry y juegos" con la cuadrícula, la columna derecha, el marco de juego, y la interfaz y los colores reales de cada juego (leer el código implementado).
    - En `Synapz/requirements.md` (D4) añadir los seis juegos como criterios, y en `Synapz/README.md` mencionarlos en la sección de gamificación. No modificar nada más.
    - _Requirements: 8.8_

- [x] 10. Verificación final
  - [x] 10.1 Compilación, lint y revisión por código
    - Ejecutar `pnpm build` y `pnpm lint` sin errores. Con `grep` en `src/`: ningún `any` explícito, ningún `style={{` con color, ningún `console.` y ningún `localStorage` en los archivos de los juegos.
    - Revisar por código los hooks: todo `setInterval` y `setTimeout` tiene limpieza, los listeners de teclado están en el contenedor y no en `window`, y reiniciar o desmontar no deja restos. Revisar que la cuadrícula Masonry, la columna derecha y el cambio entre juegos cumplen las propiedades 18 a 20 del diseño.
    - Calcular a 320 px de ancho el tamaño de las casillas o piezas de cada juego e informar de cualquiera que quede por debajo de 28 px o desborde.
    - _Requirements: 1.5, 1.6, 8.1, 8.4, 8.6, 8.7_

- [x] 11. Ajustes de jugabilidad
  - [x] 11.1 Rotación de la I del Tetris al aparecer
    - En `lib/games/tetris.ts` hacer que `rotate` pruebe también una patada vertical (subir o bajar una fila) además de las horizontales, para que la pieza I pueda rotar desde su fila de aparición. Mantener que `rotate` devuelve la misma referencia si ninguna prueba es válida.
    - Verificar con un script en `/tmp`: la I recién aparecida rota y no queda fuera del tablero ni sobre celdas ocupadas, rotar 4 veces en espacio libre sigue devolviendo la forma original, y una partida aleatoria de 200000 acciones no viola ninguna invariante.
    - _Requirements: 6.4_
  - [x] 11.2 Tamaño mínimo de casilla del Buscaminas
    - En `components/games/MinesweeperGame.tsx` garantizar casillas de al menos 24 px: el tablero va en un contenedor `overflow-x-auto` y las casillas usan un tamaño mínimo, de modo que a 320 px las dificultades Medio y Difícil se desplazan dentro del propio tablero y la página no se desplaza. En pantallas anchas el tablero sigue centrado y sin scroll.
    - Calcular y reportar el tamaño de casilla a 320 px y a 375 px en las tres dificultades.
    - _Requirements: 8.6_

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 1, "tasks": ["1.1", "2.1", "3.1", "4.1", "5.1"] },
    { "id": 2, "tasks": ["1.2", "2.2", "3.2", "4.2", "5.2"] },
    { "id": 3, "tasks": ["2.3", "6.1", "7.1"] },
    { "id": 4, "tasks": ["6.2", "7.2"] },
    { "id": 5, "tasks": ["8.1", "11.1", "11.2"] },
    { "id": 6, "tasks": ["9.1"] },
    { "id": 7, "tasks": ["10.1"] }
  ]
}
```

## Notes

- Los motores no dependen entre sí. Las tareas de interfaz de cada juego dependen de su motor y de la tarea 1.1 (marco común y cronómetro).
- `gameRegistry.tsx` solo lo edita la tarea 1.2 (con marcadores temporales) y la 8.1 (con los juegos reales), para que las tareas en paralelo no choquen.
- Las coordenadas exactas de las figuras del Tangram las calcula la tarea 5.1 y las valida con el script antes de aceptarlas.
- El repo no tiene framework de pruebas. Las propiedades del diseño se verifican con scripts temporales en `/tmp` y por revisión de código.
