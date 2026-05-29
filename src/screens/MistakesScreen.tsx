import { useMemo, useState } from 'react';
import { useAppData } from '../data/context';
import { useStore } from '../store';
import { getMistakes } from '../ui/stats';
import { SequentialQuiz } from '../components/SequentialQuiz';
import type { QuizResult } from '../components/SequentialQuiz';
import { ResultScreen } from '../components/ResultScreen';
import type { ResultItem } from '../components/ResultScreen';
import { buildAttempt, buildItems } from '../ui/quiz';
import { passThreshold } from '../config';
import type { TicketQuestion } from '../data/types';
import { TrendingDown, Dumbbell, FileQuestion, Layers } from 'lucide-react';
import { navigate } from '../router';

export function MistakesScreen() {
  const data = useAppData();
  const { store, recordAttempt, toggleFavorite } = useStore();
  const rows = useMemo(() => getMistakes(store, data), [store, data]);

  const [session, setSession] = useState<TicketQuestion[] | null>(null);
  const [result, setResult] = useState<ResultItem[] | null>(null);

  // вопросы с вариантами для мини-сессии (карточки «не знаю» не имеют вариантов)
  const practiceQuestions = useMemo(
    () =>
      rows
        .filter((r) => r.kind === 'question')
        .map((r) => data.questionById.get(r.id))
        .filter((q): q is NonNullable<typeof q> => !!q),
    [rows, data]
  );

  if (result && session) {
    return (
      <ResultScreen
        title="Проработка ошибок"
        items={result}
        threshold={passThreshold(result.length)}
        favorites={new Set(store.favorites)}
        onToggleFavorite={toggleFavorite}
        onExit={() => {
          setResult(null);
          setSession(null);
        }}
      />
    );
  }

  if (session) {
    return (
      <SequentialQuiz
        questions={session}
        title="Ошибки"
        onFinish={(r: QuizResult) => {
          const items = buildItems(session, r.answers);
          recordAttempt(buildAttempt('mistakes', items, r.durationSec, passThreshold(items.length)));
          setResult(items);
          window.scrollTo(0, 0);
        }}
      />
    );
  }

  if (rows.length === 0) {
    return (
      <Empty
        icon={<TrendingDown className="mx-auto h-10 w-10 text-muted" aria-hidden="true" />}
        title="Ошибок пока нет"
        text="Проходите билеты, экзамен или карточки — вопросы с ошибками появятся здесь, отсортированные по частоте."
        actionLabel="К билетам"
        onAction={() => navigate('tickets')}
      />
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-muted">
        Вопросы и карточки, в которых вы ошибались чаще всего. Сортировка по числу ошибок.
      </p>

      {practiceQuestions.length > 0 && (
        <button
          type="button"
          className="btn-primary w-full"
          onClick={() => {
            setSession(practiceQuestions.slice(0, 20));
            window.scrollTo(0, 0);
          }}
        >
          <Dumbbell className="h-4 w-4" aria-hidden="true" /> Проработать ошибки (
          {Math.min(20, practiceQuestions.length)})
        </button>
      )}

      <ul className="space-y-2">
        {rows.map((r) => (
          <li
            key={`${r.kind}-${r.id}`}
            className="card flex items-center gap-3 py-3"
          >
            {r.kind === 'question' ? (
              <FileQuestion className="h-5 w-5 shrink-0 text-accent-hover" aria-hidden="true" />
            ) : (
              <Layers className="h-5 w-5 shrink-0 text-accent-hover" aria-hidden="true" />
            )}
            <span className="min-w-0 flex-1 truncate">
              {r.text || <span className="text-warn">[нет текста]</span>}
            </span>
            <span
              className="shrink-0 rounded-md bg-danger/15 px-2 py-0.5 text-sm font-semibold text-danger"
              title={`Ошибок: ${r.wrong}`}
            >
              ×{r.wrong}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Empty({
  icon,
  title,
  text,
  actionLabel,
  onAction,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="card text-center">
      {icon}
      <h2 className="mt-2 text-lg font-semibold">{title}</h2>
      <p className="mt-1 text-muted">{text}</p>
      {actionLabel && onAction && (
        <button type="button" className="btn-ghost mx-auto mt-4" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
