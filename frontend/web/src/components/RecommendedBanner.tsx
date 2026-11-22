import { FileText, Sparkles, ArrowRight } from "lucide-react";

type RecommendedBannerProps = { title?: string; reason?: string; onStart?: () => void };

export function RecommendedBanner({
  title = "Práctica personalizada de fracciones",
  reason = "Basada en tus avances y áreas de mejora.",
  onStart = () => {},
}: RecommendedBannerProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#222B3E] dark:bg-[#131A29] dark:shadow-none">
      <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Recomendado para ti</h2>
      <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div
          aria-hidden="true"
          className="relative grid h-20 w-full shrink-0 place-items-center rounded-2xl bg-blue-100 sm:w-32 dark:bg-[#1B2C52]"
        >
          <FileText className="size-10 text-blue-500 dark:text-blue-300" strokeWidth={1.5} />
          <Sparkles className="absolute top-2 right-4 size-5 text-amber-400" strokeWidth={1.75} />
        </div>
        <div className="min-w-0">
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-600 dark:bg-blue-500/20 dark:text-blue-300">
            IA
            <Sparkles className="size-3" strokeWidth={2} />
          </span>
          <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{reason}</p>
        </div>
        <button
          type="button"
          onClick={onStart}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-50 px-5 py-2 text-sm font-semibold text-blue-600 transition-colors duration-150 hover:bg-blue-100 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none sm:ml-auto dark:bg-[#1B2438] dark:text-blue-100 dark:hover:bg-[#222d47]"
        >
          Comenzar
          <ArrowRight className="size-4" strokeWidth={1.75} />
        </button>
      </div>
    </section>
  );
}

