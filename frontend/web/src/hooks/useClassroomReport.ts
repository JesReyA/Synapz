import { useEffect, useState } from "react";
import { fetchClassroomReport } from "../services/mockTeacher.ts";
import type { ClassroomReport } from "../types/teacher.ts";

/** Reporte del aula (`GET /api/reports/classroom/{id}`). `loading` es verdadero mientras llega el del aula elegida. */
export function useClassroomReport(classroomId: string | null) {
  const [result, setResult] = useState<{ id: string; report: ClassroomReport | null } | null>(null);

  useEffect(() => {
    if (!classroomId) return;
    let active = true;
    void fetchClassroomReport(classroomId).then((report) => {
      if (active) setResult({ id: classroomId, report });
    });
    return () => {
      active = false;
    };
  }, [classroomId]);

  const ready = classroomId !== null && result?.id === classroomId;
  return { report: ready ? result.report : null, loading: classroomId !== null && !ready };
}
