import { useMemo, useState } from 'react';
import { useAppData } from '../data/context';
import { useStore } from '../store';
import { QuestionCard } from '../components/QuestionCard';
import { StarButton } from '../components/buttons';
import { navigate } from '../router';
import { cx } from '../ui/util';
import { Star, ChevronRight } from 'lucide-react';

type Filter = 'all' | 'question' | 'card';

export function FavoritesScreen() {
  const data = useAppData();
  const { store, toggleFavorite } = useStore();
  const [filter, setFilter] = useState<Filter>('all');

  const items = useMemo(() => {
    return store.favorites
      .map((id) => {
        const q = data.questionById.get(id);
        if (q) return { kind: 'question' as const, id, q };
        const c = data.cardById.get(id);
        if (c) return { kind: 'card' as const, id, c };
        return null;
      })
      .filter((x): x is NonNullable<typeof x> => !!x);
  }, [store.favorites, data]);

  const shown = items.filter((i) => filter === 'all' || i.kind === filter);
  const counts = {
    all: items.length,
    question: items.filter((i) => i.kind === 'question').length,
    card: items.filter((i) => i.kind === 'card').length,
  };

  if (items.length === 0) {
    return (
      <div className="card text-center">
        <Star className="mx-auto h-10 w-10 text-muted" aria-hidden="true" />
        <h2 className="mt-2 text-lg font-semibold">Избранное пусто</h2>
        <p className="mt-1 text-muted">
          Отмечайте вопросы и карточки звездой ★ — они появятся здесь для быстрого повторения.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2" role="tablist" aria-label="Фильтр избранного">
        {(
          [
            ['all', `Все (${counts.all})`],
            ['question', `Тесты (${counts.question})`],
            ['card', `Карточки (${counts.card})`],
          ] as [Filter, string][]
        ).map(([f, label]) => (
          <button
            key={f}
            type="button"
            role="tab"
            aria-selected={filter === f}
            onClick={() => setFilter(f)}
            className={cx(
              'tap rounded-xl border-2 px-3 py-2 text-sm font-medium',
              filter === f ? 'border-accent bg-accent/15 text-ink' : 'border-line bg-surface2 text-muted'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {shown.map((it) =>
          it.kind === 'question' ? (
            <QuestionCard
              key={it.id}
              question={it.q}
              chosen={null}
              reveal
              disabled
              favorite
              onToggleFavorite={() => toggleFavorite(it.id)}
            />
          ) : (
            <div key={it.id} className="card">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-xs text-muted">
                    Карточка · {it.c.sectionId} {it.c.sectionTitle}
                  </div>
                  <p className="mt-1 font-semibold leading-snug">
                    {it.c.question || <span className="text-warn">[вопрос отсутствует в источнике]</span>}
                  </p>
                  <p className="mt-1 text-ok">{it.c.answer}</p>
                  {it.c.hint && <p className="mt-1 text-sm text-muted">{it.c.hint}</p>}
                </div>
                <StarButton active onClick={() => toggleFavorite(it.id)} />
              </div>
              <button
                type="button"
                onClick={() => navigate('study', it.c.sectionId)}
                className="mt-2 inline-flex items-center gap-1 text-sm text-accent-hover hover:underline"
              >
                К разделу <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}
