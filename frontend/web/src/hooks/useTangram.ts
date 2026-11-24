import { useCallback, useMemo, useState } from "react";
import {
  BOARD_AREA,
  FIGURES,
  initialLayout,
  isFigureComplete,
  matchPieces,
  polygonOf,
  snap,
} from "../lib/games/tangram.ts";
import type { TanPlacement, TangramFigure } from "../types/tangram.ts";
import { useGameTimer } from "./useGameTimer.ts";

const NUDGE_STEP = 0.25;
const ROTATION_STEP = 45;

/** Desplaza la pieza lo mínimo necesario para que su polígono quede dentro del tablero. */
function clampToBoard(placement: TanPlacement): TanPlacement {
  const points = polygonOf(placement);
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  const right = BOARD_AREA.x + BOARD_AREA.width;
  const bottom = BOARD_AREA.y + BOARD_AREA.height;
  let dx = 0;
  let dy = 0;
  if (minX < BOARD_AREA.x) dx = BOARD_AREA.x - minX;
  else if (maxX > right) dx = right - maxX;
  if (minY < BOARD_AREA.y) dy = BOARD_AREA.y - minY;
  else if (maxY > bottom) dy = bottom - maxY;
  return dx === 0 && dy === 0 ? placement : { ...placement, x: placement.x + dx, y: placement.y + dy };
}

function firstFigure(): TangramFigure {
  const figure = FIGURES[0];
  if (!figure) throw new Error("No hay figuras del Tangram definidas");
  return figure;
}

/** Estado del Tangram: figura elegida, posición de las 7 piezas, selección y cronómetro. */
export function useTangram() {
  const [figureId, setFigureId] = useState<string>(() => firstFigure().id);
  const [pieces, setPieces] = useState<TanPlacement[]>(() => initialLayout());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [started, setStarted] = useState(false);

  const figure = useMemo<TangramFigure>(
    () => FIGURES.find((f) => f.id === figureId) ?? firstFigure(),
    [figureId],
  );
  const matched = useMemo(() => matchPieces(pieces, figure), [pieces, figure]);
  const complete = useMemo(() => isFigureComplete(pieces, figure), [pieces, figure]);
  const selected = useMemo(() => pieces.find((p) => p.id === selectedId) ?? null, [pieces, selectedId]);
  const { elapsed, reset: resetTimer } = useGameTimer(started && !complete);

  const update = useCallback((id: string, change: (piece: TanPlacement) => TanPlacement) => {
    setPieces((prev) => prev.map((p) => (p.id === id ? change(p) : p)));
    setStarted(true);
  }, []);

  const select = useCallback(
    (id: string) => {
      if (complete) return;
      setSelectedId(id);
    },
    [complete],
  );

  /** Mueve la pieza al centro dado sin ajustar a la rejilla (durante el arrastre). */
  const movePiece = useCallback(
    (id: string, x: number, y: number) => {
      if (complete) return;
      update(id, (p) => clampToBoard({ ...p, x, y }));
    },
    [complete, update],
  );

  /** Al soltar: ajusta a la rejilla y mantiene la pieza dentro del tablero. */
  const dropPiece = useCallback(
    (id: string) => {
      if (complete) return;
      update(id, (p) => clampToBoard(snap(p)));
    },
    [complete, update],
  );

  /** Mueve la pieza seleccionada `dx`, `dy` pasos de rejilla (de 0.25 unidades). */
  const nudge = useCallback(
    (dx: number, dy: number) => {
      if (complete || selectedId === null) return;
      update(selectedId, (p) => clampToBoard(snap({ ...p, x: p.x + dx * NUDGE_STEP, y: p.y + dy * NUDGE_STEP })));
    },
    [complete, selectedId, update],
  );

  const rotate = useCallback(
    (dir: 1 | -1) => {
      if (complete || selectedId === null) return;
      update(selectedId, (p) =>
        clampToBoard({ ...p, rotation: (((p.rotation + dir * ROTATION_STEP) % 360) + 360) % 360 }),
      );
    },
    [complete, selectedId, update],
  );

  /** Voltea la pieza seleccionada; solo tiene efecto en el paralelogramo. */
  const flip = useCallback(() => {
    if (complete || selectedId === null) return;
    update(selectedId, (p) => (p.kind === "parallelogram" ? clampToBoard({ ...p, flipped: !p.flipped }) : p));
  }, [complete, selectedId, update]);

  const resetBoard = useCallback(() => {
    setPieces(initialLayout());
    setSelectedId(null);
    setStarted(false);
    resetTimer();
  }, [resetTimer]);

  const chooseFigure = useCallback(
    (id: string) => {
      if (!FIGURES.some((f) => f.id === id)) return;
      setFigureId(id);
      resetBoard();
    },
    [resetBoard],
  );

  return {
    figureId,
    figure,
    pieces,
    selectedId,
    selected,
    matched,
    complete,
    started,
    elapsed,
    select,
    movePiece,
    dropPiece,
    nudge,
    rotate,
    flip,
    chooseFigure,
    reset: resetBoard,
  };
}
