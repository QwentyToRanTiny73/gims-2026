import type { OptionKey, TicketQuestion } from '../data/types';
import { QuestionCard } from './QuestionCard';
import { formatClock, pct, cx } from '../ui/util';
import { CheckCircle2, XCircle, RotateCcw, LogOut } from 'lucide-react';

export interface ResultItem {
  question: TicketQuestion;
  chosen: OptionKey | null;
}

interface Props {
  title: string;
  items: ResultItem[];
  durationSec?: number;
  showVerdict?: boolean; // экзамен: «Сдано/Не сдано»
  passed?: boolean;
  threshold?: number;
  onRestart?: () => void;
  onExit: () => void;
  favorites?: Set<string>;
  onToggleFavorite?: (id: string) => void;
}

export function ResultScreen({
  title,
  items,
  durationSec,
  showVerdict,
  passed,
  threshold,
  onRestart,
  onExit,
  favorites,
  onToggleFavorite,
}: Props) {
  const total = items.length;
  const correct = items.filter((i) => i.chosen != null && i.chosen === i.question.correct).length;

  return (
    <div className="space-y-4">
      <section
        className={cx(
          'card text-center',
          showVerdict && (passed ? 'border-ok/60' : 'border-danger/60')
        )}
        aria-live="polite"
      >
        {showVerdict && (
          <div className="mb-2 flex items-center justify-center gap-2">
            {passed ? (
              <CheckCircle2 className="h-8 w-8 text-ok" aria-hidden="true" />
            ) : (
              <XCircle className="h-8 w-8 text-danger" aria-hidden="true" />
            )}
            <span className={cx('text-2xl font-bold', passed ? 'text-ok' : 'text-danger')}>
              {passed ? 'Сдано' : 'Не сдано'}
            </span>
          </div>
        )}
        <div className="text-4xl font-bold tabular-nums">
          {correct}
          <span className="text-muted"> / {total}</span>
        </div>
        <div className="mt-1 text-muted">
          Точность {pct(correct, total)}%
          {threshold != null && ` · проходной ${threshold}`}
          {durationSec != null && ` · время ${formatClock(durationSec)}`}
        </div>
        <h2 className="mt-1 text-sm text-muted">{title}</h2>

        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {onRestart && (
            <button type="button" className="btn-ghost" onClick={onRestart}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" /> Пройти заново
            </button>
          )}
          <button type="button" className="btn-primary" onClick={onExit}>
            <LogOut className="h-4 w-4" aria-hidden="true" /> Готово
          </button>
        </div>
      </section>

      <h3 className="px-1 text-lg font-semibold">Разбор</h3>
      <div className="space-y-3">
        {items.map((it, i) => (
          <QuestionCard
            key={it.question.id}
            question={it.question}
            number={i + 1}
            chosen={it.chosen}
            reveal
            disabled
            favorite={favorites?.has(it.question.id)}
            onToggleFavorite={onToggleFavorite ? () => onToggleFavorite(it.question.id) : undefined}
          />
        ))}
      </div>
    </div>
  );
}
