// Типы данных, соответствующие public/data/*.json (без any).

export type OptionKey = 'А' | 'Б' | 'В' | 'Г';

export interface TicketQuestion {
  id: string;
  text: string;
  options: Record<OptionKey, string>;
  correct: OptionKey | null;
  explanation: string | null;
  mnemonic: string | null;
  trap: string | null;
  topic: string | null;
  needsReview?: boolean;
}

export interface Ticket {
  id: number;
  title: string;
  questions: TicketQuestion[];
}

export interface TicketsFile {
  tickets: Ticket[];
}

export interface ReferenceCard {
  id: string;
  question: string;
  answer: string;
  hint: string | null;
  needsReview: boolean;
}

export interface ReferenceSection {
  id: string;
  title: string;
  count: number;
  cards: ReferenceCard[];
}

export interface ReferenceBlock {
  id: string;
  title: string;
  sections: ReferenceSection[];
}

export interface ReferenceFile {
  blocks: ReferenceBlock[];
}

export type FigureId =
  | 'ship-anatomy'
  | 'stability-states'
  | 'nav-lights'
  | 'crossing'
  | 'fire-steps'
  | 'cpr';

export type RuleBlock =
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'mnemonic'; text: string }
  | { type: 'callout'; kind: 'new2026' | 'changed2026' | 'kept' | 'warning' | 'trap'; text: string }
  | { type: 'table'; head: string[]; rows: string[][] }
  | { type: 'figure'; figure: FigureId; caption?: string }
  | { type: 'terms'; items: { term: string; def: string }[] }
  | { type: 'qa'; q: string; a: string; note?: string; trap?: string }
  | { type: 'list'; ordered?: boolean; items: string[] };

export interface RuleChapter {
  id: string;
  title: string;
  blocks: RuleBlock[];
}

export interface RulesFile {
  chapters: RuleChapter[];
}

// Плоский текст блока правил — для полнотекстового поиска и сниппетов.
export function ruleBlockText(b: RuleBlock): string {
  switch (b.type) {
    case 'heading':
    case 'paragraph':
    case 'mnemonic':
    case 'callout':
      return b.text;
    case 'table':
      return [...b.head, ...b.rows.flat()].join(' ');
    case 'figure':
      return b.caption ?? '';
    case 'terms':
      return b.items.map((i) => `${i.term} ${i.def}`).join(' ');
    case 'qa':
      return [b.q, b.a, b.note ?? '', b.trap ?? ''].join(' ');
    case 'list':
      return b.items.join(' ');
    default:
      return '';
  }
}

// Удобные «плоские» представления для поиска/режимов.
export interface FlatCard extends ReferenceCard {
  sectionId: string;
  sectionTitle: string;
  blockId: string;
  blockTitle: string;
}

export interface FlatTicketQuestion extends TicketQuestion {
  ticketId: number;
  ticketTitle: string;
  index: number; // позиция в билете (1..20)
}
