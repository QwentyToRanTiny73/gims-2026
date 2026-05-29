import { useMemo } from 'react';
import { useAppData } from '../data/context';
import { useStore } from '../store';
import { BookmarkButton } from '../components/buttons';
import { navigate } from '../router';
import { Bookmark, BookOpen, Layers, FileQuestion, ChevronRight } from 'lucide-react';

export function BookmarksScreen() {
  const data = useAppData();
  const { store, toggleRuleBookmark, toggleQuestionBookmark } = useStore();

  const rules = useMemo(() => {
    return store.bookmarks.ruleRefs
      .map((ref) => {
        const [chId, idxRaw] = ref.split('#');
        const chapter = data.rules.chapters.find((c) => c.id === chId);
        if (!chapter) return null;
        let label = chapter.title;
        if (idxRaw != null) {
          const block = chapter.blocks[Number(idxRaw)];
          if (block && 'text' in block) label = block.text;
        }
        return { ref, chId, title: chapter.title, label, isHeading: idxRaw != null };
      })
      .filter((x): x is NonNullable<typeof x> => !!x);
  }, [store.bookmarks.ruleRefs, data]);

  const questions = useMemo(() => {
    return store.bookmarks.questionRefs
      .map((ref) => {
        const c = data.cardById.get(ref);
        if (c) return { kind: 'card' as const, ref, c };
        const q = data.questionById.get(ref);
        if (q) return { kind: 'question' as const, ref, q };
        return null;
      })
      .filter((x): x is NonNullable<typeof x> => !!x);
  }, [store.bookmarks.questionRefs, data]);

  if (rules.length === 0 && questions.length === 0) {
    return (
      <div className="card text-center">
        <Bookmark className="mx-auto h-10 w-10 text-muted" aria-hidden="true" />
        <h2 className="mt-2 text-lg font-semibold">Закладок нет</h2>
        <p className="mt-1 text-muted">
          Сохраняйте главы и места в правилах, а также карточки справочника кнопкой закладки.
        </p>
        <button type="button" className="btn-ghost mx-auto mt-4" onClick={() => navigate('rules')}>
          Открыть правила
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {rules.length > 0 && (
        <section>
          <h2 className="mb-2 flex items-center gap-2 px-1 text-sm font-semibold uppercase tracking-wide text-muted">
            <BookOpen className="h-4 w-4" aria-hidden="true" /> Правила ({rules.length})
          </h2>
          <ul className="space-y-2">
            {rules.map((r) => (
              <li key={r.ref} className="card flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate('rules', r.chId)}
                  className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left"
                >
                  <span className="min-w-0">
                    <span className="text-accent-hover">{r.chId}</span>{' '}
                    <span className={r.isHeading ? 'text-muted' : ''}>{r.label}</span>
                  </span>
                  <ChevronRight className="h-5 w-5 shrink-0 text-muted" aria-hidden="true" />
                </button>
                <BookmarkButton active onClick={() => toggleRuleBookmark(r.ref)} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {questions.length > 0 && (
        <section>
          <h2 className="mb-2 flex items-center gap-2 px-1 text-sm font-semibold uppercase tracking-wide text-muted">
            <Layers className="h-4 w-4" aria-hidden="true" /> Вопросы и карточки ({questions.length})
          </h2>
          <ul className="space-y-2">
            {questions.map((it) => (
              <li key={it.ref} className="card flex items-start gap-3">
                {it.kind === 'card' ? (
                  <Layers className="mt-0.5 h-5 w-5 shrink-0 text-accent-hover" aria-hidden="true" />
                ) : (
                  <FileQuestion className="mt-0.5 h-5 w-5 shrink-0 text-accent-hover" aria-hidden="true" />
                )}
                <div className="min-w-0 flex-1">
                  {it.kind === 'card' ? (
                    <>
                      <div className="text-xs text-muted">
                        {it.c.sectionId} {it.c.sectionTitle}
                      </div>
                      <p className="font-medium leading-snug">{it.c.question}</p>
                      <p className="text-ok">{it.c.answer}</p>
                      <button
                        type="button"
                        onClick={() => navigate('study', it.c.sectionId)}
                        className="mt-1 inline-flex items-center gap-1 text-sm text-accent-hover hover:underline"
                      >
                        К разделу <ChevronRight className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="text-xs text-muted">{it.q.ticketTitle}</div>
                      <p className="font-medium leading-snug">{it.q.text}</p>
                      <button
                        type="button"
                        onClick={() => navigate('tickets', String(it.q.ticketId))}
                        className="mt-1 inline-flex items-center gap-1 text-sm text-accent-hover hover:underline"
                      >
                        К билету <ChevronRight className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </>
                  )}
                </div>
                <BookmarkButton active onClick={() => toggleQuestionBookmark(it.ref)} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
