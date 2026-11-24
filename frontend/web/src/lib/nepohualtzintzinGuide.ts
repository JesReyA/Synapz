import type { AbacusSetup, GuideOperation, GuideOperationId } from "../types/nepohualtzintzin.ts";
import { columnsFromDigits } from "./nepohualtzintzin.ts";

/**
 * Pasos de cada operación. Cada paso es un estado del ábaco: `board1` y `board2` indican el dígito
 * (0-19) de cada potencia de 20.
 */
export const GUIDE_OPERATIONS: GuideOperation[] = [
  {
    id: "addition",
    label: "Suma",
    formula: "14 + 9 = 23",
    twoBoards: false,
    intro: [
      "Coloca el primer sumando en el tablero. Después agrega las cuentas del segundo sumando, de derecha a izquierda y columna por columna.",
      "Si en una columna juntas 5 cuentas de abajo, cámbialas por 1 de arriba (regla del 5). Si la columna pasa de 19, vacíala y sube 1 cuenta de abajo en la columna de la izquierda (regla del 20).",
    ],
    steps: [
      {
        title: "Representa el primer sumando",
        text: "Forma 14 en la columna 20⁰: 2 cuentas de arriba (2 × 5 = 10) y 4 cuentas de abajo (4 × 1 = 4).",
        board1: { 0: 14 },
        highlight: [0],
      },
      {
        title: "Suma 9 y completa una veintena",
        text: "Para llegar a 20 le faltan 6 a 14, así que 14 + 9 = 14 + 6 + 3. Los 6 completan una veintena (20) y sobran 3.",
        board1: { 0: 14 },
        highlight: [1, 0],
      },
      {
        title: "Sube el acarreo y deja lo que sobra",
        text: "Sube 1 cuenta de abajo en la columna 20¹ (vale 20) y deja 3 cuentas de abajo en 20⁰. Resultado: 20 + 3 = 23.",
        board1: { 1: 1, 0: 3 },
        highlight: [1, 0],
      },
    ],
  },
  {
    id: "subtraction",
    label: "Resta",
    formula: "22 − 7 = 15",
    twoBoards: false,
    intro: [
      "Retira cuentas hacia los extremos, de derecha a izquierda. Una cuenta de arriba (5) se puede cambiar por 5 de abajo si necesitas quitar unidades sueltas.",
      "Si en la columna no alcanzan las cuentas, pide prestado a la varilla de la izquierda: retira 1 cuenta de esa columna y devuelve en la tuya el complemento (20 menos lo que querías quitar). Una columna solo llega a 19, por eso no se «baja» el 20 completo.",
    ],
    steps: [
      {
        title: "Representa el minuendo",
        text: "Forma 22: 1 cuenta de abajo en 20¹ (20) y 2 cuentas de abajo en 20⁰ (2).",
        board1: { 1: 1, 0: 2 },
        highlight: [1, 0],
      },
      {
        title: "Pide prestado a la varilla de la izquierda",
        text: "Quieres quitar 7 en 20⁰, pero solo hay 2. Retira la cuenta de 20¹ (−20). Como solo debías quitar 7, te pasaste por 13 (20 − 7 = 13) y esos 13 hay que devolverlos en 20⁰. Ahora el tablero marca 2.",
        board1: { 0: 2 },
        highlight: [1, 0],
      },
      {
        title: "Devuelve el complemento",
        text: "Suma 13 en 20⁰: son 2 cuentas de arriba (10) y 3 de abajo. Con las 2 de abajo que ya había, las de abajo suman 5: cámbialas por 1 de arriba (regla del 5). Quedan 3 cuentas de arriba: 3 × 5 = 15.",
        board1: { 0: 15 },
        highlight: [0],
      },
    ],
  },
  {
    id: "multiplication",
    label: "Multiplicación",
    formula: "12 × 4 = 48",
    twoBoards: true,
    note: "Tablero 1 guarda los factores: el 12 a la derecha y el 4 en la columna azul de la izquierda. Su lectura en base 10 no importa. El producto se lee en el Tablero 2.",
    intro: [
      "Usa los 2 ábacos en paralelo. El Tablero 1 guarda los factores: el multiplicando a la derecha y el multiplicador en la columna azul de la izquierda. El Tablero 2 acumula los productos parciales en cada nivel vigesimal.",
      "Descompón el multiplicando (por ejemplo 12 = 10 + 2), multiplica cada parte por el multiplicador y registra el resultado en su columna. Si una columna pasa de 19, aplica el acarreo de 20.",
    ],
    steps: [
      {
        title: "Coloca los factores en el Tablero 1",
        text: "Pon 12 a la derecha (2 cuentas de arriba y 2 de abajo en 20⁰) y 4 en la columna azul de la izquierda (4 cuentas de abajo en 20¹²). El Tablero 2 empieza en 0.",
        board1: { 0: 12, 12: 4 },
        board2: {},
        highlight: [12, 0],
      },
      {
        title: "Multiplica 4 × 12",
        text: "12 = 10 + 2. Entonces 4 × 10 = 40 y 4 × 2 = 8. Los 40 son dos veintenas (2 × 20) y los 8 son unidades: 4 × 12 = 40 + 8 = 48.",
        board1: { 0: 12, 12: 4 },
        board2: {},
        highlight: [12, 0],
      },
      {
        title: "Registra el producto en el Tablero 2",
        text: "En 20¹ deja 2 cuentas de abajo (2 × 20 = 40). En 20⁰ deja 1 cuenta de arriba y 3 de abajo (5 + 3 = 8). Resultado: 40 + 8 = 48.",
        board1: { 0: 12, 12: 4 },
        board2: { 1: 2, 0: 8 },
        highlight: [1, 0],
      },
    ],
  },
  {
    id: "division",
    label: "División",
    formula: "45 ÷ 3 = 15",
    twoBoards: true,
    note: "Tablero 1 guarda el dividendo, que se va vaciando. El cociente se acumula en el Tablero 2.",
    intro: [
      "Divide con restas sucesivas por niveles, de izquierda a derecha. Coloca el dividendo en el Tablero 1 y, en cada nivel vigesimal, resta el divisor todas las veces que quepa. Anota cuántas veces en el Tablero 2: ese es el cociente.",
      "Lo que sobra de un nivel se convierte en unidades del nivel siguiente (1 cuenta de la izquierda vale 20 de la derecha). El Tablero 1 debe quedar vacío.",
    ],
    steps: [
      {
        title: "Representa el dividendo en el Tablero 1",
        text: "Forma 45: 2 cuentas de abajo en 20¹ (2 × 20 = 40) y 1 cuenta de arriba en 20⁰ (5).",
        board1: { 1: 2, 0: 5 },
        board2: {},
        highlight: [1, 0],
      },
      {
        title: "Nivel 20¹: ¿cuántas veces cabe 3 en 40?",
        text: "Las 2 veintenas valen 40. El 3 cabe 13 veces (13 × 3 = 39) y sobra 1. Retira las 2 veintenas, deja ese 1 sobrante junto al 5 de 20⁰ (queda 6) y registra 13 en el Tablero 2 (2 cuentas de arriba y 3 de abajo).",
        board1: { 0: 6 },
        board2: { 0: 13 },
        highlight: [1, 0],
      },
      {
        title: "Nivel 20⁰: ¿cuántas veces cabe 3 en 6?",
        text: "Caben 2 veces (2 × 3 = 6) y el Tablero 1 queda vacío. En el Tablero 2 suma 13 + 2 = 15: 3 cuentas de arriba en 20⁰. Resultado: 45 ÷ 3 = 15.",
        board1: {},
        board2: { 0: 15 },
        highlight: [0],
      },
    ],
  },
];

/** Estado del ábaco al terminar la operación. */
export function finalSetup(operation: GuideOperation): AbacusSetup {
  const last = operation.steps[operation.steps.length - 1];
  return {
    board1: columnsFromDigits(last?.board1 ?? {}),
    board2: operation.twoBoards ? columnsFromDigits(last?.board2 ?? {}) : null,
    ...(operation.note ? { note: operation.note } : {}),
  };
}

export function operationById(id: GuideOperationId): GuideOperation | undefined {
  return GUIDE_OPERATIONS.find((o) => o.id === id);
}
