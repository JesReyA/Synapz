import { AlertTriangle, Loader2, ShieldAlert, Target, Users } from "lucide-react";
import { ClassAnalyticsCharts } from "../../components/teacher/ClassAnalyticsCharts.tsx";
import { ClassroomPills } from "../../components/teacher/ClassroomPills.tsx";
import { TeacherKpiTile } from "../../components/teacher/TeacherKpiTile.tsx";
import { useClassroomReport } from "../../hooks/useClassroomReport.ts";
import type { TeacherClassroomSummary } from "../../types/teacher.ts";

interface TeacherReportsPageProps {
  classrooms: TeacherClassroomSummary[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  dark: boolean;
}

export function TeacherReportsPage({ classrooms, selectedId, onSelect, dark }: TeacherReportsPageProps) {
  const { report, loading } = useClassroomReport(selectedId);

  return (
    <>
      <ClassroomPills classrooms={classrooms} selectedId={selectedId} onSelect={onSelect} />

      {loading && (
        <p role="status" className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Loader2 className="size-4 animate-spin" />
          Preparando el reporte…
        </p>
      )}

      {!loading && selectedId && !report && (
        <p className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-600 dark:border-[#2A3347] dark:text-slate-300">
          Esta aula aún no tiene datos para el reporte. Aparecerán cuando los alumnos se unan y completen actividades.
        </p>
      )}

      {report && (
        <>
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            <TeacherKpiTile label="Alumnos" value={String(report.student_count)} icon={Users} tile="bg-violet-100 text-violet-600 dark:bg-violet-400/15 dark:text-violet-300" />
            <TeacherKpiTile label="Promedio del grupo" value={`${report.overall_avg}%`} icon={Target} tile="bg-emerald-100 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-300" />
            <TeacherKpiTile label="En riesgo" value={String(report.at_risk_students.length)} icon={AlertTriangle} tile="bg-orange-100 text-orange-600 dark:bg-amber-900/40 dark:text-amber-400" />
            <TeacherKpiTile
              label="Alertas anti-trampa"
              value={String(report.integrity_flags)}
              hint="Diagnósticos con eventos"
              icon={ShieldAlert}
              tile="bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300"
            />
          </div>
          <ClassAnalyticsCharts report={report} dark={dark} />
        </>
      )}
    </>
  );
}
