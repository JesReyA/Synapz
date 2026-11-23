# Requirements Document

## Introduction

Esta función reemplaza el módulo "Sudoku de lógica" de la sección Retos del alumno (`LogicSudokuCard`) por un Sudoku clásico de 9×9 con una mecánica táctil simple, inspirada en el minijuego de Sudoku de Pou. Cada número del 1 al 9 tiene un color propio. Al elegir un número en la paleta inferior, se iluminan en el tablero todas las casillas que lo contienen. Tocar una casilla vacía coloca el número elegido y tocar una casilla propia lo borra, por lo que no hay botón de borrar.

Esta función cubre el requisito D4 CA5 de `requirements.md` (sudoku con validación de errores y temporizador). Hoy ese criterio dice "6x6 y 9x9"; este spec lo limita a 9×9 y esa edición debe hacerse en `requirements.md` al implementar.

Alcance técnico, según `ARCHITECTURE.md`, `DESIGN.md` y `synapz-rules.md`:

- Solo frontend (`frontend/web/`), en TypeScript sin `any`. No hay endpoints nuevos ni cambios en `API_CONTRACT.md`.
- Tailwind v4 con modo oscuro por clase `.dark`, iconos de `lucide-react`, sin `style={{}}` para color.
- Los tipos van en `src/types/`, la lógica en `src/lib/` y `src/hooks/`, y la UI en `src/components/challenges/`.
- Los puzzles se generan en el navegador, como hoy.

### Supuestos

1. Se conservan los tres niveles (Fácil, Medio, Difícil) y el temporizador, porque D4 CA5 los pide. Tu pedido no los menciona.
2. Se elimina por completo el modo 6×6 (selector, geometría, pistas y tipos). Es el primer paso de la implementación.
3. Al iniciar una partida no hay ningún número seleccionado. Sin número seleccionado, tocar una casilla no hace nada.
4. Con un número seleccionado, tocar una casilla vacía lo coloca y tocar una casilla del jugador que ya contiene ese mismo número lo borra.
5. Con un número seleccionado, tocar una casilla del jugador que contiene otro número lo reemplaza por el seleccionado. Para borrar un número se selecciona ese número y se toca su casilla.
6. Tocar de nuevo el número ya seleccionado en la paleta lo deselecciona y quita el resaltado.
   Todas las casillas empiezan en blanco, sin color. El gris claro indica solo qué número está seleccionado. El color del número aparece únicamente cuando el número está completo y es el número seleccionado.
7. Colocar un número que genera un conflicto está permitido. El conflicto solo se señala visualmente.
8. No se copian ni se usan assets, marca o ilustraciones de Pou. Solo se toma la mecánica.

### Fuera de alcance

- Guardar partidas, estadísticas, puntos en el ranking o integración con Supabase.
- Notas a lápiz, pistas automáticas, deshacer y rehacer.
- Funciones de FASE 2 de `requirements.md`.

## Glossary

- **Tablero**: cuadrícula de 9×9 casillas dividida en 9 bloques de 3×3.
- **Pista**: casilla con número fijo desde el inicio de la partida. No se puede modificar.
- **Casilla del jugador**: casilla que el jugador llenó durante la partida.
- **Paleta**: fila inferior con los botones del 1 al 9.
- **Número activo**: número de la paleta seleccionado en ese momento. Puede no haber ninguno.
- **Número completo**: número del 1 al 9 cuyas 9 casillas del Tablero están llenas con él en las posiciones correctas de la solución.
- **Conflicto**: casilla cuyo número se repite en su fila, columna o bloque 3×3.
- **Sistema**: el módulo de Sudoku de la sección Retos.

## Requirements

### Requirement 1: Tablero 9×9 con bloques visibles

**User Story:** Como alumno, quiero ver un tablero de 9×9 con los bloques de 3×3 bien marcados, para ubicarme rápido mientras juego.

#### Acceptance Criteria

1. WHEN se abre la sección Sudoku, THE Sistema SHALL mostrar un Tablero de 9×9 casillas con una partida nueva.
2. THE Sistema SHALL ofrecer únicamente el tamaño 9×9, sin selector de tamaño y sin modo 6×6 en la interfaz, la lógica de generación ni los tipos.
3. THE Sistema SHALL separar los 9 bloques de 3×3 con bordes más gruesos que los bordes entre casillas.
4. THE Sistema SHALL generar cada partida con una única solución válida de Sudoku.
5. THE Sistema SHALL mostrar el Tablero completo, sin desplazamiento horizontal, en pantallas desde 320 px de ancho.
6. THE Sistema SHALL mostrar el Tablero y la Paleta tanto en modo claro como en modo oscuro, con las clases `dark:` definidas en `DESIGN.md`.

