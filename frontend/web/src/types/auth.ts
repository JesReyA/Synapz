/**
 * Tipos de sesión y roles. `Role` y `Profile` reflejan API_CONTRACT.md (§0 y tabla `profiles`).
 */

export type Role = "teacher" | "student";

/** Fila de `profiles` que necesita la app para decidir el layout. */
export interface Profile {
  id: string;
  role: Role;
  full_name: string;
}

export interface AuthUser extends Profile {
  email: string;
  /** Sesión de demostración: habilita el interruptor de rol. */
  demo: boolean;
}

export type AuthResult = { ok: true; user: AuthUser } | { ok: false; message: string };

/**
 * Contrato del servicio de autenticación. La implementación real usa Supabase Auth:
 *  - `signInWithPassword` → `supabase.auth.signInWithPassword({ email, password })`
 *  - rol → `supabase.from("profiles").select("id, role, full_name").eq("id", user.id).single()`
 *  - `onAuthChange` → `supabase.auth.onAuthStateChange`
 */
export interface AuthService {
  getCurrentUser: () => Promise<AuthUser | null>;
  signInWithPassword: (email: string, password: string) => Promise<AuthResult>;
  signInDemo: (role: Role) => Promise<AuthResult>;
  signOut: () => Promise<void>;
}
