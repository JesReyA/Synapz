# Requirements Document

## Introduction

Esta función añade seis juegos a la sección **Retos** del alumno: Ajedrez, Juego del 15, Buscaminas, Tangram, Tetris y Memorama. Al entrar en Retos se muestra una cuadrícula Masonry con los nueve juegos (los seis nuevos y los tres existentes: Batalla rápida, Cálculo mental y Sudoku de lógica). Cada juego se abre y se juega por separado. A la derecha se ven siempre el ranking en vivo y, debajo, el panel de rachas con los puntos de la semana.

Es una función solo de frontend en `frontend/web/`, según `ARCHITECTURE.md`, `DESIGN.md` y `synapz-rules.md`: TypeScript estricto sin `any`, Tailwind v4 con modo oscuro por clase `.dark`, iconos solo de `lucide-react`, sin dependencias nuevas y sin llamadas de red. No hay endpoints nuevos ni cambios en `API_CONTRACT.md`. Los requisitos extienden D4 de `requirements.md`.

### Supuestos

1. El ajedrez es de dos jugadores en el mismo dispositivo, sin rival de IA, sin reloj y sin tablas por repetición ni por la regla de 50 movimientos.
2. El Buscaminas ofrece tres dificultades fijas. "Configurable" se resuelve con la dificultad.
3. El Tangram trae 4 figuras objetivo.
4. No se guardan récords y no se suman puntos al ranking del aula con los juegos nuevos.
5. No se usa un enrutador: la página guarda en memoria qué juego está abierto.

### Fuera de alcance

- IA para el ajedrez, partidas en línea, guardado de partidas, récords, sonido.
- Funciones de FASE 2 de `requirements.md`.

## Glossary

- **Sistema**: la sección Retos del alumno y los juegos que contiene.
- **Tarjeta**: elemento de la cuadrícula Masonry que representa un juego.
- **Juego abierto**: el juego que se muestra por separado tras elegir su Tarjeta.
- **Columna derecha**: columna lateral con el ranking en vivo arriba y el panel de rachas debajo.
- **Partida terminada**: estado en que el juego ya no acepta jugadas (victoria, derrota, mate, tablas o game over).
- **Pareja**: dos cartas del Memorama con el mismo símbolo.
- **Tan**: cada una de las 7 piezas del Tangram.

## Requirements

### Requirement 1: Entrada a Retos con cuadrícula Masonry

**User Story:** Como alumno, quiero ver todos los juegos juntos al entrar en Retos y abrir el que quiera, para jugar cada uno por separado.

#### Acceptance Criteria

1. WHEN el alumno abre Retos, THE Sistema SHALL mostrar en una cuadrícula Masonry una Tarjeta por cada uno de los 9 juegos: Batalla rápida, Cálculo mental, Sudoku de lógica, Ajedrez, Juego del 15, Buscaminas, Tangram, Tetris y Memorama.
2. THE Sistema SHALL mostrar la Columna derecha en Retos tanto con la cuadrícula como con un Juego abierto, con el ranking en vivo arriba y el panel de rachas con los puntos de la semana debajo.
3. WHILE el ancho de pantalla es menor que el de escritorio (`lg`), THE Sistema SHALL colocar la Columna derecha debajo del contenido principal, conservando el orden ranking y luego racha.
4. THE Sistema SHALL mostrar en cada Tarjeta un icono, el título, una descripción breve y etiquetas, y SHALL permitir abrirla con ratón, toque o teclado.
5. WHEN el alumno elige una Tarjeta, THE Sistema SHALL mostrar solo ese juego, con un botón "Volver a Retos", y SHALL mantener montado como máximo un juego a la vez.
6. WHEN el alumno pulsa "Volver a Retos", THE Sistema SHALL mostrar la cuadrícula, devolver el foco a la Tarjeta abierta y liberar los temporizadores y listeners del juego cerrado.
7. THE Sistema SHALL mostrar la cuadrícula en 1, 2 y 3 columnas según el ancho (móvil, `sm` y `xl`), sin desplazamiento horizontal desde 320 px y sin librerías de Masonry.
8. THE Sistema SHALL conservar el funcionamiento de la Batalla rápida, el Cálculo mental y el Sudoku, que se abren desde sus Tarjetas.

