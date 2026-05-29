import type {
  TicketsFile,
  ReferenceFile,
  RulesFile,
  FlatCard,
  FlatTicketQuestion,
} from './types';

const base = import.meta.env.BASE_URL;

async function getJSON<T>(name: string): Promise<T> {
  const res = await fetch(`${base}data/${name}`);
  if (!res.ok) throw new Error(`Не удалось загрузить ${name}: ${res.status}`);
  return (await res.json()) as T;
}

export interface AppData {
  tickets: TicketsFile;
  reference: ReferenceFile;
  rules: RulesFile;
  // производные
  flatQuestions: FlatTicketQuestion[];
  flatCards: FlatCard[];
  questionById: Map<string, FlatTicketQuestion>;
  cardById: Map<string, FlatCard>;
}

let cache: AppData | null = null;

export async function loadData(): Promise<AppData> {
  if (cache) return cache;
  const [tickets, reference, rules] = await Promise.all([
    getJSON<TicketsFile>('tickets.json'),
    getJSON<ReferenceFile>('reference.json'),
    getJSON<RulesFile>('rules.json'),
  ]);

  const flatQuestions: FlatTicketQuestion[] = [];
  for (const t of tickets.tickets) {
    t.questions.forEach((q, i) =>
      flatQuestions.push({ ...q, ticketId: t.id, ticketTitle: t.title, index: i + 1 })
    );
  }

  const flatCards: FlatCard[] = [];
  for (const b of reference.blocks) {
    for (const s of b.sections) {
      for (const c of s.cards) {
        flatCards.push({
          ...c,
          sectionId: s.id,
          sectionTitle: s.title,
          blockId: b.id,
          blockTitle: b.title,
        });
      }
    }
  }

  const questionById = new Map(flatQuestions.map((q) => [q.id, q]));
  const cardById = new Map(flatCards.map((c) => [c.id, c]));

  cache = { tickets, reference, rules, flatQuestions, flatCards, questionById, cardById };
  return cache;
}