### Requirement 2: Diferenciar pistas y números del jugador

**User Story:** Como alumno, quiero distinguir a simple vista los números iniciales de los que yo coloco, para saber cuáles puedo cambiar.

#### Acceptance Criteria

1. THE Sistema SHALL mostrar los números de las Pistas en negrita.
2. THE Sistema SHALL mostrar los números de las Casillas del jugador con peso de fuente normal.
3. THE Sistema SHALL distinguir Pistas y Casillas del jugador por más que el peso de fuente, con un fondo o un tono de texto distinto, para que la diferencia no dependa solo del grosor.
4. THE Sistema SHALL impedir que una Pista se modifique o se borre.

### Requirement 3: Paleta de 9 colores asociados a los números

**User Story:** Como alumno, quiero que cada número del 1 al 9 tenga su propio color, para reconocerlo sin leerlo.

#### Acceptance Criteria

1. THE Sistema SHALL mostrar en la parte inferior un botón por cada número del 1 al 9.
2. THE Sistema SHALL asignar a cada número un color distinto de los otros ocho.
3. THE Sistema SHALL definir los 9 colores en un único archivo de constantes, con una variante para modo claro y otra para modo oscuro, y registrarlos en `DESIGN.md`.
4. THE Sistema SHALL usar clases estáticas de Tailwind para esos colores y no estilos en línea.
5. THE Sistema SHALL mantener una relación de contraste de al menos 4.5:1 entre el número y el color de fondo de su botón y de su casilla resaltada, en ambos temas.
6. THE Sistema SHALL usar tonos que armonicen con la paleta de `DESIGN.md` y que se distingan entre sí.
7. THE Sistema SHALL mostrar el número activo en la Paleta con un indicador visible que no dependa solo del color, por ejemplo un anillo o un cambio de tamaño.

### Requirement 4: Resaltado por número seleccionado

**User Story:** Como alumno, quiero que al elegir un número se marquen todas sus apariciones en gris, y que se coloreen con su color solo cuando ya terminé ese número, para ver qué elegí y cuándo lo completé.

#### Acceptance Criteria

1. WHILE no hay número activo y la partida no está resuelta, THE Sistema SHALL mostrar todas las casillas del Tablero en blanco, sin color de resaltado, tanto las Pistas como las Casillas del jugador.
2. WHEN el jugador selecciona un número en la Paleta y ese número no está completo, THE Sistema SHALL mostrar en gris claro todas las casillas que lo contienen, sean Pistas o Casillas del jugador.
3. WHEN el jugador selecciona un número completo, THE Sistema SHALL mostrar todas sus casillas con el color asignado a ese número en lugar del gris.
4. WHEN el jugador selecciona un número distinto, THE Sistema SHALL quitar de inmediato el gris o el color del número anterior y resaltar solo las casillas del nuevo número.
5. WHILE un número completo no es el número activo y la partida no está resuelta, THE Sistema SHALL mostrar sus casillas en blanco, sin color.
6. WHEN el jugador vuelve a tocar el número activo, THE Sistema SHALL deseleccionarlo y devolver todas las casillas a blanco.
7. WHEN el jugador coloca o borra un número, THE Sistema SHALL recalcular de inmediato si el número activo está completo, y cambiar entre gris y color según corresponda.
8. THE Sistema SHALL mantener una relación de contraste de al menos 4.5:1 entre el número y el fondo gris de las casillas seleccionadas, en ambos temas.

### Requirement 5: Colocar y borrar tocando las casillas

**User Story:** Como alumno, quiero colocar un número tocando una casilla vacía y borrarlo tocando la casilla, para jugar sin botón de borrar.

#### Acceptance Criteria

1. WHEN el jugador toca una casilla vacía y hay un número activo, THE Sistema SHALL colocar en ella el número activo.
2. WHEN el jugador toca una Casilla del jugador cuyo número es igual al número activo, THE Sistema SHALL dejarla vacía.
3. WHEN el jugador toca una Casilla del jugador cuyo número es distinto del número activo, THE Sistema SHALL reemplazarlo por el número activo.
4. WHEN el jugador toca cualquier casilla y no hay número activo, THE Sistema SHALL dejar el Tablero sin cambios.
5. WHEN el jugador toca una Pista, THE Sistema SHALL dejarla sin cambios, sin importar cuál sea el número activo.
6. THE Sistema SHALL no incluir ningún botón de borrar, goma o equivalente.
7. WHILE la partida está resuelta, THE Sistema SHALL ignorar los toques sobre el Tablero.