### Requirement 2: Ajedrez

**User Story:** Como alumno, quiero jugar al ajedrez con las reglas completas contra otra persona en el mismo dispositivo, para entrenar mi estrategia.

#### Acceptance Criteria

1. WHEN se abre el Ajedrez, THE Sistema SHALL mostrar un tablero de 8×8 con las 32 piezas en la posición inicial, con el turno de las blancas, y SHALL alternar los turnos entre dos jugadores.
2. THE Sistema SHALL permitir solo movimientos legales de peón, caballo, alfil, torre, dama y rey, y SHALL rechazar cualquier movimiento que deje al rey propio en jaque.
3. WHEN se cumplen las condiciones, THE Sistema SHALL permitir el enroque corto y el largo: rey y torre sin mover, casillas intermedias vacías, y rey sin estar en jaque ni cruzar ni terminar en una casilla atacada.
4. WHEN un peón avanza dos casillas junto a un peón rival, THE Sistema SHALL permitir la captura al paso solo en el turno inmediato siguiente y SHALL retirar el peón capturado.
5. WHEN un peón llega a la última fila, THE Sistema SHALL pedir la pieza de promoción (dama, torre, alfil o caballo) y SHALL completar el movimiento con la pieza elegida.
6. WHILE un rey está en jaque, THE Sistema SHALL indicarlo en el tablero y en el mensaje de estado.
7. WHEN el jugador en turno está en jaque y no tiene movimientos legales, THE Sistema SHALL declarar jaque mate, indicar el ganador y dar la partida por terminada.
8. WHEN el jugador en turno no está en jaque y no tiene movimientos legales, o no queda material suficiente para dar mate, THE Sistema SHALL declarar tablas y dar la partida por terminada.
9. THE Sistema SHALL mostrar el historial de movimientos en notación algebraica, en columnas de blancas y negras, desplazado hasta el último movimiento.
10. WHEN el jugador selecciona una pieza propia, THE Sistema SHALL marcar sus destinos legales, y WHEN toca un destino legal, THE Sistema SHALL ejecutar el movimiento. WHILE la partida está terminada, THE Sistema SHALL ignorar los movimientos.
11. WHEN el jugador pulsa "Nueva partida", THE Sistema SHALL restaurar la posición inicial, el turno de las blancas y el historial vacío.

### Requirement 3: Juego del 15

**User Story:** Como alumno, quiero resolver el tablero deslizante de 15 fichas, para ejercitar mi lógica.

#### Acceptance Criteria

1. THE Sistema SHALL mostrar un tablero de 4×4 con las fichas del 1 al 15 y un espacio vacío.
2. WHEN se inicia una partida, THE Sistema SHALL generar un tablero resoluble que no esté ya resuelto.
3. WHEN el jugador toca una ficha adyacente al espacio vacío, THE Sistema SHALL intercambiarla con él, y SHALL ignorar los toques sobre fichas no adyacentes.
4. THE Sistema SHALL contar solo los movimientos válidos y mostrar el contador.
5. THE Sistema SHALL iniciar el cronómetro en el primer movimiento y detenerlo al ganar.
6. WHEN las fichas quedan ordenadas del 1 al 15 con el espacio vacío al final, THE Sistema SHALL declarar la victoria, mostrar los movimientos y el tiempo, y bloquear el tablero.
7. THE Sistema SHALL permitir mover fichas con las flechas del teclado.
8. WHEN el jugador pulsa "Nueva partida", THE Sistema SHALL generar un tablero nuevo y reiniciar el contador y el cronómetro.

### Requirement 4: Buscaminas

**User Story:** Como alumno, quiero jugar al Buscaminas en varias dificultades, para entrenar mi deducción.

