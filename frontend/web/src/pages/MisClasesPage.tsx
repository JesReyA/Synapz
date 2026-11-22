import { useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { AdaptiveLessonView } from "../components/classes/AdaptiveLessonView.tsx";
import { ClassCard } from "../components/classes/ClassCard.tsx";
import { InterestProfileModal } from "../components/classes/InterestProfileModal.tsx";
import { JoinClassModal } from "../components/classes/JoinClassModal.tsx";
import { SyllabusTopicList } from "../components/classes/SyllabusTopicList.tsx";
import { MOCK_CLASSES, MOCK_PROFILE, mockJoinClass, mockSaveProfile } from "../services/mockClasses.ts";
import type {
  ClassroomSummary,
  FeynTopicContext,
  InterestProfile,
  JoinClassResult,
  SyllabusTopic,
} from "../types/classes.ts";

type Dialog = "none" | "join" | "profile-edit" | "profile-onboarding";

interface MisClasesPageProps {
  onExplainToFeyn: (context: FeynTopicContext) => void;
}

export function MisClasesPage({ onExplainToFeyn }: MisClasesPageProps) {
  const [classes, setClasses] = useState<ClassroomSummary[]>(MOCK_CLASSES);
  const [profile, setProfile] = useState<InterestProfile | null>(MOCK_PROFILE);
  const [selectedId, setSelectedId] = useState<string | null>(MOCK_CLASSES[0]?.id ?? null);
  const [openTopicId, setOpenTopicId] = useState<string | null>(null);
  const [dialog, setDialog] = useState<Dialog>("none");

  const selected = classes.find((c) => c.id === selectedId) ?? null;
  const openTopic: SyllabusTopic | null = selected?.topics.find((t) => t.id === openTopicId) ?? null;

  function selectClass(id: string) {
    setSelectedId(id);
    setOpenTopicId(null);
  }

  async function joinClass(code: string): Promise<JoinClassResult> {
    const result = await mockJoinClass(
      code,
      classes.map((c) => c.id),
    );
    if (result.ok) {
      setClasses((prev) => [...prev, result.classroom]);
      selectClass(result.classroom.id);
      setDialog("profile-onboarding");
    }
    return result;
  }

  async function saveProfile(next: InterestProfile) {
    setProfile(await mockSaveProfile(next));
    setDialog("none");
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
          Tus aulas ({classes.length})
        </h2>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setDialog("profile-edit")}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none dark:border-[#2A3347] dark:text-slate-200 dark:hover:bg-white/5"
          >
            <Pencil className="size-3.5" strokeWidth={1.75} />
            Editar mi perfil de aprendizaje
          </button>
          <button
            type="button"
            onClick={() => setDialog("join")}
            className="inline-flex items-center gap-1.5 rounded-full bg-blue-500 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-600 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <Plus className="size-3.5" strokeWidth={2} />
            Unirme a un aula
          </button>
        </div>
      </div>

      {classes.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-600 dark:border-[#2A3347] dark:text-slate-300">
          Aún no perteneces a ningún aula. Pide el código a tu profesor y pulsa «Unirme a un aula».
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((c) => (
            <ClassCard key={c.id} classroom={c} selected={c.id === selectedId} onSelect={selectClass} />
          ))}
        </div>
      )}

      {selected && openTopic && (
        <AdaptiveLessonView
          key={openTopic.id}
          classroom={selected}
          topic={openTopic}
          classes={classes}
          profile={profile}
          onBack={() => setOpenTopicId(null)}
          onExplainToFeyn={onExplainToFeyn}
        />
      )}
      {selected && !openTopic && (
        <SyllabusTopicList classroom={selected} onOpenTopic={(t) => setOpenTopicId(t.id)} />
      )}

      {dialog === "join" && <JoinClassModal onClose={() => setDialog("none")} onJoin={joinClass} />}
      {(dialog === "profile-edit" || dialog === "profile-onboarding") && (
        <InterestProfileModal
          initial={profile}
          mode={dialog === "profile-onboarding" ? "onboarding" : "edit"}
          dismissible={profile !== null}
          onSave={saveProfile}
          onClose={() => setDialog("none")}
        />
      )}
    </>
  );
}
