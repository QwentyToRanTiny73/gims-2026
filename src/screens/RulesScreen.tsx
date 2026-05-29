import { useState } from 'react';
import { useAppData } from '../data/context';
import { useStore } from '../store';
import type { RuleBlock, RuleChapter } from '../data/types';
import { Callout, Mnemonic } from '../components/Callout';
import type { CalloutKind } from '../components/Callout';
import { BookmarkButton } from '../components/buttons';
import { SearchBar, Highlight } from '../components/SearchBar';
import { navigate } from '../router';
import { ArrowLeft, ChevronRight } from 'lucide-react';

export function RulesScreen({ param }: { param: string | null }) {
  const { rules } = useAppData();
  const { store, toggleRuleBookmark } = useStore();
  const [query, setQuery] = useState('');

  const chapter = rules.chapters.find((c) => c.id === param) || null;

  if (chapter) return <ChapterView chapter={chapter} />;

  const q = query.trim().toLowerCase();
  const matches = q
    ? rules.chapters
        .map((c) => ({
          chapter: c,
          hits: c.blocks.filter((b) => 'text' in b && b.text.toLowerCase().includes(q)),
        }))
        .filter((x) => x.hits.length || x.chapter.title.toLowerCase().includes(q))
    : null;

  return (
    <div className="space-y-3">
      <SearchBar value={query} onChange={setQuery} label="Поиск по правилам" placeholder="Поиск по правилам…" />

      {matches
        ? matches.map(({ chapter: c, hits }) => (
            <button
              key={c.id}
              type="button"
              onClick={() => navigate('rules', c.id)}
              className="card block w-full text-left hover:border-accent/50"
            >
              <div className="font-semibold">
                <span className="text-accent-hover">{c.id}</span> {c.title}
              </div>
              {hits.slice(0, 2).map((h, i) =>
                'text' in h ? (
                  <p key={i} className="mt-1 text-sm text-muted">
                    …<Highlight text={h.text.slice(0, 140)} query={query} />…
                  </p>
                ) : null
              )}
            </button>
          ))
        : rules.chapters.map((c) => {
            const marked = store.bookmarks.ruleRefs.includes(c.id);
            return (
              <div key={c.id} className="card flex items-center justify-between gap-2 hover:border-accent/50">
                <button
                  type="button"
                  onClick={() => navigate('rules', c.id)}
                  className="flex flex-1 items-center justify-between gap-3 text-left"
                >
                  <div className="font-semibold">
                    <span className="text-accent-hover">{c.id}</span> {c.title}
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-muted" aria-hidden="true" />
                </button>
                <BookmarkButton active={marked} onClick={() => toggleRuleBookmark(c.id)} />
              </div>
            );
          })}
    </div>
  );
}

function ChapterView({ chapter }: { chapter: RuleChapter }) {
  const { store, toggleRuleBookmark } = useStore();
  const marked = store.bookmarks.ruleRefs.includes(chapter.id);
  return (
    <article className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <button type="button" className="btn-ghost" onClick={() => navigate('rules')}>
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Главы
        </button>
        <BookmarkButton active={marked} onClick={() => toggleRuleBookmark(chapter.id)} />
      </div>
      <h2 className="px-1 text-2xl font-bold">
        <span className="text-accent-hover">{chapter.id}.</span> {chapter.title}
      </h2>
      <div className="space-y-3">
        {chapter.blocks.map((b, i) => (
          <BlockView key={i} block={b} chapterId={chapter.id} index={i} />
        ))}
      </div>
    </article>
  );
}

function BlockView({ block, chapterId, index }: { block: RuleBlock; chapterId: string; index: number }) {
  const { store, toggleRuleBookmark } = useStore();
  switch (block.type) {
    case 'heading': {
      const ref = `${chapterId}#${index}`;
      const marked = store.bookmarks.ruleRefs.includes(ref);
      return (
        <div className="flex items-center justify-between gap-2 pt-2">
          <h3 className="text-lg font-bold text-ink">{block.text}</h3>
          <BookmarkButton active={marked} onClick={() => toggleRuleBookmark(ref)} />
        </div>
      );
    }
    case 'paragraph':
      return <p className="leading-relaxed text-ink/90">{block.text}</p>;
    case 'mnemonic':
      return <Mnemonic>{block.text}</Mnemonic>;
    case 'callout':
      return <Callout kind={block.kind as CalloutKind}>{block.text}</Callout>;
    case 'table':
      return (
        <div className="overflow-x-auto rounded-xl border border-line">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-surface2">
                {block.head.map((h, i) => (
                  <th key={i} scope="col" className="border-b border-line px-3 py-2 text-left font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, ri) => (
                <tr key={ri} className="odd:bg-surface/40">
                  {row.map((cell, ci) => (
                    <td key={ci} className="border-b border-line/60 px-3 py-2 align-top">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    default:
      return null;
  }
}