#### Acceptance Criteria

1. THE Sistema SHALL ofrecer tres dificultades: Fácil (8×8, 10 minas), Medio (10×10, 20 minas) y Difícil (12×12, 30 minas).
2. WHEN el jugador revela la primera casilla, THE Sistema SHALL colocar las minas de modo que esa casilla y sus vecinas no tengan mina.
3. WHEN el jugador revela una casilla, THE Sistema SHALL mostrar el número de minas vecinas, y WHEN ese número es cero, THE Sistema SHALL revelar automáticamente las casillas vecinas de forma encadenada, sin revelar casillas con bandera.
4. WHEN el jugador hace clic derecho en una casilla no revelada o la toca con el modo bandera activo, THE Sistema SHALL alternar su bandera, SHALL impedir revelar una casilla con bandera y SHALL mostrar el contador de minas restantes.
5. THE Sistema SHALL iniciar el cronómetro en la primera casilla revelada y detenerlo al terminar la partida.
6. WHEN el jugador revela una mina, THE Sistema SHALL declarar la derrota, mostrar todas las minas y marcar las banderas erróneas, y bloquear el tablero.
7. WHEN todas las casillas sin mina están reveladas, THE Sistema SHALL declarar la victoria, mostrar el tiempo y bloquear el tablero.
8. WHEN el jugador pulsa "Nueva partida" o cambia la dificultad, THE Sistema SHALL iniciar una partida nueva con el contador de minas y el cronómetro reiniciados.

### Requirement 5: Tangram

**User Story:** Como alumno, quiero armar figuras con las siete piezas del Tangram, para trabajar la geometría y la visión espacial.

#### Acceptance Criteria

1. THE Sistema SHALL mostrar las 7 Tans clásicas (dos triángulos grandes, un triángulo mediano, dos triángulos pequeños, un cuadrado y un paralelogramo) con las proporciones del Tangram, cada una de un color distinto.
2. THE Sistema SHALL ofrecer al menos 4 figuras objetivo, mostradas como silueta, con un selector de figura.
3. WHEN el jugador arrastra una Tan con el puntero, THE Sistema SHALL moverla y SHALL ajustar su posición a una rejilla al soltarla.
4. THE Sistema SHALL permitir rotar la Tan seleccionada en pasos de 45° y voltear el paralelogramo, con botones y con el teclado.
5. WHEN una Tan coincide con un hueco de la silueta dentro de una tolerancia, THE Sistema SHALL resaltarla como bien colocada. THE Sistema SHALL tratar como intercambiables las Tans del mismo tipo, y SHALL aceptar el cuadrado en cualquier giro de 90°.
6. WHEN las 7 Tans están bien colocadas, THE Sistema SHALL declarar la figura completa y mostrar el tiempo.
7. WHEN el jugador pulsa "Reiniciar figura" o elige otra figura, THE Sistema SHALL dispersar las 7 Tans en el área de reserva y limpiar el estado de la partida.
8. THE Sistema SHALL permitir seleccionar y mover la Tan con las flechas del teclado en pasos de la rejilla.

### Requirement 6: Tetris

**User Story:** Como alumno, quiero jugar al Tetris clásico, para entrenar mis reflejos.

#### Acceptance Criteria

