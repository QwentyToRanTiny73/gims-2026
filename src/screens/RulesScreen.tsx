import { useState } from 'react';
import { useAppData } from '../data/context';
import { useStore } from '../store';
import type { RuleBlock, RuleChapter } from '../data/types';
import { ruleBlockText } from '../data/types';
import { Callout, Mnemonic } from '../components/Callout';
import type { CalloutKind } from '../components/Callout';
import { RuleFigure } from '../components/figures/RuleFigure';
import { BookmarkButton } from '../components/buttons';
import { SearchBar, Highlight } from '../components/SearchBar';
import { navigate } from '../router';
import { cx } from '../ui/util';
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
          hits: c.blocks.filter((b) => ruleBlockText(b).toLowerCase().includes(q)),
        }))
        .filter((x) => x.hits.length || x.chapter.title.toLowerCase().includes(q))
    : null;

  // Группировка списка глав (краткий курс + части справочника).
  const groups: { title: string; items: RuleChapter[] }[] = [];
  if (!matches) {
    for (const c of rules.chapters) {
      const g = c.group ?? 'Прочее';
      let grp = groups.find((x) => x.title === g);
      if (!grp) {
        grp = { title: g, items: [] };
        groups.push(grp);
      }
      grp.items.push(c);
    }
  }

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
              {hits.slice(0, 2).map((h, i) => (
                <p key={i} className="mt-1 text-sm text-muted">
                  …<Highlight text={ruleBlockText(h).slice(0, 140)} query={query} />…
                </p>
              ))}
            </button>
          ))
        : groups.map((g) => (
            <section key={g.title}>
              <h2 className="mb-2 mt-1 px-1 text-sm font-semibold uppercase tracking-wide text-muted">
                {g.title}
              </h2>
              <div className="space-y-2">
                {g.items.map((c) => {
                  const marked = store.bookmarks.ruleRefs.includes(c.id);
                  return (
                    <div
                      key={c.id}
                      className="card flex items-center justify-between gap-2 hover:border-accent/50"
                    >
                      <button
                        type="button"
                        onClick={() => navigate('rules', c.id)}
                        className="flex flex-1 items-center justify-between gap-3 text-left"
                      >
                        <div className="font-semibold">
                          {!c.id.startsWith('S') && <span className="text-accent-hover">{c.id} </span>}
                          {c.title}
                        </div>
                        <ChevronRight className="h-5 w-5 shrink-0 text-muted" aria-hidden="true" />
                      </button>
                      <BookmarkButton active={marked} onClick={() => toggleRuleBookmark(c.id)} />
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
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
        {!chapter.id.startsWith('S') && <span className="text-accent-hover">{chapter.id}. </span>}
        {chapter.title}
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
    case 'figure':
      return (
        <figure className="rounded-xl border border-line/60 bg-surface2/40 p-3">
          <RuleFigure figure={block.figure} />
          {block.caption && (
            <figcaption className="mt-2 text-center text-xs text-muted">{block.caption}</figcaption>
          )}
        </figure>
      );
    case 'terms':
      return (
        <dl className="overflow-hidden rounded-xl border border-line">
          {block.items.map((it, i) => (
            <div
              key={i}
              className="grid grid-cols-[minmax(96px,36%)_1fr] border-b border-line/60 last:border-b-0 odd:bg-surface/40"
            >
              <dt className="px-3 py-2 font-semibold text-accent-hover">{it.term}</dt>
              <dd className="px-3 py-2">{it.def}</dd>
            </div>
          ))}
        </dl>
      );
    case 'qa':
      return (
        <div className="rounded-xl border border-line/60 bg-surface2/40 p-3">
          <p className="font-semibold leading-snug">
            <span className="text-accent-hover">Вопрос. </span>
            {block.q}
          </p>
          <p className="mt-1 leading-snug">
            <span className="font-semibold text-ok">Ответ. </span>
            {block.a}
          </p>
          {block.note && <p className="mt-1 text-sm text-muted">{block.note}</p>}
          {block.trap && (
            <div className="mt-2">
              <Callout kind="trap">{block.trap}</Callout>
            </div>
          )}
        </div>
      );
    case 'list': {
      const Tag = block.ordered ? 'ol' : 'ul';
      return (
        <Tag className={cx('space-y-1 pl-5', block.ordered ? 'list-decimal' : 'list-disc')}>
          {block.items.map((it, i) => (
            <li key={i} className="leading-relaxed marker:text-accent">
              {it}
            </li>
          ))}
        </Tag>
      );
    }
    default:
      return null;
  }
}
