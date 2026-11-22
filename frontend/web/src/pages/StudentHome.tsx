import { ContinueLearningCard } from "../components/ContinueLearningCard.tsx";
import { ProgressCard } from "../components/ProgressCard.tsx";
import { SubjectCardsGrid } from "../components/SubjectCardsGrid.tsx";
import { RecommendedBanner } from "../components/RecommendedBanner.tsx";

export function StudentHome({ dark }: { dark: boolean }) {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:gap-5 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <ContinueLearningCard dark={dark} />
        <ProgressCard dark={dark} />
      </div>
      <SubjectCardsGrid />
      <RecommendedBanner />
    </>
  );
}
