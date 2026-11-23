import { useState } from "react";
import { DailyFocusBanner } from "../components/learning/DailyFocusBanner.tsx";
import { MultimodalLessonViewer } from "../components/learning/MultimodalLessonViewer.tsx";
import { ReadingVoiceCoachView } from "../components/learning/ReadingVoiceCoachView.tsx";
import { RemedialPracticeModal } from "../components/learning/RemedialPracticeModal.tsx";
import { StudyCardItem } from "../components/learning/StudyCardItem.tsx";
import { StudyFilterPills } from "../components/learning/StudyFilterPills.tsx";
import {
  MOCK_LEARNING_HOME,
  MOCK_LESSON_BUNDLES,
  MOCK_READING_BUNDLES,
  MOCK_REMEDIAL_SETS,
  mockEvaluateAudio,
} from "../data/mockLearning.ts";
import type { FeynTopicContext, StudyCard, StudyFilter } from "../types/learning.ts";

interface AprenderPageProps {
  onExplainToFeyn: (context: FeynTopicContext) => void;
}

export function AprenderPage({ onExplainToFeyn }: AprenderPageProps) {
  const [cards, setCards] = useState<StudyCard[]>(MOCK_LEARNING_HOME.cards);
  const [filter, setFilter] = useState<StudyFilter>("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const focus = MOCK_LEARNING_HOME.daily_focus;
  const open = cards.find((c) => c.id === openId) ?? null;
  const visible = cards.filter((c) => filter === "all" || c.category === filter);
  const focusCard = cards.find((c) => c.id === focus?.card_id);
  const counts: Record<StudyFilter, number> = {
    all: cards.length,
    lessons: cards.filter((c) => c.category === "lessons").length,
    reading: cards.filter((c) => c.category === "reading").length,
    remedial: cards.filter((c) => c.category === "remedial").length,
  };

  function raiseProgress(cardId: string, percent: number) {
    setCards((prev) => prev.map((c) => (c.id === cardId ? { ...c, progress: Math.max(c.progress, percent) } : c)));
  }

  const lessonBundle = open?.category === "lessons" ? MOCK_LESSON_BUNDLES.find((b) => b.topic.topic_id === open.topic_id) : undefined;
  const readingBundle = open?.category === "reading" ? MOCK_READING_BUNDLES.find((b) => b.topic.topic_id === open.topic_id) : undefined;
  const remedialSet = open?.category === "remedial" ? MOCK_REMEDIAL_SETS.find((s) => s.id === open.remedial_set_id) : undefined;

  if (open && lessonBundle) {
    return (
      <MultimodalLessonViewer
        bundle={lessonBundle}
        onBack={() => setOpenId(null)}
        onExplainToFeyn={onExplainToFeyn}
      />
    );
  }

  if (open && readingBundle) {
    return (
      <ReadingVoiceCoachView
        bundle={readingBundle}
        onBack={() => setOpenId(null)}
        onEvaluate={mockEvaluateAudio}
        onProgress={(p) => raiseProgress(open.id, p)}
      />
    );
  }

  return (
    <>
      {focus && focusCard && <DailyFocusBanner focus={focus} card={focusCard} onStart={(c) => setOpenId(c.id)} />}

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Tu ruta de estudio</h2>
        <StudyFilterPills value={filter} counts={counts} onChange={setFilter} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((card) => (
          <StudyCardItem
            key={card.id}
            card={card}
            onOpen={(c) => setOpenId(c.id)}
            onExplainToFeyn={(c) => onExplainToFeyn({ classroom_id: c.classroom_id, topic_id: c.topic_id, title: c.topic_title })}
          />
        ))}
      </div>

      {open && remedialSet && (
        <RemedialPracticeModal
          set={remedialSet}
          onClose={() => setOpenId(null)}
          onFinish={(ok, total) => raiseProgress(open.id, Math.round((ok / total) * 100))}
        />
      )}
    </>
  );
}
