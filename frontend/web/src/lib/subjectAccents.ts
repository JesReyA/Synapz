import type { LucideIcon } from "lucide-react";
import { BookOpen, Calculator, FlaskConical } from "lucide-react";
import type { SubjectAccent } from "../types/classes.ts";

export const ACCENTS: Record<SubjectAccent, { icon: LucideIcon; tile: string; ring: string }> = {
  blue: {
    icon: Calculator,
    tile: "bg-blue-500 text-white",
    ring: "ring-blue-500",
  },
  violet: {
    icon: BookOpen,
    tile: "bg-violet-100 text-violet-500 dark:bg-violet-500/20 dark:text-violet-400",
    ring: "ring-violet-500",
  },
  teal: {
    icon: FlaskConical,
    tile: "bg-teal-100 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400",
    ring: "ring-teal-500",
  },
};
