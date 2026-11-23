import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "./hooks/useAuth.ts";
import { StudentLayout } from "./layouts/StudentLayout.tsx";
import { TeacherLayout } from "./layouts/TeacherLayout.tsx";
import { LoginScreen } from "./pages/LoginScreen.tsx";

export default function App() {
  const { user, role, loading, canSwitchRole, switchDemoRole, signOut } = useAuth();
  const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark");

  useEffect(() => {
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  const toggleTheme = () => setDark((d) => !d);
  const switchRole = canSwitchRole ? () => void switchDemoRole() : undefined;

  return (
    <div className={dark ? "dark" : ""}>
      {loading && (
        <div className="grid min-h-screen place-items-center bg-white dark:bg-[#0B0F1A]" role="status" aria-label="Cargando">
          <Loader2 className="size-6 animate-spin text-slate-400" />
        </div>
      )}
      {!loading && !user && <LoginScreen dark={dark} onToggleTheme={toggleTheme} />}
      {!loading && user && role === "student" && (
        <StudentLayout
          name={user.full_name}
          dark={dark}
          onToggleTheme={toggleTheme}
          {...(switchRole ? { onSwitchRole: switchRole } : {})}
          onSignOut={() => void signOut()}
        />
      )}
      {!loading && user && role === "teacher" && (
        <TeacherLayout
          name={user.full_name}
          dark={dark}
          onToggleTheme={toggleTheme}
          {...(switchRole ? { onSwitchRole: switchRole } : {})}
          onSignOut={() => void signOut()}
        />
      )}
    </div>
  );
}
