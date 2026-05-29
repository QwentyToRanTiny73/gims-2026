import { useMemo } from 'react';
import { useAppData } from '../data/context';
import { useStore } from '../store';
import { getAggregates } from '../ui/stats';
import { ProgressBar } from '../components/ProgressBar';
import { navigate } from '../router';
import { formatDate, pluralRu } from '../ui/util';
import { Timer, GraduationCap, TrendingDown, ChevronRight, CalendarDays, Target, ListChecks } from 'lucide-react';

export function PlanScreen() {
  const data = useAppData();
  const { store } = useStore();
  const agg = useMemo(() => getAggregates(store, data), [store, data]);

  const totalCards = data.flatCards.length;

  return (
    <div className="space-y-5">
      {/* Сводка */}
      <section className="grid grid-cols-3 gap-2">
        <Stat
          icon={<ListChecks className="h-5 w-5" aria-hidden="true" />}
          value={String(agg.answeredQuestions)}
          label={pluralRu(agg.answeredQuestions, ['ответ', 'ответа', 'ответов'])}
        />
        <Stat
          icon={<Target className="h-5 w-5" aria-hidden="true" />}
          value={`${agg.overallAccuracy}%`}
          label="точность"
        />
        <Stat
          icon={<CalendarDays className="h-5 w-5" aria-hidden="true" />}
          value={agg.lastActivity ? formatDate(agg.lastActivity).replace(/ \d{4}.*/, '') : '—'}
          label="последнее"
        />
      </section>

      {/* Быстрый старт */}
      <section className="grid gap-2 sm:grid-cols-3">
        <QuickStart
          tone="primary"
          icon={<Timer className="h-5 w-5" aria-hidden="true" />}
          title="Пройти экзамен"
          onClick={() => navigate('exam')}
        />
        <QuickStart
          tone="ghost"
          icon={<GraduationCap className="h-5 w-5" aria-hidden="true" />}
          title="Продолжить изучение"
          onClick={() => navigate('study')}
        />
        <QuickStart
          tone="ghost"
          icon={<TrendingDown className="h-5 w-5" aria-hidden="true" />}
          title="Разобрать ошибки"
          onClick={() => navigate('mistakes')}
        />
      </section>

      {/* Слабые темы */}
      {agg.weakest.length > 0 && (
        <section className="card">
          <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-warn">
            <TrendingDown className="h-4 w-4" aria-hidden="true" /> Слабые темы
          </h2>
          <ul className="space-y-2">
            {agg.weakest.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => navigate('study', s.id)}
                  className="flex w-full items-center justify-between gap-3 rounded-lg px-1 py-1 text-left hover:bg-surface2"
                >
                  <span className="min-w-0 flex-1 truncate">
                    <span className="text-accent-hover">{s.id}</span> {s.title}
                  </span>
                  <span className="shrink-0 font-semibold text-warn">{s.accuracy}%</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Прогресс по разделам */}
      <section>
        <h2 className="mb-2 px-1 text-sm font-semibold uppercase tracking-wide text-muted">
          Прогресс по разделам справочника
        </h2>
        <div className="space-y-2">
          {data.reference.blocks.flatMap((b) =>
            b.sections.map((s) => {
              const seen = s.cards.filter((c) => store.cardStats[c.id]?.seen).length;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => navigate('study', s.id)}
                  className="card flex w-full items-center gap-3 py-3 text-left hover:border-accent/50"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between text-sm">
                      <span className="truncate">
                        <span className="text-accent-hover">{s.id}</span> {s.title}
                      </span>
                      <span className="shrink-0 text-muted">
                        {seen}/{s.cards.length}
                      </span>
                    </div>
                    <ProgressBar
                      className="mt-1.5"
                      value={seen}
                      total={s.cards.length}
                      tone={seen === s.cards.length && s.cards.length > 0 ? 'ok' : 'accent'}
                    />
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-muted" aria-hidden="true" />
                </button>
              );
            })
          )}
        </div>
        <p className="mt-2 px-1 text-xs text-muted">
          Всего {totalCards} {pluralRu(totalCards, ['карточка', 'карточки', 'карточек'])} ·{' '}
          серия {agg.streakDays} {pluralRu(agg.streakDays, ['день', 'дня', 'дней'])}
        </p>
      </section>
    </div>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="card flex flex-col items-center gap-0.5 py-3 text-center">
      <span className="text-accent-hover">{icon}</span>
      <span className="text-xl font-bold tabular-nums">{value}</span>
      <span className="text-xs text-muted">{label}</span>
    </div>
  );
}

function QuickStart({
  icon,
  title,
  onClick,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
  tone: 'primary' | 'ghost';
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        tone === 'primary'
          ? 'btn-primary w-full justify-start py-3'
          : 'btn-ghost w-full justify-start py-3'
      }
    >
      {icon}
      <span>{title}</span>
    </button>
  );
}
