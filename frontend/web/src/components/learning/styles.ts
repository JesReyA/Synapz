/** Clases compartidas de Aprender. Los colores salen de DESIGN.md §3. */

export const AMBER_BUTTON =
  "inline-flex items-center justify-center gap-2 rounded-full bg-amber-400 px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition-colors duration-150 hover:bg-amber-300 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-50 dark:shadow-none dark:focus-visible:ring-offset-[#131A29]";

export const SOFT_BUTTON =
  "inline-flex items-center justify-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-600 transition-colors duration-150 hover:bg-blue-100 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none disabled:opacity-50 dark:bg-[#1B2438] dark:text-blue-100 dark:hover:bg-[#222d47]";

export const OUTLINE_BUTTON =
  "inline-flex items-center justify-center gap-1.5 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition-colors duration-150 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none disabled:opacity-50 dark:border-[#2A3347] dark:text-slate-200 dark:hover:bg-white/5";

export const PANEL =
  "rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#222B3E] dark:bg-[#131A29] dark:shadow-none";

export const INNER_CARD = "rounded-2xl bg-slate-50 p-4 dark:bg-[#161E30]";

export const BACK_LINK =
  "inline-flex items-center gap-1.5 self-start rounded-md text-xs font-medium text-slate-500 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none dark:text-slate-400 dark:hover:text-white";

export function formatClock(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
