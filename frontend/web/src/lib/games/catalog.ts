import { Blocks, Bomb, Brain, Crown, Grid3x3, Layers, LayoutGrid, Shapes, Zap } from "lucide-react";
import type { GameId, GameInfo } from "../../types/games.ts";

/** Catálogo de los 9 juegos de Retos, en el orden de la cuadrícula. */
export const GAMES: readonly GameInfo[] = [
  {
    id: "batalla",
    title: "Batalla rápida",
    description: "Responde preguntas contra reloj y sube en el ranking del aula.",
    icon: Zap,
    tone: "amber",
    tags: ["Contra reloj", "Ranking"],
    height: "medium",
  },
  {
    id: "calculo",
    title: "Cálculo mental",
    description: "Resuelve operaciones sin papel y mejora tu agilidad numérica.",
    icon: Brain,
    tone: "blue",
    tags: ["Matemáticas"],
    height: "short",
  },
  {
    id: "sudoku",
    title: "Sudoku de lógica",
    description: "Completa el tablero sin repetir números en filas, columnas ni bloques.",
    icon: Grid3x3,
    tone: "emerald",
    tags: ["Lógica"],
    height: "tall",
  },
  {
    id: "ajedrez",
    title: "Ajedrez",
    description: "Partida completa para dos jugadores en el mismo dispositivo.",
    icon: Crown,
    tone: "violet",
    tags: ["2 jugadores", "Estrategia"],
    height: "tall",
  },
  {
    id: "quince",
    title: "Juego del 15",
    description: "Desliza las fichas hasta ordenarlas del 1 al 15.",
    icon: LayoutGrid,
    tone: "blue",
    tags: ["Lógica"],
    height: "short",
  },
  {
    id: "buscaminas",
    title: "Buscaminas",
    description: "Deduce dónde están las minas sin pisar ninguna.",
    icon: Bomb,
    tone: "emerald",
    tags: ["Lógica", "Tiempo"],
    height: "medium",
  },
  {
    id: "tangram",
    title: "Tangram",
    description: "Arma la figura con las siete piezas girando y moviendo cada una.",
    icon: Shapes,
    tone: "amber",
    tags: ["Geometría"],
    height: "tall",
  },
  {
    id: "tetris",
    title: "Tetris",
    description: "Encaja las piezas que caen y completa líneas antes de que llenen el tablero.",
    icon: Blocks,
    tone: "violet",
    tags: ["Reflejos"],
    height: "medium",
  },
  {
    id: "memorama",
    title: "Memorama",
    description: "Encuentra todas las parejas de cartas con el menor número de intentos.",
    icon: Layers,
    tone: "amber",
    tags: ["Memoria"],
    height: "short",
  },
];

/** Devuelve la ficha de un juego o lanza un error si el id no está en el catálogo. */
export function gameInfo(id: GameId): GameInfo {
  const info = GAMES.find((game) => game.id === id);
  if (!info) throw new Error(`Juego no encontrado en el catálogo: ${id}`);
  return info;
}
