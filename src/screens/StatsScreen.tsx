import { useMemo } from 'react';
import { useAppData } from '../data/context';
import { useStore } from '../store';
import { getAggregates } from '../ui/stats';
import { AccuracyLineChart, SectionBarChart } from '../components/StatChart';
import { formatDate, pluralRu } from '../ui/util';

export function StatsScreen() {
  const data = useAppData();
  const { store } = useStore();
  const agg = useMemo(() => getAggregates(store, data), [store, data]);

  const sectionData = agg.sections
    .filter((s) => s.hasData)
    .map((s) => ({ name: `${s.id} ${s.title}`.slice(0, 22), accuracy: s.accuracy }));

  const counters: { label: string; value: string }[] = [
    { label: 'всего попыток', value: String(agg.totalAttempts) },
    { label: 'средний балл экзаменов', value: `${agg.avgExamScore}%` },
    { label: 'лучший результат', value: `${agg.bestResult}%` },
    {
      label: 'серия дней',
      value: `${agg.streakDays} ${pluralRu(agg.streakDays, ['день', 'дня', 'дней'])}`,
    },
  ];

  return (
    <div className="space-y-5">
      <section className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {counters.map((c) => (
          <div key={c.label} className="card flex flex-col items-center gap-0.5 py-3 text-center">
            <span className="text-xl font-bold tabular-nums">{c.value}</span>
            <span className="text-xs text-muted">{c.label}</span>
          </div>
        ))}
      </section>

      <section className="card">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
          Точность по дням
        </h2>
        <AccuracyLineChart data={agg.daily} />
      </section>

      <section className="card">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
          Точность по разделам
        </h2>
        <SectionBarChart data={sectionData} />
      </section>

      <p className="px-1 text-xs text-muted">
        Отвечено вопросов: {agg.answeredQuestions} · просмотрено карточек: {agg.cardsSeen}
        {agg.lastActivity && ` · последнее занятие: ${formatDate(agg.lastActivity)}`}
      </p>
    </div>
  );
}
