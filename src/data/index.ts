import type {
  TicketsFile,
  ReferenceFile,
  ReferenceBlock,
  ReferenceCard,
  RulesFile,
  RuleChapter,
  RuleBlock,
  TextbookFile,
  FlatCard,
  FlatTicketQuestion,
} from './types';
import { rulesData } from './rules.data';
import { extraTickets } from './extra-tickets.data';
import { extraRules } from './extra-rules.data';

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

// Собирает чистые карточки «вопрос → ответ» из блоков правил:
// — qa: вопрос экзамена → ответ (+ примечание/ловушка как подсказка);
// — terms: «Что такое …?» → определение.
// Карточки группируются по главам, главы — по группам (части справочника).
function buildReferenceFromRules(rules: RulesFile): ReferenceFile {
  const blocks: ReferenceBlock[] = [];
  const byGroup = new Map<string, ReferenceBlock>();
  let bi = 0;
  for (const ch of rules.chapters) {
    const cards: ReferenceCard[] = [];
    let i = 0;
    for (const b of ch.blocks) {
      if (b.type === 'qa' && b.q && b.a) {
        const hint =
          [b.note, b.trap ? `⚠ ${b.trap}` : ''].filter(Boolean).join(' · ') || null;
        cards.push({ id: `${ch.id}-c${++i}`, question: b.q, answer: b.a, hint, needsReview: false });
      } else if (b.type === 'terms') {
        for (const it of b.items) {
          cards.push({
            id: `${ch.id}-c${++i}`,
            question: `Что такое «${it.term}»?`,
            answer: it.def,
            hint: null,
            needsReview: false,
          });
        }
      }
    }
    if (!cards.length) continue;
    const g = ch.group ?? 'Прочее';
    let blk = byGroup.get(g);
    if (!blk) {
      blk = { id: `block-${++bi}`, title: g, sections: [] };
      byGroup.set(g, blk);
      blocks.push(blk);
    }
    blk.sections.push({
      id: ch.id,
      title: ch.title.replace(/^Глава\s+\d+\.\s*/, ''),
      count: cards.length,
      cards,
    });
  }
  return { blocks };
}

export async function loadData(): Promise<AppData> {
  if (cache) return cache;
  const [tickets, textbook] = await Promise.all([
    getJSON<TicketsFile>('tickets.json'),
    getJSON<TextbookFile>('textbook.json'),
  ]);

  // Раздел «Правила» = краткий курс-тренажёр (A0–A9, выверен вручную)
  // + полный справочник 2026 (26 глав, сгруппированы по частям I–VIII).
  const courseChapters: RuleChapter[] = rulesData.chapters.map((c) => ({
    ...c,
    group: c.group ?? 'Краткий курс (тренажёр)',
  }));
  const textbookChapters: RuleChapter[] = textbook.chapters.map((c) => ({
    id: `S${c.num}`,
    title: `Глава ${c.num}. ${c.title}`,
    group: c.partTitle,
    blocks: c.sections.flatMap(
      (s): RuleBlock[] => [{ type: 'heading', text: `${s.id} ${s.title}` }, ...s.blocks]
    ),
  }));
  const rules: RulesFile = { chapters: [...courseChapters, ...textbookChapters, ...extraRules] };

  // Билет №6 (кураторский) добавляем к разобранным из Тесты.pdf.
  tickets.tickets = [...tickets.tickets, ...extraTickets];

  // «Режим изучения» — чистые карточки, собранные из всего материала «Правил»
  // (вопросы экзамена + определения), сгруппированные по главам. Сломанный
  // сжатый reference.json больше не используется.
  const reference: ReferenceFile = buildReferenceFromRules(rules);

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
