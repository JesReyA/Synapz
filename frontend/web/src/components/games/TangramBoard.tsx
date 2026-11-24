import { useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent } from "react";
import { BOARD_AREA, RESERVE_AREA, polygonOf } from "../../lib/games/tangram.ts";
import type { Point, TanKind, TanPlacement, TangramFigure } from "../../types/tangram.ts";

interface TangramBoardProps {
  figure: TangramFigure;
  pieces: readonly TanPlacement[];
  /** Ids de las piezas que coinciden con un hueco de la silueta. */
  matched: ReadonlySet<string>;
  selectedId: string | null;
  /** Figura completa: las piezas ya no se pueden mover. */
  disabled: boolean;
  onSelect: (id: string) => void;
  /** Movimiento durante el arrastre (centro de la pieza, sin ajuste). */
  onMove: (id: string, x: number, y: number) => void;
  onDrop: (id: string) => void;
}

interface DragState {
  id: string;
  pointerId: number;
  /** Diferencia entre el centro de la pieza y el puntero al agarrarla. */
  offsetX: number;
  offsetY: number;
  /** Falso si solo hubo un toque: no cuenta como movimiento ni arranca el cronómetro. */
  moved: boolean;
}

const KIND_NAME: Record<TanKind, string> = {
  large: "Triángulo grande",
  medium: "Triángulo mediano",
  small: "Triángulo pequeño",
  square: "Cuadrado",
  parallelogram: "Paralelogramo",
};

/** Colores literales (Tailwind no detecta clases construidas con piezas de texto). */
const PIECE_COLOR: Record<string, string> = {
  "large-1": "fill-blue-400 stroke-blue-600 dark:fill-blue-500 dark:stroke-blue-300",
  "large-2": "fill-cyan-400 stroke-cyan-600 dark:fill-cyan-500 dark:stroke-cyan-300",
  "medium-1": "fill-emerald-400 stroke-emerald-600 dark:fill-emerald-500 dark:stroke-emerald-300",
  "small-1": "fill-amber-400 stroke-amber-600 dark:fill-amber-400 dark:stroke-amber-200",
  "small-2": "fill-orange-400 stroke-orange-600 dark:fill-orange-500 dark:stroke-orange-300",
  "square-1": "fill-violet-400 stroke-violet-600 dark:fill-violet-500 dark:stroke-violet-300",
  "parallelogram-1": "fill-pink-400 stroke-pink-600 dark:fill-pink-500 dark:stroke-pink-300",
};
const FALLBACK_COLOR = "fill-slate-400 stroke-slate-600 dark:fill-slate-500 dark:stroke-slate-300";
const MATCHED_STROKE = "stroke-emerald-500 dark:stroke-emerald-400";
const SELECTED_STROKE = "stroke-slate-900 dark:stroke-white";

const STROKE_NORMAL = 0.06;
const STROKE_SELECTED = 0.14;

function pointsAttr(placement: TanPlacement): string {
  return polygonOf(placement)
    .map((p) => `${p.x.toFixed(3)},${p.y.toFixed(3)}`)
    .join(" ");
}

function pieceLabel(piece: TanPlacement, selected: boolean, matched: boolean): string {
  const number = piece.id.split("-")[1] ?? "";
  const flipped = piece.kind === "parallelogram" && piece.flipped ? ", volteado" : "";
  const parts = [`${KIND_NAME[piece.kind]} ${number}`.trim() + flipped];
  if (selected) parts.push("seleccionado");
  if (matched) parts.push("bien colocado");
  return parts.join(", ");
}

function strokeClass(id: string, selected: boolean, matched: boolean): string {
  if (matched) return MATCHED_STROKE;
  if (selected) return SELECTED_STROKE;
  return (PIECE_COLOR[id] ?? FALLBACK_COLOR).split(" ").filter((c) => c.includes("stroke-")).join(" ");
}

function fillClass(id: string): string {
  return (PIECE_COLOR[id] ?? FALLBACK_COLOR).split(" ").filter((c) => c.includes("fill-")).join(" ");
}

/** Convierte coordenadas de pantalla a unidades del SVG, o `null` si el SVG no está en pantalla. */
function toBoardPoint(svg: SVGSVGElement, clientX: number, clientY: number): Point | null {
  const ctm = svg.getScreenCTM();
  if (!ctm) return null;
  const point = svg.createSVGPoint();
  point.x = clientX;
  point.y = clientY;
  const result = point.matrixTransform(ctm.inverse());
  return { x: result.x, y: result.y };
}

