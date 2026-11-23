import { useContext } from "react";
import { AuthContext } from "../context/authContextValue.ts";
import type { AuthContextValue } from "../context/authContextValue.ts";

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>.");
  return ctx;
}
