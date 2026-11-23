import { useState } from "react";
import { Loader2 } from "lucide-react";
import { TeacherSidebar } from "../components/teacher/TeacherSidebar.tsx";
import type { TeacherView } from "../components/teacher/TeacherSidebar.tsx";
import { TopHeader } from "../components/TopHeader.tsx";
import { useTeacherWorkspace } from "../hooks/useTeacherWorkspace.ts";
import { TeacherClassesPage } from "../pages/teacher/TeacherClassesPage.tsx";
import { TeacherHomePage } from "../pages/teacher/TeacherHomePage.tsx";
import { TeacherReportsPage } from "../pages/teacher/TeacherReportsPage.tsx";

const HEADERS: Record<TeacherView, { title: string; subtitle: string }> = {
  panel: { title: "Panel Docente", subtitle: "Resumen de tus aulas, temas por atender y ranking del grupo." },
  aulas: { title: "Aulas y Temario", subtitle: "Crea aulas, organiza el temario y sube el material que usará Feyn." },
  reportes: { title: "Reportes y Analítica", subtitle: "Detecta rezago, mide estrategias y actúa a tiempo." },
};

interface TeacherLayoutProps {
  name: string;
  dark: boolean;
  onToggleTheme: () => void;
  onSwitchRole?: () => void;
  onSignOut: () => void;
}

export function TeacherLayout({ name, dark, onToggleTheme, onSwitchRole, onSignOut }: TeacherLayoutProps) {
  const [view, setView] = useState<TeacherView>("panel");
  const [pickedId, setPickedId] = useState<string | null>(null);
  const workspace = useTeacherWorkspace();

  const selectedId = pickedId ?? workspace.classrooms[0]?.id ?? null;
  const header = HEADERS[view];

  return (
    <div className="flex min-h-screen bg-white text-slate-900 transition-colors duration-150 dark:bg-[#0B0F1A] dark:text-white">
      <TeacherSidebar
        active={view}
        onSelect={setView}
        dark={dark}
        onToggleTheme={onToggleTheme}
        {...(onSwitchRole ? { onSwitchRole } : {})}
        onSignOut={onSignOut}
      />
      <main className="min-w-0 flex-1 p-4 pb-28 md:p-6 md:pb-6 lg:p-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 md:gap-5">
          <TopHeader name={name.split(" ")[0] ?? name} title={header.title} subtitle={header.subtitle} dark={dark} onToggleTheme={onToggleTheme} />

          {workspace.loading ? (
            <p role="status" className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Loader2 className="size-4 animate-spin" />
              Cargando tus aulas…
            </p>
          ) : (
            <>
              {view === "panel" && (
                <TeacherHomePage
                  classrooms={workspace.classrooms}
                  topics={workspace.topics}
                  selectedId={selectedId}
                  onSelect={setPickedId}
                  onOpenClasses={() => setView("aulas")}
                  onOpenReports={() => setView("reportes")}
                />
              )}
              {view === "aulas" && (
                <TeacherClassesPage
                  classrooms={workspace.classrooms}
                  topics={workspace.topics}
                  onCreateClassroom={workspace.createClassroom}
                  onAddTopic={workspace.addTopic}
                  onUploadMaterial={workspace.uploadMaterial}
                />
              )}
              {view === "reportes" && (
                <TeacherReportsPage classrooms={workspace.classrooms} selectedId={selectedId} onSelect={setPickedId} dark={dark} />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
