import { Hammer } from "lucide-react";

export function PlaceholderPage({ title }: { title: string }) {
  return (
    <section className="grid place-items-center rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-[#2A3347] dark:bg-[#131A29]">
      <div className="flex flex-col items-center gap-3">
        <Hammer className="size-8 text-slate-400" strokeWidth={1.5} />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">Esta sección estará disponible pronto.</p>
      </div>
    </section>
  );
}
