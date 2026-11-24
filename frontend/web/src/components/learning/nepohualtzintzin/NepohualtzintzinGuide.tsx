import { useId, useMemo, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Divide,
  Landmark,
  Minus,
  Plus,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { BASE, columnsFromDigits, describeColumns, formatBig, powerLabel } from "../../../lib/nepohualtzintzin.ts";
import { GUIDE_OPERATIONS, finalSetup } from "../../../lib/nepohualtzintzinGuide.ts";
import type { AbacusSetup, GuideOperation, GuideOperationId, PowerDigits } from "../../../types/nepohualtzintzin.ts";
import { MiniAbacus } from "./MiniAbacus.tsx";

interface NepohualtzintzinGuideProps {
  /** Configura el ábaco virtual (y activa 2 ábacos si hace falta). */
  onLoadSetup: (setup: AbacusSetup) => void;
}

type TabId = "fundamentals" | GuideOperationId;

const TABS: { id: TabId; label: string; icon: LucideIcon }[] = [
  { id: "fundamentals", label: "Fundamentos y Base 20", icon: BookOpen },
  { id: "addition", label: "Suma", icon: Plus },
  { id: "subtraction", label: "Resta", icon: Minus },
  { id: "multiplication", label: "Multiplicación", icon: X },
  { id: "division", label: "División", icon: Divide },
];

const PRIMARY =
  "inline-flex items-center justify-center gap-2 rounded-full bg-amber-400 px-5 py-2.5 text-sm font-semibold text-slate-900 transition-colors duration-150 hover:bg-amber-300 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-50 dark:focus-visible:ring-offset-[#131A29]";

const SECONDARY =
  "inline-flex items-center justify-center gap-1.5 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition-colors duration-150 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none disabled:opacity-40 dark:border-[#2A3347] dark:text-slate-200 dark:hover:bg-white/5";

const QUICK_EXAMPLES: { label: string; digits: PowerDigits; value: bigint }[] = [
  { label: "Cómo formar el 14", digits: { 0: 14 }, value: 14n },
  { label: "Cómo formar el 25", digits: { 1: 1, 0: 5 }, value: 25n },
];

const ROD_POWERS = [0, 1, 2, 3, 4, 12];

function Arrow() {
  return <ArrowRight className="size-5 shrink-0 rotate-90 text-slate-400 sm:rotate-0 dark:text-slate-500" strokeWidth={1.75} aria-hidden="true" />;
}

function RuleCard({ title, children, text }: { title: string; children: ReactNode; text: string }) {
  return (
    <article className="flex flex-col gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-[#161E30]">
      <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h4>
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">{children}</div>
      <p className="text-sm text-slate-700 dark:text-slate-300">{text}</p>
    </article>
  );
}

function Fundamentals({ onLoadSetup }: NepohualtzintzinGuideProps) {
  const [example, setExample] = useState<bigint | null>(null);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
          <Landmark className="size-4 text-rose-600 dark:text-rose-400" strokeWidth={1.75} />
          Herencia cultural en México
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

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Anatomía: 13 varillas, de 20⁰ a 20¹²</h3>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <MiniAbacus title="Una varilla con el 7" powers={[0]} digits={{ 0: 7 }} />
          <ul className="flex list-disc flex-col gap-1.5 pl-5 text-sm text-slate-700 dark:text-slate-300">
            <li>3 cuentas de arriba, de valor <strong>5</strong> cada una.</li>
            <li>La barra central: cuenta solo lo que está pegado a ella.</li>
            <li>4 cuentas de abajo, de valor <strong>1</strong> cada una.</li>
            <li>Cada varilla guarda de 0 a <strong>19</strong> (3 × 5 + 4).</li>
            <li>Se lee de derecha a izquierda: cada varilla vale 20 veces la de su derecha.</li>
          </ul>
        </div>
        <ul className="flex flex-wrap gap-2" aria-label="Valor de las varillas">
          {ROD_POWERS.map((p) => (
            <li key={p} className="rounded-full bg-amber-100 px-3 py-1 text-xs text-slate-800 tabular-nums dark:bg-amber-400/15 dark:text-amber-100">
              {powerLabel(p)} = <strong className="font-semibold">{formatBig(BASE ** BigInt(p))}</strong>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Dos reglas mecánicas</h3>
        <div className="grid gap-3 lg:grid-cols-2">
          <RuleCard
            title="Regla del 5"
            text="5 cuentas de abajo (valor 1) equivalen a 1 cuenta de arriba (valor 5). Si necesitas agregar una quinta de abajo, devuelve las 4 y sube 1 de arriba."
          >
            <MiniAbacus title="4 de abajo y falta 1" powers={[0]} digits={{ 0: 4 }} />
            <Arrow />
            <MiniAbacus title="1 de arriba" powers={[0]} digits={{ 0: 5 }} />
          </RuleCard>
          <RuleCard
            title="Regla del 20 (acarreo)"
            text="4 grupos de 5 (o 15 + 5 = 20) llenan una varilla. Al llegar a 20 se vacía y pasa como 1 cuenta de abajo (valor 1) a la varilla de la izquierda."
          >
            <MiniAbacus title="19 y sumas 1" powers={[1, 0]} digits={{ 0: 19 }} />
            <Arrow />
            <MiniAbacus title="20 = 1 veintena" powers={[1, 0]} digits={{ 1: 1 }} highlight={[1]} />
          </RuleCard>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Ejemplos rápidos</h3>
        <div className="flex flex-wrap gap-2">
          {QUICK_EXAMPLES.map((ex) => (
            <button
              key={ex.label}
              type="button"
              aria-pressed={example === ex.value}
              onClick={() => {
                setExample(ex.value);
                onLoadSetup({ board1: columnsFromDigits(ex.digits), board2: null });
              }}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none ${
                example === ex.value
                  ? "bg-blue-500 text-white"
                  : "bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-[#1B2438] dark:text-blue-100 dark:hover:bg-[#222d47]"
              }`}
            >
              {ex.label}
            </button>
          ))}
        </div>
        {example !== null && (
          <div aria-live="polite" className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700 dark:bg-[#161E30] dark:text-slate-300">
            <ul className="flex list-disc flex-col gap-1 pl-5">
              {describeColumns(example).map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Ya lo coloqué en el Tablero 1.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function powersOf(operation: GuideOperation, board: "board1" | "board2"): number[] {
  const set = new Set<number>([0, 1]);
  for (const step of operation.steps) {
    for (const key of Object.keys(step[board] ?? {})) set.add(Number(key));
  }
  return [...set].sort((a, b) => b - a);
}

function OperationTab({
  operation,
  step,
  onStep,
  onLoadSetup,
}: {
  operation: GuideOperation;
  step: number;
  onStep: (next: number) => void;
  onLoadSetup: (setup: AbacusSetup) => void;
}) {
  const total = operation.steps.length;
  const current = operation.steps[step] ?? operation.steps[0];
  const powers1 = useMemo(() => powersOf(operation, "board1"), [operation]);
  const powers2 = useMemo(() => powersOf(operation, "board2"), [operation]);
  if (!current) return null;
  const multi = operation.twoBoards;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        {operation.intro.map((p) => (
          <p key={p} className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{p}</p>
        ))}
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-4 dark:border-[#222B3E]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Ejemplo guiado: <span className="text-sm text-slate-900 dark:text-white">{operation.formula}</span>
          </p>
          <ol className="flex items-center gap-1.5" aria-label="Pasos">
            {operation.steps.map((s, i) => (
              <li key={s.title}>
                <button
                  type="button"
                  onClick={() => onStep(i)}
                  aria-label={`Ir al paso ${i + 1}`}
                  aria-current={i === step ? "step" : undefined}
                  className={`size-7 rounded-full text-xs font-bold transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none ${
                    i === step
                      ? "bg-amber-400 text-slate-900"
                      : i < step
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300"
                        : "bg-slate-100 text-slate-500 dark:bg-[#1B2438] dark:text-slate-400"
                  }`}
                >
                  {i + 1}
                </button>
              </li>
            ))}
          </ol>
        </div>

        <div aria-live="polite" className="flex flex-col gap-1">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
            Paso {step + 1} de {total}: {current.title}
          </h4>
          <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{current.text}</p>
        </div>

        <div className="flex flex-wrap items-start gap-4">
          <MiniAbacus title={multi ? "Tablero 1" : "Ábaco"} powers={powers1} digits={current.board1} highlight={current.highlight ?? []} />
          {multi && (
            <MiniAbacus
              title={operation.id === "multiplication" ? "Tablero 2 (productos)" : "Tablero 2 (cociente)"}
              powers={powers2}
              digits={current.board2 ?? {}}
              highlight={current.highlight ?? []}
            />
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => onStep(step - 1)} disabled={step === 0} className={SECONDARY}>
            <ChevronLeft className="size-3.5" strokeWidth={2} />
            Anterior
          </button>
          <button type="button" onClick={() => onStep(step + 1)} disabled={step === total - 1} className={SECONDARY}>
            Siguiente paso
            <ChevronRight className="size-3.5" strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => onLoadSetup(finalSetup(operation))} className={PRIMARY}>
          Ver resultado en el ábaco virtual
          <ArrowRight className="size-4" strokeWidth={2} />
        </button>
        {multi && <p className="text-xs text-slate-500 dark:text-slate-400">Activa el modo de 2 ábacos en paralelo.</p>}
      </div>
    </div>
  );
}

export function NepohualtzintzinGuide({ onLoadSetup }: NepohualtzintzinGuideProps) {
  const [open, setOpen] = useState(true);
  const [tab, setTab] = useState<TabId>("fundamentals");
  const [steps, setSteps] = useState<Record<GuideOperationId, number>>({
    addition: 0,
    subtraction: 0,
    multiplication: 0,
    division: 0,
  });
  const baseId = useId();

  const operation = GUIDE_OPERATIONS.find((o) => o.id === tab);

  function onTabKey(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const i = TABS.findIndex((t) => t.id === tab);
    const next = TABS[(i + (e.key === "ArrowRight" ? 1 : TABS.length - 1)) % TABS.length];
    if (next) {
      setTab(next.id);
      document.getElementById(`${baseId}-tab-${next.id}`)?.focus();
    }
    e.preventDefault();
  }

  return (
    <section
      aria-label="Guía del Nepohualtzintzin"
      className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-[#222B3E] dark:bg-[#131A29] dark:shadow-none"
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={`${baseId}-panel`}
        className="flex w-full items-center gap-3 rounded-2xl p-5 text-left focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300">
          <BookOpen className="size-5" strokeWidth={1.75} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-slate-900 dark:text-white">¿Cómo se usa?</span>
          <span className="block text-xs text-slate-500 dark:text-slate-400">Fundamentos y las cuatro operaciones paso a paso</span>
        </span>
        <ChevronDown className={`size-5 shrink-0 text-slate-500 transition-transform duration-150 dark:text-slate-400 ${open ? "rotate-180" : ""}`} strokeWidth={1.75} />
      </button>

      {open && (
        <div id={`${baseId}-panel`} className="flex flex-col gap-5 border-t border-slate-200 p-5 dark:border-[#222B3E]">
          <div role="tablist" aria-label="Temas de la guía" onKeyDown={onTabKey} className="flex gap-1 overflow-x-auto rounded-full bg-slate-100 p-1 dark:bg-[#1B2438]">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                id={`${baseId}-tab-${id}`}
                type="button"
                role="tab"
                aria-selected={tab === id}
                aria-controls={`${baseId}-tabpanel`}
                tabIndex={tab === id ? 0 : -1}
                onClick={() => setTab(id)}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none ${
                  tab === id
                    ? "bg-white text-blue-600 shadow-sm dark:bg-blue-500/25 dark:text-white dark:shadow-none"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                }`}
              >
                <Icon className="size-3.5" strokeWidth={1.75} />
                {label}
              </button>
            ))}
          </div>

          <div id={`${baseId}-tabpanel`} role="tabpanel" aria-labelledby={`${baseId}-tab-${tab}`}>
            {tab === "fundamentals" || !operation ? (
              <Fundamentals onLoadSetup={onLoadSetup} />
            ) : (
              <OperationTab
                key={operation.id}
                operation={operation}
                step={steps[operation.id]}
                onStep={(next) => setSteps((prev) => ({ ...prev, [operation.id]: Math.min(Math.max(next, 0), operation.steps.length - 1) }))}
                onLoadSetup={onLoadSetup}
              />
            )}
          </div>
        </div>
      )}
    </section>
  );
}
