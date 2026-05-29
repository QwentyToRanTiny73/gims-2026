import { useMemo, useState } from 'react';
import { useAppData } from '../data/context';
import { useStore } from '../store';
import type { ReferenceSection } from '../data/types';
import { ProgressBar } from '../components/ProgressBar';
import { StarButton, BookmarkButton, ReviewBadge } from '../components/buttons';
import { navigate } from '../router';
import { shuffle, cx } from '../ui/util';
import { ChevronLeft, ChevronRight, Shuffle, Check, X, RotateCw, ArrowLeft } from 'lucide-react';

export function StudyScreen({ param }: { param: string | null }) {
  const { reference } = useAppData();
  const { store } = useStore();

  const section = useMemo(() => {
    if (!param) return null;
    for (const b of reference.blocks) {
      const s = b.sections.find((x) => x.id === param);
      if (s) return s;
    }
    return null;
  }, [param, reference]);

  if (section) return <Deck key={section.id} section={section} />;

  // выбор раздела
  return (
    <div className="space-y-5">
      <p className="text-muted">Карточки справочника: вопрос → ответ. Выберите раздел.</p>
      {reference.blocks.map((b) => (
        <div key={b.id}>
          <h2 className="mb-2 px-1 text-sm font-semibold uppercase tracking-wide text-muted">{b.title}</h2>
          <div className="space-y-2">
            {b.sections.map((s) => {
              const seen = s.cards.filter((c) => store.cardStats[c.id]?.seen).length;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => navigate('study', s.id)}
                  className="card flex w-full items-center justify-between gap-3 text-left hover:border-accent/50"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold">
                      <span className="text-accent-hover">{s.id}</span> {s.title}
                    </div>
                    <ProgressBar className="mt-2" value={seen} total={s.cards.length} />
                    <div className="mt-1 text-xs text-muted">
                      {seen} / {s.cards.length} изучено
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-muted" aria-hidden="true" />
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function Deck({ section }: { section: ReferenceSection }) {
  const { store, recordCard, toggleFavorite, toggleQuestionBookmark } = useStore();
  const [order, setOrder] = useState<number[]>(() => section.cards.map((_, i) => i));
  const [pos, setPos] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const card = section.cards[order[pos]];

  const go = (delta: number) => {
    setPos((p) => Math.min(section.cards.length - 1, Math.max(0, p + delta)));
    setFlipped(false);
  };
  const mark = (result: 'known' | 'unknown') => {
    recordCard(card.id, result);
    if (pos < section.cards.length - 1) go(1);
    else setFlipped(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <button type="button" className="btn-ghost" onClick={() => navigate('study')}>
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Разделы
        </button>
        <span className="text-sm text-muted">
          {section.id} · {pos + 1} / {section.cards.length}
        </span>
        <button
          type="button"
          className="tap rounded-lg p-2 hover:bg-surface2"
          aria-label="Перемешать карточки"
          onClick={() => {
            setOrder(shuffle(section.cards.map((_, i) => i)));
            setPos(0);
            setFlipped(false);
          }}
        >
          <Shuffle className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
      <ProgressBar value={pos + 1} total={section.cards.length} />

      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        className="card block min-h-[220px] w-full text-left transition-colors hover:border-accent/40"
        aria-label={flipped ? 'Показать вопрос' : 'Показать ответ'}
      >
        <div className="flex items-start justify-between gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">
            {flipped ? 'Ответ' : 'Вопрос'}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-muted">
            <RotateCw className="h-3.5 w-3.5" aria-hidden="true" /> нажмите, чтобы перевернуть
          </span>
        </div>

        {!flipped ? (
          <div className="mt-3">
            <p className="text-xl font-semibold leading-snug">
              {card.question || <span className="text-warn">[вопрос отсутствует в источнике]</span>}
            </p>
            {card.needsReview && <div className="mt-3"><ReviewBadge /></div>}
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            <p className="text-2xl font-bold text-ok">
              {card.answer || <span className="text-warn">[ответ отсутствует в источнике]</span>}
            </p>
            {card.hint && (
              <p className="rounded-xl border border-line bg-surface2 p-3 text-[0.95em] leading-snug text-muted">
                {card.hint}
              </p>
            )}
          </div>
        )}
      </button>

      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          <StarButton active={store.favorites.includes(card.id)} onClick={() => toggleFavorite(card.id)} />
          <BookmarkButton
            active={store.bookmarks.questionRefs.includes(card.id)}
            onClick={() => toggleQuestionBookmark(card.id)}
          />
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className={cx('btn', 'bg-danger/20 text-danger hover:bg-danger/30')}
            onClick={() => mark('unknown')}
          >
            <X className="h-4 w-4" aria-hidden="true" /> Не знаю
          </button>
          <button
            type="button"
            className={cx('btn', 'bg-ok/20 text-ok hover:bg-ok/30')}
            onClick={() => mark('known')}
          >
            <Check className="h-4 w-4" aria-hidden="true" /> Знаю
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <button type="button" className="btn-ghost" onClick={() => go(-1)} disabled={pos === 0}>
          <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Назад
        </button>
        <button
          type="button"
          className="btn-ghost"
          onClick={() => go(1)}
          disabled={pos === section.cards.length - 1}
        >
          Вперёд <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
