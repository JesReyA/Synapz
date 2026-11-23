import { BarChart3, LayoutDashboard, School } from "lucide-react";
import { NavItem, ThemeSwitch } from "../Sidebar.tsx";
import type { NavEntry } from "../Sidebar.tsx";
import { SidebarFooterActions } from "../SidebarFooterActions.tsx";

export type TeacherView = "panel" | "aulas" | "reportes";

const NAV: (NavEntry & { id: TeacherView })[] = [
  { id: "panel", label: "Panel Docente", icon: LayoutDashboard },
  { id: "aulas", label: "Aulas y Temario", icon: School },
  { id: "reportes", label: "Reportes y Analítica", icon: BarChart3 },
];

interface TeacherSidebarProps {
  active: TeacherView;
  onSelect: (view: TeacherView) => void;
  dark: boolean;
  onToggleTheme: () => void;
  onSwitchRole?: () => void;
  onSignOut?: () => void;
}

export function TeacherSidebar({ active, onSelect, dark, onToggleTheme, onSwitchRole, onSignOut }: TeacherSidebarProps) {
  const select = (id: string) => {
    const view = NAV.find((n) => n.id === id);
    if (view) onSelect(view.id);
  };

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-24 shrink-0 flex-col items-stretch border-r border-slate-200 bg-white px-2 py-5 md:flex lg:w-44 dark:border-[#1E2535] dark:bg-[#0D111C]">
        <a href="/" className="mb-6 flex justify-center">
          <img src="/synapz.png" alt="Synapz" className="size-10 object-contain" />
        </a>
        <nav aria-label="Docente" className="flex flex-col gap-1">
          {NAV.map((item) => (
            <NavItem key={item.id} item={item} active={active === item.id} onSelect={select} wrapLabel />
          ))}
        </nav>
        <div className="mt-auto flex flex-col items-center gap-3 border-t border-slate-200 pt-4 dark:border-[#1E2535]">
          <ThemeSwitch dark={dark} onToggle={onToggleTheme} />
          <SidebarFooterActions
            {...(onSwitchRole ? { switchLabel: "Ver como Alumno", onSwitchRole } : {})}
            {...(onSignOut ? { onSignOut } : {})}
          />
        </div>
      </aside>

      <nav
        aria-label="Docente"
        className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-slate-200 bg-white px-2 py-1.5 md:hidden dark:border-[#1E2535] dark:bg-[#0D111C]"
      >
        {NAV.map((item) => (
          <NavItem key={item.id} item={item} active={active === item.id} onSelect={select} wrapLabel />
        ))}
      </nav>
    </>
  );
}
