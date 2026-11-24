import { useId, useState } from "react";
import { BookOpen, ChevronDown, Landmark, ListOrdered } from "lucide-react";
import { describeColumns, formatBig } from "../../../lib/nepohualtzintzin.ts";

interface NepohualtzintzinGuideProps {
  /** Carga un ejemplo en el Tablero 1. */
  onShowExample: (value: bigint) => void;
}

const EXAMPLES: { value: bigint; title: string; idea: string }[] = [
  { value: 14n, title: "Cómo formar el 14", idea: "14 = 2 × 5 + 4. Usa 2 cuentas de arriba y 4 de abajo en la última columna." },
  { value: 25n, title: "Cómo formar el 25", idea: "25 = 1 × 20 + 5. Una cuenta de abajo en la columna de 20 y una de arriba (5) en la de 1." },
];

const POWERS = [
  { label: "20⁰", value: 1 },
  { label: "20¹", value: 20 },
  { label: "20²", value: 400 },
  { label: "20³", value: 8000 },
];

export function NepohualtzintzinGuide({ onShowExample }: NepohualtzintzinGuideProps) {
  const [open, setOpen] = useState(false);
  const [example, setExample] = useState<bigint | null>(null);
  const panelId = useId();

  return (
    <section
      aria-label="Guía del Nepohualtzintzin"
      className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-[#222B3E] dark:bg-[#131A29] dark:shadow-none"
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-center gap-3 rounded-2xl p-5 text-left focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300">
          <BookOpen className="size-5" strokeWidth={1.75} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-slate-900 dark:text-white">¿Cómo se usa?</span>
          <span className="block text-xs text-slate-500 dark:text-slate-400">Origen cultural, reglas de lectura y ejemplos</span>
        </span>
        <ChevronDown className={`size-5 shrink-0 text-slate-500 transition-transform duration-150 dark:text-slate-400 ${open ? "rotate-180" : ""}`} strokeWidth={1.75} />
      </button>

      {open && (
        <div id={panelId} className="flex flex-col gap-5 border-t border-slate-200 p-5 dark:border-[#222B3E]">
          <div className="flex flex-col gap-2">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
              <Landmark className="size-4 text-rose-600 dark:text-rose-400" strokeWidth={1.75} />
              Origen cultural en México
            </h3>
            <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              Los pueblos mesoamericanos (olmecas, mayas y mexicas) contaban en base 20, o vigesimal, y escribían los números con puntos (1) y barras (5). El
              Nepohualtzintzin lleva esa lógica a un instrumento de cuentas. Su nombre viene del náhuatl: <em>nepohualli</em> es «cuenta» y el sufijo{" "}
              <em>-tzintzin</em> añade respeto, y se suele traducir como «la cuenta de los señores».
            </p>
            <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              No se conserva un ejemplar antiguo: el tablero que usas es una reconstrucción moderna basada en esa numeración. Practicarlo entrena el valor
              posicional y el cálculo mental, algo que una calculadora no ejercita.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
              <ListOrdered className="size-4 text-blue-500 dark:text-blue-300" strokeWidth={1.75} />
              Reglas de lectura
            </h3>
            <ol className="flex list-decimal flex-col gap-1.5 pl-5 text-sm text-slate-700 dark:text-slate-300">
              <li>Una cuenta cuenta solo si está pegada a la barra central. Las separadas valen 0.</li>
              <li>Cada cuenta de <strong>arriba</strong> vale <strong>5</strong> (hay 3 por columna) y cada cuenta de <strong>abajo</strong> vale <strong>1</strong> (hay 4).</li>
              <li>Una columna llega hasta 19 (3 × 5 + 4). Al llegar a 20 se reinicia la columna y se suma 1 en la columna de la izquierda.</li>
              <li>Se lee de derecha a izquierda: cada columna vale 20 veces la de su derecha.</li>
            </ol>
            <ul className="flex flex-wrap gap-2" aria-label="Valor de las primeras columnas">
              {POWERS.map((p) => (
                <li key={p.label} className="rounded-full bg-amber-100 px-3 py-1 text-xs text-slate-800 tabular-nums dark:bg-amber-400/15 dark:text-amber-100">
                  {p.label} = <strong className="font-semibold">{formatBig(BigInt(p.value))}</strong>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Ejemplos rápidos</h3>
            <div className="flex flex-wrap gap-2">
              {EXAMPLES.map((ex) => (
                <button
                  key={String(ex.value)}
                  type="button"
                  onClick={() => {
                    setExample(ex.value);
                    onShowExample(ex.value);
                  }}
                  aria-pressed={example === ex.value}
                  className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none ${
                    example === ex.value
                      ? "bg-blue-500 text-white"
                      : "bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-[#1B2438] dark:text-blue-100 dark:hover:bg-[#222d47]"
                  }`}
                >
                  {ex.title}
                </button>
              ))}
            </div>
            {example !== null && (
              <div aria-live="polite" className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700 dark:bg-[#161E30] dark:text-slate-300">
                <p className="font-medium text-slate-900 dark:text-white">{EXAMPLES.find((e) => e.value === example)?.idea}</p>
                <ul className="mt-2 flex list-disc flex-col gap-1 pl-5 text-xs">
                  {describeColumns(example).map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Ya lo coloqué en el Tablero 1. Muévelo tú para ver cómo cambia el valor.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
