import { useState } from 'react';
import { useAppData } from '../data/context';
import { useStore } from '../store';
import { SequentialQuiz } from '../components/SequentialQuiz';
import type { QuizResult } from '../components/SequentialQuiz';
import { ResultScreen } from '../components/ResultScreen';
import type { ResultItem } from '../components/ResultScreen';
import { buildAttempt, buildItems, countCorrect } from '../ui/quiz';
import { examConfig, passThreshold } from '../config';
import type { TicketQuestion } from '../data/types';
import { shuffle } from '../ui/util';
import { Timer as TimerIcon, Shuffle, Info } from 'lucide-react';

type Phase = { mode: 'setup' } | { mode: 'run'; qs: TicketQuestion[] } | { mode: 'result'; items: ResultItem[]; dur: number };

export function ExamScreen() {
  const { tickets, flatQuestions } = useAppData();
  const { store, recordAttempt, toggleFavorite } = useStore();
  const [phase, setPhase] = useState<Phase>({ mode: 'setup' });

  const threshold = passThreshold(examConfig.questionCount);

  const startRandom = () => {
    const qs = shuffle(flatQuestions).slice(0, examConfig.questionCount);
    setPhase({ mode: 'run', qs });
    window.scrollTo(0, 0);
  };
  const startTicket = (id: number) => {
    const t = tickets.tickets.find((x) => x.id === id);
    if (t) setPhase({ mode: 'run', qs: t.questions });
    window.scrollTo(0, 0);
  };

  if (phase.mode === 'run') {
    return (
      <SequentialQuiz
        questions={phase.qs}
        title="Экзамен"
        timerSeconds={examConfig.durationMinutes * 60}
        onFinish={(r: QuizResult) => {
          const items = buildItems(phase.qs, r.answers);
          recordAttempt(buildAttempt('exam', items, r.durationSec, threshold));
          setPhase({ mode: 'result', items, dur: r.durationSec });
          window.scrollTo(0, 0);
        }}
      />
    );
  }

  if (phase.mode === 'result') {
    const passed = countCorrect(phase.items) >= threshold;
    return (
      <ResultScreen
        title="Имитация экзамена"
        items={phase.items}
        durationSec={phase.dur}
        showVerdict
        passed={passed}
        threshold={threshold}
        favorites={new Set(store.favorites)}
        onToggleFavorite={toggleFavorite}
        onRestart={startRandom}
        onExit={() => setPhase({ mode: 'setup' })}
      />
    );
  }

  // setup
  return (
    <div className="space-y-4">
      <section className="card">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <TimerIcon className="h-5 w-5 text-accent" aria-hidden="true" /> Условия экзамена
        </div>
        <ul className="mt-2 space-y-1 text-muted">
          <li>· {examConfig.questionCount} вопросов</li>
          <li>· {examConfig.durationMinutes} минут (обратный отсчёт, авто-завершение)</li>
          <li>· проходной {Math.round(examConfig.passRatio * 100)}% — {threshold} из {examConfig.questionCount}</li>
          <li>· правильные ответы скрыты до конца</li>
        </ul>
        <div className="mt-3 flex gap-2 rounded-xl border border-line bg-surface2 p-3 text-sm text-muted">
          <Info className="h-4 w-4 shrink-0 text-warn" aria-hidden="true" />
          <span>
            Параметры взяты из учебных материалов (см. <code>examConfig</code>) и могут отличаться от актуальных
            требований ГИМС. Сверяйтесь с официальными источниками МЧС.
          </span>
        </div>
      </section>

      <button type="button" className="btn-primary w-full" onClick={startRandom}>
        <Shuffle className="h-4 w-4" aria-hidden="true" /> Случайные {examConfig.questionCount} из пула
      </button>

      <div>
        <div className="mb-2 px-1 text-sm font-semibold text-muted">или конкретный билет</div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {tickets.tickets.map((t) => (
            <button key={t.id} type="button" className="btn-ghost" onClick={() => startTicket(t.id)}>
              №{t.id}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
