import { LogOut, Repeat } from "lucide-react";

const BASE =
  "flex w-full flex-col items-center gap-1 rounded-xl px-2 py-2 text-xs font-medium lg:flex-row lg:gap-2.5 transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none";

interface SidebarFooterActionsProps {
  /** Si existe, muestra el interruptor de rol (solo sesiones de demostración). */
  switchLabel?: string;
  onSwitchRole?: () => void;
  onSignOut?: () => void;
}

/** Acciones discretas al pie del menú lateral, compartidas por los dos roles. */
export function SidebarFooterActions({ switchLabel, onSwitchRole, onSignOut }: SidebarFooterActionsProps) {
  return (
    <>
      {onSwitchRole && (
        <button
          type="button"
          onClick={onSwitchRole}
          title="Cambiar de rol (modo demostración)"
          className={`${BASE} border border-dashed border-slate-300 text-slate-500 hover:bg-slate-100 dark:border-[#2A3347] dark:text-slate-400 dark:hover:bg-white/5`}
        >
          <Repeat className="size-4 shrink-0" strokeWidth={1.75} />
          <span className="text-center leading-tight lg:text-left">{switchLabel}</span>
        </button>
      )}
      {onSignOut && (
        <button
          type="button"
          onClick={onSignOut}
          className={`${BASE} text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5`}
        >
          <LogOut className="size-4 shrink-0" strokeWidth={1.75} />
          <span className="text-center leading-tight lg:text-left">Cerrar sesión</span>
        </button>
      )}
    </>
  );
}
