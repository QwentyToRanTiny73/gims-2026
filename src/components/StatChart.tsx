import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { usePrefs } from '../ui/prefs';

// Цвета графиков под морские темы (совпадают с CSS-переменными в index.css).
const CHART = {
  light: {
    line: '#136C92',
    grid: '#C9DCE8',
    axis: '#465C6E',
    tipBg: '#FFFFFF',
    tipBorder: '#B7CDDB',
    tipText: '#0B2231',
  },
  dark: {
    line: '#47A2D1',
    grid: '#274055',
    axis: '#9AB3C8',
    tipBg: '#12283A',
    tipBorder: '#2F4A63',
    tipText: '#EAF2F8',
  },
} as const;

function useChartColors() {
  const { theme } = usePrefs();
  const c = CHART[theme];
  return {
    c,
    axis: { fill: c.axis, fontSize: 12 },
    tooltip: {
      background: c.tipBg,
      border: `1px solid ${c.tipBorder}`,
      borderRadius: 12,
      color: c.tipText,
    },
  };
}

export function AccuracyLineChart({ data }: { data: { date: string; accuracy: number }[] }) {
  const { c, axis, tooltip } = useChartColors();
  if (!data.length) return <EmptyChart label="Пока нет данных по дням" />;
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid stroke={c.grid} vertical={false} />
        <XAxis dataKey="date" tick={axis} stroke={c.axis} />
        <YAxis domain={[0, 100]} tick={axis} stroke={c.axis} unit="%" />
        <Tooltip contentStyle={tooltip} formatter={(v: number) => [`${v}%`, 'Точность']} />
        <Line type="monotone" dataKey="accuracy" stroke={c.line} strokeWidth={2.5} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function SectionBarChart({ data }: { data: { name: string; accuracy: number }[] }) {
  const { c, axis, tooltip } = useChartColors();
  if (!data.length) return <EmptyChart label="Пока нет данных по разделам" />;
  return (
    <ResponsiveContainer width="100%" height={Math.max(220, data.length * 28)}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 12, left: 4, bottom: 4 }}>
        <CartesianGrid stroke={c.grid} horizontal={false} />
        <XAxis type="number" domain={[0, 100]} tick={axis} stroke={c.axis} unit="%" />
        <YAxis type="category" dataKey="name" tick={axis} width={120} stroke={c.axis} />
        <Tooltip contentStyle={tooltip} formatter={(v: number) => [`${v}%`, 'Точность']} />
        <Bar dataKey="accuracy" fill={c.line} radius={[0, 6, 6, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="flex h-[180px] items-center justify-center rounded-xl border border-dashed border-line text-muted">
      {label}
    </div>
  );
}
