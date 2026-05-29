export interface ExamAttempt {
  id: string;
  kind: 'exam' | 'ticket' | 'mistakes';
  date: string; // ISO
  ticketId?: number;
  total: number;
  correct: number;
  durationSec: number;
  passed: boolean;
  answers: { questionId: string; chosen: string | null; correct: string | null }[];
}

export interface CardStat {
  seen: number;
  known: number;
  unknown: number;
}

export interface QuestionStat {
  answered: number;
  correct: number;
  wrong: number;
}

export interface Store {
  version: 1;
  attempts: ExamAttempt[];
  cardStats: Record<string, CardStat>;
  questionStats: Record<string, QuestionStat>;
  favorites: string[]; // id вопросов/карточек
  bookmarks: { ruleRefs: string[]; questionRefs: string[] };
  marathonPosition: number | null;
  lastVisit: string; // ISO-дата
  streakDays: number;
}

export function defaultStore(): Store {
  return {
    version: 1,
    attempts: [],
    cardStats: {},
    questionStats: {},
    favorites: [],
    bookmarks: { ruleRefs: [], questionRefs: [] },
    marathonPosition: null,
    lastVisit: new Date().toISOString(),
    streakDays: 0,
  };
}