### Requirement 6: Validación visual de conflictos

**User Story:** Como alumno, quiero que el juego me avise con suavidad cuando repito un número, para corregirlo sin sentirme penalizado.

#### Acceptance Criteria

1. WHEN una casilla tiene un número que se repite en su fila, su columna o su bloque de 3×3, THE Sistema SHALL marcar esa casilla y las casillas con las que choca como Conflicto.
2. THE Sistema SHALL marcar el Conflicto con un indicador que no dependa solo del color, por ejemplo un borde, un subrayado o un icono.
3. THE Sistema SHALL distinguir el indicador de Conflicto del gris de selección y de cualquiera de los 9 colores de la Paleta.
4. WHEN el jugador borra o cambia el número que causaba el Conflicto, THE Sistema SHALL quitar la marca de inmediato.
5. THE Sistema SHALL permitir colocar un número que genera un Conflicto, sin bloquear la jugada ni mostrar diálogos.
6. THE Sistema SHALL anunciar el número de conflictos en una región `aria-live="polite"`.

### Requirement 7: Nueva partida, dificultad y temporizador

**User Story:** Como alumno, quiero empezar otra partida en el nivel que prefiera y ver cuánto tardo, para seguir jugando y mejorar mi tiempo.

#### Acceptance Criteria

1. THE Sistema SHALL mostrar un botón "Nueva partida".
2. WHEN el jugador pulsa "Nueva partida", THE Sistema SHALL generar un Tablero nuevo con el mismo nivel de dificultad, quitar el número activo y reiniciar el temporizador a 00:00.
3. THE Sistema SHALL ofrecer los niveles Fácil, Medio y Difícil, con Fácil como nivel inicial.
4. WHEN el jugador cambia de nivel, THE Sistema SHALL generar de inmediato una partida nueva de ese nivel.
5. THE Sistema SHALL mostrar un temporizador en formato `mm:ss` que avanza mientras la partida no esté resuelta.
6. THE Sistema SHALL generar el Tablero en menos de 1 segundo en los tres niveles, sin congelar la interfaz.

### Requirement 8: Detección de victoria

**User Story:** Como alumno, quiero que el juego me avise cuando completo el tablero correctamente, para saber que terminé.

#### Acceptance Criteria

1. WHEN todas las casillas tienen número y ninguna está en Conflicto, THE Sistema SHALL marcar la partida como resuelta.
2. WHEN la partida queda resuelta, THE Sistema SHALL detener el temporizador y mostrar un mensaje de victoria con el tiempo total.
3. WHILE el Tablero está completo pero con al menos un Conflicto, THE Sistema SHALL mantener la partida en curso y no mostrar el mensaje de victoria.
4. WHEN la partida queda resuelta, THE Sistema SHALL ofrecer "Nueva partida" como acción destacada.
5. THE Sistema SHALL anunciar la victoria en una región `aria-live="polite"`.
6. WHEN la partida queda resuelta, THE Sistema SHALL mostrar cada casilla del Tablero con el color asignado a su número, sin importar cuál sea el número activo, y SHALL quitar el gris de selección.
7. WHILE la partida no está resuelta, THE Sistema SHALL no mostrar el color de ningún número salvo lo indicado en el Requisito 4.

### Requirement 9: Accesibilidad y conformidad con el proyecto

**User Story:** Como alumno, quiero poder jugar con teclado o con el dedo y leer bien en cualquier tema, para que el juego sea usable para todos.

#### Acceptance Criteria

1. THE Sistema SHALL permitir mover el foco entre casillas con las flechas y activar una casilla con Enter o Espacio, con el mismo efecto que tocarla.
2. THE Sistema SHALL permitir seleccionar un número de la Paleta con las teclas del 1 al 9.
3. THE Sistema SHALL exponer cada casilla con un `aria-label` que indique fila, columna, valor o "vacía", si es Pista y si está en Conflicto.
4. THE Sistema SHALL exponer cada botón de la Paleta con un `aria-label` y con `aria-pressed` según esté activo.
5. THE Sistema SHALL mostrar foco visible en todos los elementos interactivos.
6. THE Sistema SHALL usar solo iconos de `lucide-react`, componentes con props tipadas y ningún tipo `any`.
7. THE Sistema SHALL mantener la tarjeta dentro de `ChallengeCard`, de modo que la página `RetosPage` conserve su diseño actual.
