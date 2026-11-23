import type { AuthResult, AuthService, AuthUser, Profile, Role } from "../types/auth.ts";

/** Los accesos de demostración solo existen si `VITE_DEMO_MODE=true`. */
export const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true";

const STORAGE_KEY = "synapz.demo-role";

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Perfiles de demostración. En producción vienen de la tabla `profiles`. */
const DEMO_PROFILES: Record<Role, Profile & { email: string }> = {
  student: { id: "me", role: "student", full_name: "Alex Ramírez", email: "alex@demo.synapz" },
  teacher: { id: "t-laura", role: "teacher", full_name: "Laura Méndez", email: "laura@demo.synapz" },
};

function demoUser(role: Role): AuthUser {
  return { ...DEMO_PROFILES[role], demo: true };
}

function isRole(value: string | null): value is Role {
  return value === "student" || value === "teacher";
}

/**
 * Implementación simulada. Para conectar Supabase, cree otro objeto con la misma forma
 * y cámbielo en `authService` (ver `AuthService` en `types/auth.ts`).
 */
const mockAuthService: AuthService = {
  async getCurrentUser() {
    const stored = isDemoMode ? localStorage.getItem(STORAGE_KEY) : null;
    return isRole(stored) ? demoUser(stored) : null;
  },

  async signInWithPassword(): Promise<AuthResult> {
    await delay(500);
    return {
      ok: false,
      message: isDemoMode
        ? "El inicio de sesión real se activa al conectar Supabase. Usa un acceso rápido de demostración."
        : "El inicio de sesión aún no está disponible.",
    };
  },

  async signInDemo(role): Promise<AuthResult> {
    if (!isDemoMode) return { ok: false, message: "El modo demostración está desactivado." };
    await delay(250);
    localStorage.setItem(STORAGE_KEY, role);
    return { ok: true, user: demoUser(role) };
  },

  async signOut() {
    localStorage.removeItem(STORAGE_KEY);
  },
};

export const authService: AuthService = mockAuthService;
