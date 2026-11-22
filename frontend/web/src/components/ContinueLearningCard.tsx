import { Play } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

function FractionPie({ dark, fraction }: { dark: boolean; fraction: [number, number] }) {
  const [num, den] = fraction;
  const data = Array.from({ length: den }, (_, i) => i);
  const on = dark ? "#4A7BFF" : "#3B6EF5";
  const off = dark ? "#2B3C5E" : "#C5D6FB";
  const edge = dark ? "#1B2C52" : "#EAF1FF";
  return (
    <div className="size-28 md:size-32">
      <ResponsiveContainer width="100%" height="100%"><PieChart>
        <Pie
          data={data}
          dataKey={() => 1}
          startAngle={90}
          endAngle={-270}
          outerRadius="100%"
          stroke={edge}
          strokeWidth={2}
          isAnimationActive={false}
        >
          {data.map((i) => (
            <Cell key={i} fill={i < num ? (i === 0 ? off : on) : off} />
          ))}
        </Pie>
      </PieChart></ResponsiveContainer>
    </div>
  );
}

function Sparkle() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className="absolute -top-1 right-0 size-9 text-amber-400">
      <g stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <line x1="16" y1="3" x2="13" y2="11" />
        <line x1="24" y1="9" x2="18" y2="14" />
        <line x1="29" y1="18" x2="21" y2="18" />
      </g>
    </svg>
  );
}

type ContinueLearningCardProps = {
  title?: string;
  progress?: number;
  fraction?: [number, number];
  dark: boolean;
  onContinue?: () => void;
};

export function ContinueLearningCard({
  title = "Fracciones y operaciones",
  progress = 68,
  fraction = [3, 4],
  dark,
  onContinue = () => {},
}: ContinueLearningCardProps) {
  return (
    <section className="grid grid-cols-1 items-center gap-4 rounded-3xl border border-blue-100 bg-linear-to-br from-blue-50 to-blue-100 p-6 shadow-sm sm:grid-cols-[1fr_auto] dark:border-[#222B3E] dark:from-[#16233F] dark:to-[#1B2C52] dark:shadow-none">
      <div className="order-2 sm:order-1">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Continuar aprendiendo</h2>
        <p className="mt-3 text-2xl font-bold leading-tight text-slate-900 md:text-3xl dark:text-white">
          {title}
        </p>
        <div className="mt-4 flex items-center gap-3">
          <div
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            className="h-2 flex-1 rounded-full bg-white/80 dark:bg-[#2A3347]"
          >
            <div className="h-full rounded-full bg-emerald-500" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">{progress}%</span>
        </div>
        <button
          type="button"
          onClick={onContinue}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-amber-400 px-6 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition-colors duration-150 hover:bg-amber-300 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none dark:shadow-none"
        >
          <Play className="size-4 fill-current" strokeWidth={1.75} />
          Continuar
        </button>
      </div>
      <div className="relative order-1 flex items-center justify-center gap-3 sm:order-2 sm:pt-4">
        <Sparkle />
        <FractionPie dark={dark} fraction={fraction} />
        <div className="flex flex-col items-center text-2xl font-bold tabular-nums leading-none text-slate-900 dark:text-white">
          <span>{fraction[0]}</span>
          <span className="my-1.5 h-0.5 w-5 rounded-full bg-current" />
          <span>{fraction[1]}</span>
        </div>
      </div>
    </section>
  );
}


