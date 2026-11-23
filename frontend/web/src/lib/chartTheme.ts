/** Colores de recharts según el tema (DESIGN.md §3). Recharts los recibe por props, no por clases. */
export interface ChartTheme {
  palette: string[];
  grid: string;
  axis: string;
  tooltipBg: string;
  tooltipBorder: string;
  tooltipText: string;
  marker: string;
}

const LIGHT: ChartTheme = {
  palette: ["#3B6EF5", "#3FAE8C", "#8B6CF0", "#F0A94A"],
  grid: "#E5EAF1",
  axis: "#64748B",
  tooltipBg: "#FFFFFF",
  tooltipBorder: "#E8ECF2",
  tooltipText: "#0F172A",
  marker: "#F59E0B",
};

const DARK: ChartTheme = {
  palette: ["#4A7BFF", "#7AD9A8", "#A78BFA", "#FBBF24"],
  grid: "#2A3347",
  axis: "#8B95AB",
  tooltipBg: "#161E30",
  tooltipBorder: "#222B3E",
  tooltipText: "#FFFFFF",
  marker: "#FBBF24",
};

export function chartTheme(dark: boolean): ChartTheme {
  return dark ? DARK : LIGHT;
}

export function tooltipStyle(theme: ChartTheme) {
  return {
    backgroundColor: theme.tooltipBg,
    border: `1px solid ${theme.tooltipBorder}`,
    borderRadius: 12,
    color: theme.tooltipText,
    fontSize: 12,
  } as const;
}
