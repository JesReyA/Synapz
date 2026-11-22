import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, ResponsiveContainer } from "recharts";

type WeeklyPoint = { day: string; value: number };

const DEFAULT_WEEKLY: WeeklyPoint[] = [
  { day: "L", value: 30 },
  { day: "M", value: 55 },
  { day: "X", value: 40 },
  { day: "J", value: 70 },
  { day: "V", value: 50 },
  { day: "S", value: 60 },
  { day: "D", value: 85 },
];

type ProgressCardProps = {
  percent?: number;
  weekly?: WeeklyPoint[];
  range?: string;
  dark: boolean;
};

export function ProgressCard({
  percent = 74,
  weekly = DEFAULT_WEEKLY,
  range = "Esta semana",
  dark,
}: ProgressCardProps) {
  const [open, setOpen] = useState(false);
  const ring = [
    { name: "done", value: percent },
    { name: "rest", value: 100 - percent },
  ];
  const ringOn = dark ? "#7AD9A8" : "#3FAE8C";
  const ringOff = dark ? "#2B3C5E" : "#DCEBE6";
  const barOn = dark ? "#4A7BFF" : "#3B6EF5";
  const barOff = dark ? "#2B3C5E" : "#C5D6FB";
  const max = Math.max(...weekly.map((d) => d.value));

  return (
    <section className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#222B3E] dark:bg-[#131A29] dark:shadow-none">
      <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Tu progreso</h2>

      <div className="relative mx-auto h-40 w-40">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={ring}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
              innerRadius="72%"
              outerRadius="100%"
              cornerRadius={20}
              stroke="none"
              isAnimationActive={false}
            >
              <Cell fill={ringOn} />
              <Cell fill={ringOff} />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <span className="pointer-events-none absolute inset-0 grid place-items-center text-3xl font-bold text-slate-900 dark:text-white">
          {percent}%
        </span>
      </div>

      <div className="h-24 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weekly} barCategoryGap="22%">
            <Bar dataKey="value" radius={[4, 4, 0, 0]} isAnimationActive={false}>
              {weekly.map((d, i) => (
                <Cell key={i} fill={d.value === max ? barOn : i % 2 ? barOn : barOff} fillOpacity={d.value === max ? 1 : 0.75} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex items-center gap-1 self-start rounded-md text-xs text-slate-500 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none dark:text-slate-400"
      >
        {range}
        <ChevronDown className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} strokeWidth={1.75} />
      </button>
    </section>
  );
}

