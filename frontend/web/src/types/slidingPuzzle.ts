/** Tablero del Juego del 15: 16 valores en orden de filas; 0 es el hueco. */
export type SlideBoard = readonly number[];

/** Dirección en la que se desplaza la ficha al moverse hacia el hueco. */
export type SlideDirection = "up" | "down" | "left" | "right";
