import { useEffect, useState } from "react";
import { Sidebar } from "./components/Sidebar.tsx";
import { TopHeader } from "./components/TopHeader.tsx";
import { ContinueLearningCard } from "./components/ContinueLearningCard.tsx";
import { ProgressCard } from "./components/ProgressCard.tsx";
import { SubjectCardsGrid } from "./components/SubjectCardsGrid.tsx";
import { RecommendedBanner } from "./components/RecommendedBanner.tsx";
import { FeynChatFab } from "./components/FeynChatFab.tsx";

export default function App() {
  const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark");
  const [section, setSection] = useState("inicio");

  useEffect(() => {
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  const toggleTheme = () => setDark((d) => !d);

  return (
    <div className={dark ? "dark" : ""}>
      <div className="flex min-h-screen bg-white text-slate-900 transition-colors duration-150 dark:bg-[#0B0F1A] dark:text-white">
        <Sidebar active={section} onSelect={setSection} dark={dark} onToggleTheme={toggleTheme} />
        <main className="min-w-0 flex-1 p-4 pb-28 md:p-6 md:pb-6 lg:p-8">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 md:gap-5">
            <TopHeader name="Alex" dark={dark} onToggleTheme={toggleTheme} />
            <div className="grid grid-cols-1 gap-4 md:gap-5 lg:grid-cols-[minmax(0,1fr)_16rem]">
              <ContinueLearningCard dark={dark} />
              <ProgressCard dark={dark} />
            </div>
            <SubjectCardsGrid />
            <RecommendedBanner />
          </div>
        </main>
        <FeynChatFab />
      </div>
    </div>
  );
}