1. THE Sistema SHALL mostrar un tablero vertical de 10×20 y SHALL generar los 7 tetrominós (I, O, T, S, Z, J, L) con una bolsa mezclada de 7, mostrando las dos piezas siguientes.
2. WHILE la partida está en curso y no en pausa, THE Sistema SHALL hacer caer la pieza activa a un intervalo que se acorta al subir el nivel.
3. WHEN el jugador mueve la pieza a la izquierda o la derecha, THE Sistema SHALL desplazarla una columna, salvo que salga del tablero o choque con celdas ocupadas.
4. WHEN el jugador rota la pieza, THE Sistema SHALL girarla con una patada de pared simple, y SHALL rechazar la rotación si todas las posiciones chocan.
5. THE Sistema SHALL ofrecer caída suave (una fila) y caída rápida (hasta el fondo), con 1 y 2 puntos por fila respectivamente, y SHALL mostrar una pieza fantasma donde caería.
6. WHEN una pieza se fija y completa filas, THE Sistema SHALL eliminarlas, bajar las filas superiores y sumar 100, 300, 500 o 800 puntos por 1, 2, 3 o 4 líneas, multiplicados por el nivel.
7. THE Sistema SHALL subir un nivel cada 10 líneas y mostrar la puntuación, las líneas y el nivel.
8. WHEN la pieza nueva choca al aparecer, THE Sistema SHALL declarar game over, mostrar la puntuación final y ofrecer reiniciar.
9. THE Sistema SHALL permitir pausar y reanudar la partida.
10. THE Sistema SHALL ofrecer controles de teclado (flechas, rotar, caída rápida, pausa) y una botonera táctil equivalente.

### Requirement 7: Memorama

**User Story:** Como alumno, quiero encontrar parejas de cartas, para ejercitar mi memoria.

#### Acceptance Criteria

1. THE Sistema SHALL ofrecer tres niveles: 6 parejas (3×4), 8 parejas (4×4) y 12 parejas (4×6), con las cartas boca abajo, mezcladas y con cada símbolo exactamente dos veces.
2. WHEN el jugador toca una carta boca abajo, THE Sistema SHALL voltearla, y WHEN voltea la segunda carta, THE Sistema SHALL compararlas y sumar un intento.
3. WHEN las dos cartas forman una Pareja, THE Sistema SHALL dejarlas boca arriba como encontradas y sumar una pareja.
4. WHEN las dos cartas no coinciden, THE Sistema SHALL mantenerlas visibles unos 900 ms, devolverlas boca abajo y, durante ese tiempo, no aceptar más volteos.
5. THE Sistema SHALL ignorar los toques sobre cartas ya boca arriba o ya encontradas.
6. THE Sistema SHALL mostrar los intentos, las parejas encontradas y un cronómetro que inicia en el primer volteo.
7. WHEN se encuentran todas las parejas, THE Sistema SHALL declarar la victoria, mostrar los intentos y el tiempo, y detener el cronómetro.
8. WHEN el jugador pulsa "Nueva partida" o cambia de nivel, THE Sistema SHALL barajar de nuevo, reiniciar los contadores y cancelar cualquier espera pendiente.

### Requirement 8: Requisitos transversales

**User Story:** Como alumno y como equipo, quiero que los juegos sean estables, accesibles y coherentes con el resto de la aplicación.

#### Acceptance Criteria

1. THE Sistema SHALL usar TypeScript estricto sin `any`, iconos solo de `lucide-react`, ningún estilo en línea para color y ninguna dependencia nueva.
2. THE Sistema SHALL mostrar cada juego en modo claro y oscuro con los tokens de `DESIGN.md`, y SHALL cumplir contraste AA en textos.
3. THE Sistema SHALL permitir operar cada juego con teclado, con foco visible, `aria-label` en controles solo-icono y el estado de la partida anunciado en una región `aria-live="polite"`.
4. THE Sistema SHALL liberar los temporizadores y listeners de un juego al desmontarlo, reiniciarlo o terminarlo, y SHALL no producir errores ni avisos en la consola.
5. WHEN el jugador reinicia un juego, THE Sistema SHALL devolverlo a su estado inicial completo, sin restos de la partida anterior.
6. THE Sistema SHALL mostrar cada juego completo, sin desplazamiento horizontal de la página, desde 320 px de ancho.
7. THE Sistema SHALL mantener el estado de cada juego solo en memoria, sin `localStorage` ni llamadas de red.
8. THE Sistema SHALL documentar la interfaz de los juegos en `frontend/web/DESIGN.md` y actualizar `requirements.md` (D4) y `README.md`.