/** Tablero SVG del Tangram: silueta objetivo, zona de reserva y 7 piezas arrastrables. */
export function TangramBoard({
  figure,
  pieces,
  matched,
  selectedId,
  disabled,
  onSelect,
  onMove,
  onDrop,
}: TangramBoardProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef<DragState | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  function handlePointerDown(e: PointerEvent<SVGGElement>, piece: TanPlacement) {
    if (disabled) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const svg = svgRef.current;
    if (!svg) return;
    const point = toBoardPoint(svg, e.clientX, e.clientY);
    if (!point) return;
    onSelect(piece.id);
    drag.current = {
      id: piece.id,
      pointerId: e.pointerId,
      offsetX: piece.x - point.x,
      offsetY: piece.y - point.y,
      moved: false,
    };
    // La captura va en el SVG: así sigue activa aunque la pieza cambie de sitio en el DOM.
    svg.setPointerCapture(e.pointerId);
    setDraggingId(piece.id);
  }

  function handlePointerMove(e: PointerEvent<SVGSVGElement>) {
    const state = drag.current;
    const svg = svgRef.current;
    if (!state || !svg || state.pointerId !== e.pointerId) return;
    const point = toBoardPoint(svg, e.clientX, e.clientY);
    if (!point) return;
    state.moved = true;
    onMove(state.id, point.x + state.offsetX, point.y + state.offsetY);
  }

  function endDrag(e: PointerEvent<SVGSVGElement>) {
    const state = drag.current;
    const svg = svgRef.current;
    if (!state || state.pointerId !== e.pointerId) return;
    if (svg?.hasPointerCapture(e.pointerId)) svg.releasePointerCapture(e.pointerId);
    drag.current = null;
    setDraggingId(null);
    if (state.moved) onDrop(state.id);
  }

  function handlePieceKeyDown(e: KeyboardEvent<SVGGElement>, id: string) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(id);
    }
  }

  const dragged = draggingId === null ? undefined : pieces.find((p) => p.id === draggingId);

  return (
    <svg
      ref={svgRef}
      viewBox={`${BOARD_AREA.x} ${BOARD_AREA.y} ${BOARD_AREA.width} ${BOARD_AREA.height}`}
      role="group"
      aria-label={`Tablero del Tangram: figura ${figure.name}`}
      className="w-full max-w-[32rem] select-none rounded-2xl bg-slate-50 dark:bg-[#161E30]"
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <g aria-hidden="true">
        {figure.solution.map((slot) => (
          <polygon key={slot.id} points={pointsAttr(slot)} className="fill-slate-200 dark:fill-[#2A3347]" />
        ))}
        <rect
          x={RESERVE_AREA.x + 0.1}
          y={RESERVE_AREA.y + 0.1}
          width={RESERVE_AREA.width - 0.2}
          height={RESERVE_AREA.height - 0.2}
          rx={0.25}
          strokeWidth={0.04}
          strokeDasharray="0.2 0.2"
          className="fill-none stroke-slate-300 dark:stroke-[#2A3347]"
        />
      </g>
      {pieces.map((piece) => {
        const isSelected = piece.id === selectedId;
        const isMatched = matched.has(piece.id);
        return (
          <g
            key={piece.id}
            role="button"
            tabIndex={0}
            aria-label={pieceLabel(piece, isSelected, isMatched)}
            aria-pressed={isSelected}
            aria-disabled={disabled}
            onPointerDown={(e) => handlePointerDown(e, piece)}
            onKeyDown={(e) => handlePieceKeyDown(e, piece.id)}
            onFocus={() => onSelect(piece.id)}
            className={`touch-none outline-none ${disabled ? "cursor-default" : "cursor-grab"}`}
          >
            <polygon
              points={pointsAttr(piece)}
              strokeWidth={isSelected ? STROKE_SELECTED : STROKE_NORMAL}
              strokeLinejoin="round"
              className={`touch-none ${fillClass(piece.id)} ${strokeClass(piece.id, isSelected, isMatched)}`}
            />
          </g>
        );
      })}
      {dragged && (
        <polygon
          aria-hidden="true"
          points={pointsAttr(dragged)}
          strokeWidth={STROKE_SELECTED}
          strokeLinejoin="round"
          className={`pointer-events-none ${fillClass(dragged.id)} ${strokeClass(
            dragged.id,
            true,
            matched.has(dragged.id),
          )}`}
        />
      )}
    </svg>
  );
}
