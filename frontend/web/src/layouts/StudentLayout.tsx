import { useState } from "react";
import { FeynChatFab } from "../components/FeynChatFab.tsx";
import { Sidebar } from "../components/Sidebar.tsx";
import { TopHeader } from "../components/TopHeader.tsx";
import { AprenderPage } from "../pages/AprenderPage.tsx";
import { MisClasesPage } from "../pages/MisClasesPage.tsx";
import { ProgresoPage } from "../pages/ProgresoPage.tsx";
import { RetosPage } from "../pages/RetosPage.tsx";
import { StudentHome } from "../pages/StudentHome.tsx";
import { listFeynTopics, withTeacherMaterial } from "../services/teacherMaterial.ts";
import type { FeynTopicContext } from "../types/classes.ts";

type View = "inicio" | "clases" | "aprender" | "retos" | "progreso";

const VIEWS: readonly View[] = ["inicio", "clases", "aprender", "retos", "progreso"];

function isView(id: string): id is View {
  return (VIEWS as readonly string[]).includes(id);
}

const HEADERS: Record<Exclude<View, "inicio">, { title: string; subtitle: string }> = {
  clases: { title: "Mis clases", subtitle: "Tus aulas, temarios y explicaciones hechas para ti." },
  aprender: { title: "Aprender", subtitle: "Continúa tu camino de aprendizaje." },
  retos: { title: "Retos", subtitle: "Juega, compite y entrena tu mente." },
  progreso: { title: "Progreso", subtitle: "Mira cómo avanzas en cada materia." },
};

interface StudentLayoutProps {
  name: string;
  dark: boolean;
  onToggleTheme: () => void;
  onSwitchRole?: () => void;
  onSignOut: () => void;
}

export function StudentLayout({ name, dark, onToggleTheme, onSwitchRole, onSignOut }: StudentLayoutProps) {
  const [view, setView] = useState<View>("inicio");
  const [feynOpen, setFeynOpen] = useState(false);
  const [feynTopic, setFeynTopic] = useState<FeynTopicContext | null>(null);
  const [feynCatalog] = useState(listFeynTopics);

  function explainToFeyn(context: FeynTopicContext) {
    setFeynTopic(withTeacherMaterial(context));
    setFeynOpen(true);
  }

  const header = view === "inicio" ? null : HEADERS[view];
  const firstName = name.split(" ")[0] ?? name;

  return (
    <div className="flex min-h-screen bg-white text-slate-900 transition-colors duration-150 dark:bg-[#0B0F1A] dark:text-white">
      <Sidebar
        active={view}
        onSelect={(id) => {
          if (isView(id)) setView(id);
        }}
        dark={dark}
        onToggleTheme={onToggleTheme}
        {...(onSwitchRole ? { onSwitchRole } : {})}
        onSignOut={onSignOut}
      />
      <main className="min-w-0 flex-1 p-4 pb-28 md:p-6 md:pb-6 lg:p-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 md:gap-5">
          <TopHeader
            name={firstName}
            dark={dark}
            onToggleTheme={onToggleTheme}
            {...(header ? { title: header.title, subtitle: header.subtitle } : {})}
          />
          {view === "inicio" && <StudentHome dark={dark} />}
          {view === "clases" && <MisClasesPage onExplainToFeyn={explainToFeyn} />}
          {view === "retos" && <RetosPage />}
          {view === "aprender" && <AprenderPage onExplainToFeyn={explainToFeyn} />}
          {view === "progreso" && <ProgresoPage dark={dark} onReinforce={() => setView("aprender")} />}
        </div>
      </main>
      <FeynChatFab open={feynOpen} onOpenChange={setFeynOpen} topic={feynTopic} topics={feynCatalog} />
    </div>
  );
}
