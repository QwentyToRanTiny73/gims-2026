import { useState } from 'react';
import { useAppData } from '../data/context';
import { useStore } from '../store';
import { SequentialQuiz } from '../components/SequentialQuiz';
import type { QuizResult } from '../components/SequentialQuiz';
import { ResultScreen } from '../components/ResultScreen';
import { buildAttempt, buildItems } from '../ui/quiz';
import { passThreshold } from '../config';
import { navigate } from '../router';
import { CheckCircle2, ChevronRight } from 'lucide-react';
import { pct } from '../ui/util';
import type { ResultItem } from '../components/ResultScreen';

export function TicketsScreen({ param }: { param: string | null }) {
  const { tickets } = useAppData();
  const { store, recordAttempt, toggleFavorite } = useStore();
  const [result, setResult] = useState<ResultItem[] | null>(null);
  const [duration, setDuration] = useState(0);

  const activeId = param ? Number(param) : null;
  const ticket = tickets.tickets.find((t) => t.id === activeId) || null;

  const bestFor = (id: number) => {
    const attempts = store.attempts.filter((a) => a.kind === 'ticket' && a.ticketId === id);
    if (!attempts.length) return null;
    return attempts.reduce((m, a) => Math.max(m, a.correct), 0);
  };

  // экран результата
  if (ticket && result) {
    return (
      <ResultScreen
        title={ticket.title}
        items={result}
        durationSec={duration}
        threshold={passThreshold()}
        favorites={new Set(store.favorites)}
        onToggleFavorite={toggleFavorite}
        onRestart={() => {
          setResult(null);
        }}
        onExit={() => {
          setResult(null);
          navigate('tickets');
        }}
      />
    );
  }

  // прохождение билета
  if (ticket) {
    return (
      <SequentialQuiz
        questions={ticket.questions}
        title={ticket.title}
        onFinish={(r: QuizResult) => {
          const items = buildItems(ticket.questions, r.answers);
          const attempt = buildAttempt('ticket', items, r.durationSec, passThreshold(), ticket.id);
          recordAttempt(attempt);
          setResult(items);
          setDuration(r.durationSec);
          window.scrollTo(0, 0);
        }}
      />
    );
  }

  // список билетов
  return (
    <div className="space-y-3">
      <p className="text-muted">5 готовых билетов по 20 вопросов. Без таймера, с подробным разбором.</p>
      {tickets.tickets.map((t) => {
        const best = bestFor(t.id);
        const done = best != null;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => navigate('tickets', String(t.id))}
            className="card flex w-full items-center justify-between gap-3 text-left hover:border-accent/50"
          >
            <div className="flex items-center gap-3">
              {done && <CheckCircle2 className="h-5 w-5 text-ok" aria-hidden="true" />}
              <div>
                <div className="text-lg font-semibold">{t.title}</div>
                <div className="text-sm text-muted">
                  {done ? `Лучший результат: ${best}/${t.questions.length} (${pct(best!, t.questions.length)}%)` : 'Ещё не пройден'}
                </div>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted" aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
