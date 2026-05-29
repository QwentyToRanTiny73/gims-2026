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

export type RuleBlock =
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'mnemonic'; text: string }
  | { type: 'callout'; kind: 'new2026' | 'changed2026' | 'kept' | 'warning' | 'trap'; text: string }
  | { type: 'table'; head: string[]; rows: string[][] };

export interface RuleChapter {
  id: string;
  title: string;
  blocks: RuleBlock[];
}

export interface RulesFile {
  chapters: RuleChapter[];
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
