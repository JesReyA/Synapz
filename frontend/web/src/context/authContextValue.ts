import { createContext } from "react";
import type { AuthUser, Role } from "../types/auth.ts";

export interface AuthContextValue {
  user: AuthUser | null;
  role: Role | null;
  /** Verdadero mientras se recupera la sesión inicial. */
  loading: boolean;
  /** Mensaje del último intento de acceso fallido. */
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signInDemo: (role: Role) => Promise<void>;
  signOut: () => Promise<void>;
  /** Alterna entre alumno y profesor. Solo funciona en sesiones de demostración. */
  switchDemoRole: () => Promise<void>;
  canSwitchRole: boolean;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
