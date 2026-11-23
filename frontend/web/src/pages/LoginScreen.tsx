import { useState } from "react";
import type { FormEvent } from "react";
import { GraduationCap, Loader2, LogIn, Moon, Sun, UserRound } from "lucide-react";
import { useAuth } from "../hooks/useAuth.ts";
import { isDemoMode } from "../services/auth.ts";
import type { Role } from "../types/auth.ts";

interface LoginScreenProps {
  dark: boolean;
  onToggleTheme: () => void;
}

const FIELD =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none dark:border-[#2A3347] dark:bg-[#161E30] dark:text-white";

export function LoginScreen({ dark, onToggleTheme }: LoginScreenProps) {
  const { signIn, signInDemo, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState<"password" | Role | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy || !email.trim() || !password) return;
    setBusy("password");
    await signIn(email.trim(), password);
    setBusy(null);
  }

  async function demo(role: Role) {
    if (busy) return;
    setBusy(role);
    await signInDemo(role);
    setBusy(null);
  }

  return (
    <main className="relative grid min-h-screen place-items-center bg-white p-4 text-slate-900 dark:bg-[#0B0F1A] dark:text-white">
      <button
        type="button"
        onClick={onToggleTheme}
        aria-label="Cambiar tema"
        className="absolute top-4 right-4 grid size-9 place-items-center rounded-full text-slate-600 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none dark:text-slate-300 dark:hover:bg-white/5"
      >
        {dark ? <Sun className="size-5" strokeWidth={1.75} /> : <Moon className="size-5" strokeWidth={1.75} />}
      </button>

      <section
        aria-label="Acceso a Synapz"
        className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8 dark:border-[#222B3E] dark:bg-[#131A29] dark:shadow-none"
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <img src="/synapz.png" alt="Synapz" className="size-14 object-contain" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Bienvenido a Synapz</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Inicia sesión para continuar con tu aprendizaje.</p>
          </div>
        </div>

        <form onSubmit={(e) => void submit(e)} className="mt-6 flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
            Correo electrónico
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nombre@escuela.mx"
              className={FIELD}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
            Contraseña
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={FIELD}
            />
          </label>
          <button
            type="submit"
            disabled={busy !== null || !email.trim() || !password}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-blue-500 text-sm font-semibold text-white transition-colors duration-150 hover:bg-blue-600 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-50 dark:focus-visible:ring-offset-[#131A29]"
          >
            {busy === "password" ? <Loader2 className="size-4 animate-spin" /> : <LogIn className="size-4" strokeWidth={1.75} />}
            Iniciar sesión
          </button>
        </form>

        <p role="alert" aria-live="polite" className="mt-3 min-h-5 text-center text-xs text-rose-600 dark:text-rose-400">
          {error}
        </p>

        {isDemoMode && (
          <div className="mt-3 flex flex-col gap-3 border-t border-slate-200 pt-5 dark:border-[#222B3E]">
            <p className="text-center text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
              Acceso rápido demo
            </p>
            <button
              type="button"
              onClick={() => void demo("student")}
              disabled={busy !== null}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-blue-50 px-5 text-sm font-semibold text-blue-600 transition-colors duration-150 hover:bg-blue-100 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none disabled:opacity-50 dark:bg-[#1B2438] dark:text-blue-100 dark:hover:bg-[#222d47]"
            >
              {busy === "student" ? <Loader2 className="size-4 animate-spin" /> : <UserRound className="size-4" strokeWidth={1.75} />}
              Entrar como Alumno (Alex)
            </button>
            <button
              type="button"
              onClick={() => void demo("teacher")}
              disabled={busy !== null}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-amber-400 px-5 text-sm font-semibold text-slate-900 transition-colors duration-150 hover:bg-amber-300 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-50 dark:focus-visible:ring-offset-[#131A29]"
            >
              {busy === "teacher" ? <Loader2 className="size-4 animate-spin" /> : <GraduationCap className="size-4" strokeWidth={1.75} />}
              Entrar como Profesor
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
