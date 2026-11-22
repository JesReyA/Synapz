import { useEffect, useState } from "react";
import { mockAdaptLesson, AdaptLessonError } from "../services/mockClasses.ts";
import type {
  AdaptLessonResponse,
  ApiError,
  ClassroomSummary,
  InterestProfile,
  Modality,
} from "../types/classes.ts";

type LessonState =
  | { key: string; status: "ready"; lesson: AdaptLessonResponse }
  | { key: string; status: "error"; error: ApiError };

interface Args {
  classroomId: string;
  topicId: string;
  modality: Modality;
  previousModality?: Modality;
  /** Cambia para forzar una regeneración con la misma modalidad. */
  nonce: number;
  classes: ClassroomSummary[];
  profile: InterestProfile | null;
}

export function useAdaptiveLesson({
  classroomId,
  topicId,
  modality,
  previousModality,
  nonce,
  classes,
  profile,
}: Args) {
  const [state, setState] = useState<LessonState | null>(null);
  const key = `${topicId}:${modality}:${nonce}`;

  useEffect(() => {
    let cancelled = false;
    mockAdaptLesson(
      {
        classroom_id: classroomId,
        topic_id: topicId,
        modality,
        ...(previousModality ? { previous_modality: previousModality } : {}),
      },
      classes,
      profile,
    )
      .then((lesson) => {
        if (!cancelled) setState({ key, status: "ready", lesson });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const error: ApiError =
          err instanceof AdaptLessonError
            ? err.apiError
            : { code: "INTERNAL", message: "No pudimos generar la explicación. Intenta de nuevo." };
        setState({ key, status: "error", error });
      });
    return () => {
      cancelled = true;
    };
  }, [key, classroomId, topicId, modality, previousModality, classes, profile]);

  const loading = state?.key !== key;
  return {
    loading,
    lesson: !loading && state?.status === "ready" ? state.lesson : null,
    error: !loading && state?.status === "error" ? state.error : null,
  };
}
