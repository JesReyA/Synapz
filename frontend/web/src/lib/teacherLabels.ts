import type { TopicKind, TopicStatus } from "../types/classes.ts";

export const KIND_LABEL: Record<TopicKind, string> = {
  cycle: "Ciclo actual",
  prerequisite: "Nivelación / Rezago",
};

export const STATUS_META: Record<TopicStatus, { label: string; tone: string }> = {
  pending: { label: "Pendiente", tone: "bg-slate-100 text-slate-600 dark:bg-[#1B2438] dark:text-slate-300" },
  taught: { label: "Impartido", tone: "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300" },
  review: { label: "A repasar", tone: "bg-orange-100 text-orange-700 dark:bg-amber-900/40 dark:text-amber-300" },
};

export function formatLongDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
}

export function formatChars(chars: number): string {
  return chars.toLocaleString("es-MX");
}