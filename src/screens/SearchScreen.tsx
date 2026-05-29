import { useMemo, useState } from 'react';
import { useAppData } from '../data/context';
import { SearchBar, Highlight } from '../components/SearchBar';
import { navigate } from '../router';
import { FileQuestion, Layers, BookOpen, ChevronRight } from 'lucide-react';

interface Hit {
  id: string;
  title: string;
  snippet: string;
  go: () => void;
}

export function SearchScreen() {
  const data = useAppData();
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();

  const { questions, cards, rules } = useMemo(() => {
    if (q.length < 2) return { questions: [], cards: [], rules: [] as Hit[] };

    const questions: Hit[] = data.flatQuestions
      .filter(
        (x) =>
          x.text.toLowerCase().includes(q) ||
          Object.values(x.options).some((o) => o.toLowerCase().includes(q))
      )
      .slice(0, 50)
      .map((x) => ({
        id: x.id,
        title: `${x.ticketTitle} · вопрос ${x.index}`,
        snippet: x.text,
        go: () => navigate('tickets', String(x.ticketId)),
      }));

    const cards: Hit[] = data.flatCards
      .filter(
        (c) =>
          c.question.toLowerCase().includes(q) ||
          c.answer.toLowerCase().includes(q) ||
          (c.hint ?? '').toLowerCase().includes(q)
      )
      .slice(0, 50)
      .map((c) => ({
        id: c.id,
        title: `${c.sectionId} ${c.sectionTitle}`,
        snippet: `${c.question} — ${c.answer}`,
        go: () => navigate('study', c.sectionId),
      }));

    const rules: Hit[] = [];
    for (const ch of data.rules.chapters) {
      ch.blocks.forEach((b, i) => {
        if ('text' in b && b.text.toLowerCase().includes(q)) {
          rules.push({
            id: `${ch.id}#${i}`,
            title: `${ch.id} ${ch.title}`,
            snippet: b.text,
            go: () => navigate('rules', ch.id),
          });
        }
      });
    }

    return { questions, cards, rules: rules.slice(0, 50) };
  }, [q, data]);

  const total = questions.length + cards.length + rules.length;

  return (
    <div className="space-y-4">
      <SearchBar
        value={query}
        onChange={setQuery}
        label="Поиск по всем материалам"
        placeholder="Поиск по тестам, справочнику и правилам…"
      />

      {q.length < 2 ? (
        <p className="px-1 text-muted">Введите минимум 2 символа для поиска.</p>
      ) : total === 0 ? (
        <p className="px-1 text-muted">Ничего не найдено по запросу «{query}».</p>
      ) : (
        <>
          <p className="px-1 text-sm text-muted">Найдено: {total}</p>
          <Group
            icon={<FileQuestion className="h-4 w-4" aria-hidden="true" />}
            title="Тестовые вопросы"
            hits={questions}
            query={query}
          />
          <Group
            icon={<Layers className="h-4 w-4" aria-hidden="true" />}
            title="Справочник"
            hits={cards}
            query={query}
          />
          <Group
            icon={<BookOpen className="h-4 w-4" aria-hidden="true" />}
            title="Правила"
            hits={rules}
            query={query}
          />
        </>
      )}
    </div>
  );
}

function Group({
  icon,
  title,
  hits,
  query,
}: {
  icon: React.ReactNode;
  title: string;
  hits: Hit[];
  query: string;
}) {
  if (hits.length === 0) return null;
  return (
    <section>
      <h2 className="mb-2 flex items-center gap-2 px-1 text-sm font-semibold uppercase tracking-wide text-muted">
        {icon} {title} ({hits.length})
      </h2>
      <ul className="space-y-2">
        {hits.map((h) => (
          <li key={h.id}>
            <button
              type="button"
              onClick={h.go}
              className="card flex w-full items-center gap-3 text-left hover:border-accent/50"
            >
              <div className="min-w-0 flex-1">
                <div className="text-xs text-accent-hover">{h.title}</div>
                <p className="mt-0.5 line-clamp-2 text-sm">
                  <Highlight text={h.snippet} query={query} />
                </p>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-muted" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
