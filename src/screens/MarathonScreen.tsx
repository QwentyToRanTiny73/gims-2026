import { useState } from 'react';
import { useAppData } from '../data/context';
import { useStore } from '../store';
import { QuestionCard } from '../components/QuestionCard';
import { ProgressBar } from '../components/ProgressBar';
import type { OptionKey } from '../data/types';
import { navigate } from '../router';
import { ChevronRight, RotateCcw, Flag } from 'lucide-react';

export function MarathonScreen() {
  const { flatQuestions } = useAppData();
  const { store, setMarathonPosition, recordQuestion, toggleFavorite } = useStore();
  const total = flatQuestions.length;
  const pos = Math.min(store.marathonPosition ?? 0, total);
  const [chosen, setChosen] = useState<OptionKey | null>(null);

  // финиш
  if (pos >= total) {
    return (
      <div className="card text-center">
        <Flag className="mx-auto h-10 w-10 text-ok" aria-hidden="true" />
        <h2 className="mt-2 text-xl font-bold">Марафон пройден!</h2>
        <p className="mt-1 text-muted">Вы ответили на все {total} вопросов пула.</p>
        <button
          type="button"
          className="btn-primary mx-auto mt-4"
          onClick={() => {
            setMarathonPosition(0);
            setChosen(null);
          }}
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" /> Начать заново
        </button>
      </div>
    );
  }

  const q = flatQuestions[pos];
  const revealed = chosen != null;

  const choose = (k: OptionKey) => {
    if (revealed) return;
    setChosen(k);
    recordQuestion(q.id, k === q.correct);
  };

  const next = () => {
    setMarathonPosition(pos + 1);
    setChosen(null);
    window.scrollTo(0, 0);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-muted">
        <span>
          {pos + 1} / {total}
        </span>
        <button
          type="button"
          className="rounded-lg px-2 py-1 hover:bg-surface2"
          onClick={() => {
            if (confirm('Сбросить позицию марафона в начало?')) {
              setMarathonPosition(0);
              setChosen(null);
            }
          }}
        >
          Сбросить позицию
        </button>
      </div>
      <ProgressBar value={pos} total={total} />

      <QuestionCard
        question={q}
        number={pos + 1}
        chosen={chosen}
        onChoose={choose}
        reveal={revealed}
        disabled={revealed}
        favorite={store.favorites.includes(q.id)}
        onToggleFavorite={() => toggleFavorite(q.id)}
      />

      <div className="flex items-center justify-between gap-2">
        <button type="button" className="btn-ghost" onClick={() => navigate('plan')}>
          Продолжить позже
        </button>
        <button type="button" className="btn-primary" onClick={next} disabled={!revealed}>
          Дальше <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
