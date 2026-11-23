import type { LucideIcon } from "lucide-react";
import { SidebarFooterActions } from "./SidebarFooterActions.tsx";
import { Home, CalendarDays, Play, Trophy, BarChart3, Settings, Sun, Moon } from "lucide-react";

const NAV: NavEntry[] = [
  { id: "inicio", label: "Inicio", icon: Home },
  { id: "clases", label: "Mis clases", icon: CalendarDays },
  { id: "aprender", label: "Aprender", icon: Play },
  { id: "retos", label: "Retos", icon: Trophy },
  { id: "progreso", label: "Progreso", icon: BarChart3 },
];

export type NavEntry = { id: string; label: string; icon: LucideIcon };

export function NavItem({
  item,
  active,
  onSelect,
  wrapLabel = false,
}: {
  item: NavEntry;
  active: boolean;
  onSelect: (id: string) => void;
  /** Para etiquetas largas: en md apila icono y texto y deja que el texto se parta en vez de cortarse. */
  wrapLabel?: boolean;
}) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      onClick={() => onSelect(item.id)}
      aria-current={active ? "page" : undefined}
      className={`flex w-full flex-col items-center gap-1 rounded-xl px-2 py-2 text-xs font-medium transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none ${wrapLabel ? "md:flex-col lg:flex-row" : "md:flex-row"} md:gap-2.5 md:py-2.5 md:text-[13px] lg:justify-start ${
        active
          ? "bg-blue-100 text-blue-600 dark:bg-blue-500/25 dark:text-white"
          : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5"
      }`}
    >
      <Icon className="size-5 shrink-0 md:size-4" strokeWidth={1.75} />
      <span className={wrapLabel ? "text-center leading-tight lg:text-left" : "truncate"}>{item.label}</span>
    </button>
  );
}

export function ThemeSwitch({ dark, onToggle }: { dark: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label="Alternar modo oscuro"
      onClick={onToggle}
      className="relative flex h-7 w-14 items-center rounded-full bg-slate-200 transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none dark:bg-[#2A3347]"
    >
      <Sun className="absolute left-1.5 size-3.5 text-amber-500" strokeWidth={2} />
      <Moon className="absolute right-1.5 size-3.5 text-slate-400 dark:text-blue-300" strokeWidth={2} />
      <span
        className={`absolute top-0.5 size-6 rounded-full bg-white shadow transition-transform duration-200 dark:bg-blue-500 ${
          dark ? "translate-x-7.5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

type SidebarProps = {
  active?: string;
  onSelect?: (id: string) => void;
  dark: boolean;
  onToggleTheme: () => void;
  /** Interruptor de rol para presentaciones (solo sesiones de demostración). */
  onSwitchRole?: () => void;
  onSignOut?: () => void;
};

export function Sidebar({ active = "inicio", onSelect = () => {}, dark, onToggleTheme, onSwitchRole, onSignOut }: SidebarProps) {
  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-24 shrink-0 flex-col items-stretch border-r border-slate-200 bg-white px-2 py-5 md:flex lg:w-44 dark:border-[#1E2535] dark:bg-[#0D111C]">
        <a href="/" className="mb-6 flex justify-center">
          <img src="/synapz.png" alt="Synapz" className="size-10 object-contain" />
        </a>
        <nav aria-label="Principal" className="flex flex-col gap-1">
          {NAV.map((item) => (
            <NavItem key={item.id} item={item} active={active === item.id} onSelect={onSelect} />
          ))}
        </nav>
        <div className="mt-auto flex flex-col items-center gap-3 border-t border-slate-200 pt-4 dark:border-[#1E2535]">
          <ThemeSwitch dark={dark} onToggle={onToggleTheme} />
          <SidebarFooterActions
            {...(onSwitchRole ? { switchLabel: "Ver como Profesor", onSwitchRole } : {})}
            {...(onSignOut ? { onSignOut } : {})}
          />
          <button
            type="button"
            className="flex w-full flex-col items-center gap-1 rounded-xl px-2 py-2 text-xs font-medium text-slate-500 lg:flex-row lg:gap-2.5 transition-colors duration-150 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none dark:text-slate-400 dark:hover:bg-white/5"
          >
            <Settings className="size-4 shrink-0" strokeWidth={1.75} />
            <span className="text-center leading-tight lg:text-left">Configuración</span>
          </button>
        </div>
      </aside>

      <nav
        aria-label="Principal"
        className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-slate-200 bg-white px-2 py-1.5 md:hidden dark:border-[#1E2535] dark:bg-[#0D111C]"
      >
        {NAV.map((item) => (
          <NavItem key={item.id} item={item} active={active === item.id} onSelect={onSelect} />
        ))}
      </nav>
    </>
  );
}

