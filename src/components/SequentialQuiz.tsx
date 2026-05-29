import { useMemo, useState } from 'react';
import type { OptionKey, TicketQuestion } from '../data/types';
import { QuestionCard } from './QuestionCard';
import { Timer } from './Timer';
import { ProgressBar } from './ProgressBar';
import { cx } from '../ui/util';
import { ChevronLeft, ChevronRight, Flag } from 'lucide-react';
import { useStore } from '../store';

export interface QuizResult {
  answers: Record<string, OptionKey | null>;
  durationSec: number;
}

interface Props {
  questions: TicketQuestion[];
  title: string;
  timerSeconds?: number; // если задан — режим экзамена
  onFinish: (result: QuizResult) => void;
}

export function SequentialQuiz({ questions, title, timerSeconds, onFinish }: Props) {
  const { store, toggleFavorite } = useStore();
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, OptionKey | null>>({});
  const [startedAt] = useState(() => Date.now());

  const q = questions[idx];
  const answeredCount = useMemo(
    () => questions.filter((qq) => answers[qq.id] != null).length,
    [answers, questions]
  );

  const finish = () => {
    onFinish({ answers, durationSec: Math.round((Date.now() - startedAt) / 1000) });
  };

  const choose = (k: OptionKey) => setAnswers((a) => ({ ...a, [q.id]: a[q.id] === k ? null : k }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-muted">
          Вопрос {idx + 1} из {questions.length}
        </span>
        {timerSeconds != null && <Timer seconds={timerSeconds} running onExpire={finish} />}
      </div>
      <ProgressBar value={answeredCount} total={questions.length} />

      <QuestionCard
        question={q}
        number={idx + 1}
        chosen={answers[q.id] ?? null}
        onChoose={choose}
        reveal={false}
        favorite={store.favorites.includes(q.id)}
        onToggleFavorite={() => toggleFavorite(q.id)}
      />

      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          className="btn-ghost"
          onClick={() => setIdx((i) => Math.max(0, i - 1))}
          disabled={idx === 0}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Назад
        </button>
        {idx < questions.length - 1 ? (
          <button type="button" className="btn-primary" onClick={() => setIdx((i) => i + 1)}>
            Далее <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : (
          <button type="button" className="btn-primary" onClick={finish}>
            <Flag className="h-4 w-4" aria-hidden="true" /> Завершить
          </button>
        )}
      </div>

      {/* Бланк ответов */}
      <section className="card" aria-label="Бланк ответов">
        <div className="mb-2 text-sm font-semibold text-muted">{title} · бланк ответов</div>
        <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
          {questions.map((qq, i) => {
            const answered = answers[qq.id] != null;
            const isCur = i === idx;
            return (
              <button
                key={qq.id}
                type="button"
                onClick={() => setIdx(i)}
                aria-label={`Вопрос ${i + 1}${answered ? ', отвечен' : ''}`}
                aria-current={isCur ? 'true' : undefined}
                className={cx(
                  'tap flex items-center justify-center rounded-lg border-2 py-2 text-sm font-semibold',
                  isCur
                    ? 'border-accent text-ink'
                    : answered
                      ? 'border-accent/30 bg-accent/15 text-ink'
                      : 'border-line bg-surface2 text-muted'
                )}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
        <button type="button" className="btn-primary mt-3 w-full" onClick={finish}>
          <Flag className="h-4 w-4" aria-hidden="true" /> Завершить и проверить ({answeredCount}/{questions.length})
        </button>
      </section>
    </div>
  );
}
