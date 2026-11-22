import { Bell, Sun, Moon } from "lucide-react";

type TopHeaderProps = { name?: string; dark: boolean; onToggleTheme: () => void };

export function TopHeader({ name = "Alex", dark, onToggleTheme }: TopHeaderProps) {
  return (
    <header className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl dark:text-white">
          ¡Hola, {name}!
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Vamos paso a paso. Hoy tienes nuevas oportunidades para aprender.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label="Cambiar tema"
          className="grid size-8 place-items-center rounded-full text-slate-600 transition-colors duration-150 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none md:hidden dark:text-slate-300 dark:hover:bg-white/5"
        >
          {dark ? <Sun className="size-5" strokeWidth={1.75} /> : <Moon className="size-5" strokeWidth={1.75} />}
        </button>
        <button
          type="button"
          aria-label="Notificaciones"
          className="grid size-8 place-items-center rounded-full text-slate-600 transition-colors duration-150 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none dark:text-slate-300 dark:hover:bg-white/5"
        >
          <Bell className="size-5" strokeWidth={1.75} />
        </button>
        <div
          aria-label={`Perfil de ${name}`}
          className="grid size-8 place-items-center rounded-full bg-blue-500 text-sm font-semibold text-white"
        >
          {name.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}

