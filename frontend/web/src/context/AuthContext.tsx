import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { authService } from "../services/auth.ts";
import type { AuthResult, AuthUser, Role } from "../types/auth.ts";
import { AuthContext } from "./authContextValue.ts";
import type { AuthContextValue } from "./authContextValue.ts";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void authService.getCurrentUser().then((current) => {
      if (!active) return;
      setUser(current);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const apply = useCallback((result: AuthResult) => {
    if (result.ok) {
      setUser(result.user);
      setError(null);
    } else {
      setError(result.message);
    }
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => apply(await authService.signInWithPassword(email, password)),
    [apply],
  );

  const signInDemo = useCallback(async (role: Role) => apply(await authService.signInDemo(role)), [apply]);

  const signOut = useCallback(async () => {
    await authService.signOut();
    setUser(null);
    setError(null);
  }, []);

  const canSwitchRole = user?.demo === true;

  const switchDemoRole = useCallback(async () => {
    if (!user?.demo) return;
    apply(await authService.signInDemo(user.role === "teacher" ? "student" : "teacher"));
  }, [user, apply]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, role: user?.role ?? null, loading, error, signIn, signInDemo, signOut, switchDemoRole, canSwitchRole }),
    [user, loading, error, signIn, signInDemo, signOut, switchDemoRole, canSwitchRole],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
