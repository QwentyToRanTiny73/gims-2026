import type { OptionKey, TicketQuestion } from '../data/types';
import { cx } from '../ui/util';
import { Callout, Mnemonic } from './Callout';
import { StarButton, BookmarkButton, ReviewBadge } from './buttons';
import { Check, X } from 'lucide-react';

const KEYS: OptionKey[] = ['А', 'Б', 'В', 'Г'];

interface Props {
  question: TicketQuestion;
  number?: number; // отображаемый номер
  chosen: OptionKey | null;
  onChoose?: (k: OptionKey) => void;
  reveal: boolean; // показывать правильность и разбор
  disabled?: boolean;
  favorite?: boolean;
  onToggleFavorite?: () => void;
  bookmarked?: boolean;
  onToggleBookmark?: () => void;
}

export function QuestionCard({
  question,
  number,
  chosen,
  onChoose,
  reveal,
  disabled,
  favorite,
  onToggleFavorite,
  bookmarked,
  onToggleBookmark,
}: Props) {
  return (
    <div className="card">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-lg font-semibold leading-snug">
          {number != null && <span className="mr-1 text-accent-hover">{number}.</span>}
          {question.text || <span className="text-warn">[вопрос отсутствует в источнике]</span>}
        </h3>
        <div className="flex shrink-0">
          {onToggleFavorite && <StarButton active={!!favorite} onClick={onToggleFavorite} />}
          {onToggleBookmark && <BookmarkButton active={!!bookmarked} onClick={onToggleBookmark} />}
        </div>
      </div>

      {question.needsReview && (
        <div className="mt-2">
          <ReviewBadge />
        </div>
      )}

      <ul className="mt-3 space-y-2" role="group" aria-label="Варианты ответа">
        {KEYS.map((k) => {
          const isChosen = chosen === k;
          const isCorrect = question.correct === k;
          let tone = 'border-line bg-surface2 hover:bg-line/60';
          if (reveal && isCorrect) tone = 'border-ok bg-ok/15';
          else if (reveal && isChosen && !isCorrect) tone = 'border-danger bg-danger/15';
          else if (isChosen) tone = 'border-accent bg-accent/15';

          return (
            <li key={k}>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onChoose?.(k)}
                aria-pressed={isChosen}
                className={cx(
                  'tap flex w-full items-center gap-3 rounded-xl border-2 px-3 py-2.5 text-left transition-colors',
                  tone,
                  disabled && 'cursor-default'
                )}
              >
                <span
                  className={cx(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm font-bold',
                    reveal && isCorrect
                      ? 'bg-ok text-black'
                      : reveal && isChosen && !isCorrect
                        ? 'bg-danger text-white'
                        : 'bg-surface text-ink'
                  )}
                >
                  {k}
                </span>
                <span className="min-w-0 flex-1">{question.options[k]}</span>
                {reveal && isCorrect && <Check className="h-5 w-5 text-ok" aria-label="верно" />}
                {reveal && isChosen && !isCorrect && <X className="h-5 w-5 text-danger" aria-label="ваш ответ" />}
              </button>
            </li>
          );
        })}
      </ul>

      {reveal && (
        <div className="mt-3 space-y-2">
          {question.explanation && (
            <div className="rounded-xl border border-line bg-surface2 p-3 text-[0.95em] leading-snug">
              <span className="font-semibold text-accent-hover">Пояснение. </span>
              {question.explanation}
            </div>
          )}
          {question.mnemonic && <Mnemonic>{question.mnemonic}</Mnemonic>}
          {question.trap && <Callout kind="trap">{question.trap}</Callout>}
        </div>
      )}
    </div>
  );
}
