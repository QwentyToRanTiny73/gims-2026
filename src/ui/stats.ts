import type { AppData } from '../data/index';
import type { Store } from '../store/types';
import { pct } from './util';

export interface SectionAccuracy {
  id: string;
  title: string;
  attempts: number; // знаменатель (карточки + тестовые по теме)
  accuracy: number; // 0..100
  hasData: boolean;
}

export interface DailyPoint {
  date: string;
  accuracy: number;
}

export interface Aggregates {
  answeredQuestions: number; // тестовые ответы
  cardsSeen: number;
  overallAccuracy: number; // по тестовым вопросам
  totalAttempts: number;
  avgExamScore: number; // средний % по экзаменам
  bestResult: number; // лучший % среди попыток
  streakDays: number;
  lastActivity: string | null;
  sections: SectionAccuracy[];
  weakest: SectionAccuracy[];
  daily: DailyPoint[];
}

export function getAggregates(store: Store, data: AppData): Aggregates {
  const qStats = store.questionStats;
  let qAnswered = 0;
  let qCorrect = 0;
  for (const id in qStats) {
    qAnswered += qStats[id].answered;
    qCorrect += qStats[id].correct;
  }

  let cardsSeen = 0;
  for (const id in store.cardStats) cardsSeen += store.cardStats[id].seen;

  // точность по разделам справочника (карточки + тестовые вопросы той же темы)
  const sections: SectionAccuracy[] = [];
  for (const b of data.reference.blocks) {
    for (const s of b.sections) {
      let ok = 0;
      let bad = 0;
      for (const c of s.cards) {
        const cs = store.cardStats[c.id];
        if (cs) {
          ok += cs.known;
          bad += cs.unknown;
        }
      }
      for (const q of data.flatQuestions) {
        if (q.topic && q.topic === s.title) {
          const st = qStats[q.id];
          if (st) {
            ok += st.correct;
            bad += st.wrong;
          }
        }
      }
      const denom = ok + bad;
      sections.push({
        id: s.id,
        title: s.title,
        attempts: denom,
        accuracy: pct(ok, denom),
        hasData: denom > 0,
      });
    }
  }

  const weakest = sections
    .filter((s) => s.hasData)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 3);

  // дневная точность по попыткам (экзамены/билеты/ошибки)
  const byDay = new Map<string, { correct: number; total: number }>();
  for (const a of store.attempts) {
    const day = new Date(a.date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
    const cur = byDay.get(day) || { correct: 0, total: 0 };
    cur.correct += a.correct;
    cur.total += a.total;
    byDay.set(day, cur);
  }
  const daily: DailyPoint[] = [...byDay.entries()].map(([date, v]) => ({
    date,
    accuracy: pct(v.correct, v.total),
  }));

  const exams = store.attempts.filter((a) => a.kind === 'exam');
  const avgExamScore = exams.length
    ? Math.round(exams.reduce((s, a) => s + pct(a.correct, a.total), 0) / exams.length)
    : 0;
  const bestResult = store.attempts.reduce((m, a) => Math.max(m, pct(a.correct, a.total)), 0);
  const lastActivity =
    store.attempts.length > 0 ? store.attempts[store.attempts.length - 1].date : null;

  return {
    answeredQuestions: qAnswered,
    cardsSeen,
    overallAccuracy: pct(qCorrect, qAnswered),
    totalAttempts: store.attempts.length,
    avgExamScore,
    bestResult,
    streakDays: store.streakDays,
    lastActivity,
    sections,
    weakest,
    daily,
  };
}

// Вопросы/карточки, в которых пользователь чаще ошибался.
export interface MistakeRow {
  id: string;
  kind: 'question' | 'card';
  text: string;
  wrong: number;
}

export function getMistakes(store: Store, data: AppData): MistakeRow[] {
  const rows: MistakeRow[] = [];
  for (const id in store.questionStats) {
    const st = store.questionStats[id];
    if (st.wrong > 0) {
      const q = data.questionById.get(id);
      rows.push({ id, kind: 'question', text: q?.text || id, wrong: st.wrong });
    }
  }
  for (const id in store.cardStats) {
    const st = store.cardStats[id];
    if (st.unknown > 0) {
      const c = data.cardById.get(id);
      rows.push({ id, kind: 'card', text: c?.question || id, wrong: st.unknown });
    }
  }
  return rows.sort((a, b) => b.wrong - a.wrong);
}
