import { ArrowRight, Calculator, Landmark } from "lucide-react";

interface NepohualtzintzinFeatureCardProps {
  onPractice: () => void;
}

export function NepohualtzintzinFeatureCard({ onPractice }: NepohualtzintzinFeatureCardProps) {
  return (
    <section
      aria-label="Nepohualtzintzin"
      className="relative overflow-hidden rounded-3xl border border-rose-200 bg-gradient-to-br from-rose-50 to-amber-50 p-6 dark:border-[#222B3E] dark:from-[#2A1620] dark:to-[#2A2214]"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-red-700 text-amber-300 dark:bg-red-800">
          <Calculator className="size-7" strokeWidth={1.75} />
        </span>
        <div className="min-w-0">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-semibold text-rose-700 dark:bg-white/10 dark:text-rose-300">
            <Landmark className="size-3" strokeWidth={2} />
            Herencia Matemática de México
          </span>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900 md:text-2xl dark:text-white">
            Nepohualtzintzin: Cálculo Mental Ancestral
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Cuenta en base 20 con un ábaco mesoamericano. Entrenas el valor posicional, la visualización y la agilidad para sumar, restar y multiplicar sin calculadora.
          </p>
        </div>
        <button
          type="button"
          onClick={onPractice}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-amber-400 px-6 py-2.5 text-sm font-semibold text-slate-900 transition-colors duration-150 hover:bg-amber-300 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none md:ml-auto dark:focus-visible:ring-offset-[#0B0F1A]"
        >
          Practicar ahora
          <ArrowRight className="size-4" strokeWidth={2} />
        </button>
      </div>
    </section>
  );
}
