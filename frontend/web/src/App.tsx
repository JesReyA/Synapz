import { useEffect, useState } from "react";
import { Sidebar } from "./components/Sidebar.tsx";
import { TopHeader } from "./components/TopHeader.tsx";
import { FeynChatFab } from "./components/FeynChatFab.tsx";
import { StudentHome } from "./pages/StudentHome.tsx";
import { MisClasesPage } from "./pages/MisClasesPage.tsx";
import { RetosPage } from "./pages/RetosPage.tsx";
import { PlaceholderPage } from "./pages/PlaceholderPage.tsx";
import type { FeynTopicContext } from "./types/classes.ts";

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

export default function App() {
  const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark");
  const [view, setView] = useState<View>("inicio");
  const [feynOpen, setFeynOpen] = useState(false);
  const [feynTopic, setFeynTopic] = useState<FeynTopicContext | null>(null);

  useEffect(() => {
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  const toggleTheme = () => setDark((d) => !d);

  function explainToFeyn(context: FeynTopicContext) {
    setFeynTopic(context);
    setFeynOpen(true);
  }

  const header = view === "inicio" ? null : HEADERS[view];

  return (
    <div className={dark ? "dark" : ""}>
      <div className="flex min-h-screen bg-white text-slate-900 transition-colors duration-150 dark:bg-[#0B0F1A] dark:text-white">
        <Sidebar
          active={view}
          onSelect={(id) => {
            if (isView(id)) setView(id);
          }}
          dark={dark}
          onToggleTheme={toggleTheme}
        />
        <main className="min-w-0 flex-1 p-4 pb-28 md:p-6 md:pb-6 lg:p-8">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 md:gap-5">
            <TopHeader
              name="Alex"
              dark={dark}
              onToggleTheme={toggleTheme}
              {...(header ? { title: header.title, subtitle: header.subtitle } : {})}
            />
            {view === "inicio" && <StudentHome dark={dark} />}
            {view === "clases" && <MisClasesPage onExplainToFeyn={explainToFeyn} />}
            {view === "retos" && <RetosPage />}
            {view === "aprender" && <PlaceholderPage title="Aprender" />}
            {view === "progreso" && <PlaceholderPage title="Progreso" />}
          </div>
        </main>
        <FeynChatFab open={feynOpen} onOpenChange={setFeynOpen} topic={feynTopic} />
      </div>
    </div>
  );
}
