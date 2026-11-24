import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { FeynNepohualtzintzinCoach } from "../components/learning/nepohualtzintzin/FeynNepohualtzintzinCoach.tsx";
import { NepohualtzintzinBoard } from "../components/learning/nepohualtzintzin/NepohualtzintzinBoard.tsx";
import { NepohualtzintzinGuide } from "../components/learning/nepohualtzintzin/NepohualtzintzinGuide.tsx";
import { emptyColumns, boardValue, valueToColumns } from "../lib/nepohualtzintzin.ts";
import type { BoardColumns } from "../types/nepohualtzintzin.ts";

interface NepohualtzintzinViewProps {
  onBack: () => void;
}

type BoardCount = 1 | 2;

export function NepohualtzintzinView({ onBack }: NepohualtzintzinViewProps) {
  const [count, setCount] = useState<BoardCount>(1);
  const [boardA, setBoardA] = useState<BoardColumns>(emptyColumns);
  const [boardB, setBoardB] = useState<BoardColumns>(emptyColumns);

  const answerBoard = count === 2 ? boardB : boardA;
  const answerLabel = count === 2 ? "Tablero 2 (Operando B / Resultado)" : "el tablero";

  return (
    <div className="flex flex-col gap-4 md:gap-5">
      <header className="flex flex-col gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 self-start rounded-md text-xs font-medium text-slate-500 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none dark:text-slate-400 dark:hover:text-white"
        >
          <ArrowLeft className="size-4" strokeWidth={1.75} />
          Volver a Aprender
        </button>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">Herencia Matemática de México</p>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Nepohualtzintzin</h2>
          </div>
          <div role="radiogroup" aria-label="Cantidad de ábacos" className="inline-flex rounded-full bg-slate-100 p-1 dark:bg-[#1B2438]">
            {(
              [
                { id: 1, label: "1 Ábaco" },
                { id: 2, label: "2 Ábacos en paralelo" },
              ] as const
            ).map((o) => (
              <button
                key={o.id}
                type="button"
                role="radio"
                aria-checked={count === o.id}
                onClick={() => setCount(o.id)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none ${
                  count === o.id
                    ? "bg-white text-blue-600 shadow-sm dark:bg-blue-500/25 dark:text-white dark:shadow-none"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className={`grid grid-cols-1 gap-4 md:gap-5 ${count === 2 ? "lg:grid-cols-2" : ""}`}>
        <NepohualtzintzinBoard
          title={count === 2 ? "Tablero 1 (Operando A)" : "Tablero 1"}
          columns={boardA}
          onChange={setBoardA}
        />
        {count === 2 && (
          <NepohualtzintzinBoard title="Tablero 2 (Operando B / Resultado)" columns={boardB} onChange={setBoardB} />
        )}
      </div>

      <FeynNepohualtzintzinCoach value={boardValue(answerBoard)} answerLabel={answerLabel} />
      <NepohualtzintzinGuide onShowExample={(v) => setBoardA(valueToColumns(v) ?? emptyColumns())} />
    </div>
  );
}
