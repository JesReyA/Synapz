import { useCallback, useEffect, useState } from "react";
import * as service from "../services/mockTeacher.ts";
import type {
  CreateClassroomInput,
  CreateTopicInput,
  TeacherClassroomSummary,
  TeacherTopic,
  UploadMaterialResponse,
} from "../types/teacher.ts";

/** Aulas y temario del docente. Hoy usa el mock; después, `/api/teacher/overview` y Supabase. */
export function useTeacherWorkspace() {
  const [classrooms, setClassrooms] = useState<TeacherClassroomSummary[]>([]);
  const [topics, setTopics] = useState<Record<string, TeacherTopic[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void service.fetchTeacherWorkspace().then((ws) => {
      if (!active) return;
      setClassrooms(ws.overview.classrooms);
      setTopics(ws.topics);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const createClassroom = useCallback(async (input: CreateClassroomInput) => {
    const created = await service.createClassroom(input);
    setClassrooms((prev) => [...prev, created]);
    setTopics((prev) => ({ ...prev, [created.id]: [] }));
    return created;
  }, []);

  const addTopic = useCallback(
    async (classroomId: string, input: CreateTopicInput) => {
      const created = await service.createTopic(classroomId, input, (topics[classroomId]?.length ?? 0) + 1);
      setTopics((prev) => ({ ...prev, [classroomId]: [...(prev[classroomId] ?? []), created] }));
      return created;
    },
    [topics],
  );

  const uploadMaterial = useCallback(
    async (classroomId: string, topicId: string, file: File): Promise<UploadMaterialResponse> => {
      const response = await service.uploadMaterial(topicId, file);
      setTopics((prev) => ({
        ...prev,
        [classroomId]: (prev[classroomId] ?? []).map((t) =>
          t.id === topicId
            ? {
                ...t,
                material_files: [
                  ...t.material_files,
                  {
                    id: response.material_id,
                    storage_path: `materials/${classroomId}/${response.filename}`,
                    filename: response.filename,
                    mime: response.mime,
                    chars: response.extracted_chars,
                  },
                ],
              }
            : t,
        ),
      }));
      return response;
    },
    [],
  );

  return { classrooms, topics, loading, createClassroom, addTopic, uploadMaterial };
}
