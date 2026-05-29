import type { OptionKey, TicketQuestion } from '../data/types';
import type { ExamAttempt } from '../store/types';
import type { ResultItem } from '../components/ResultScreen';

export function buildItems(
  questions: TicketQuestion[],
  answers: Record<string, OptionKey | null>
): ResultItem[] {
  return questions.map((q) => ({ question: q, chosen: answers[q.id] ?? null }));
}

export function countCorrect(items: ResultItem[]): number {
  return items.filter((i) => i.chosen != null && i.chosen === i.question.correct).length;
}

export function buildAttempt(
  kind: ExamAttempt['kind'],
  items: ResultItem[],
  durationSec: number,
  threshold: number,
  ticketId?: number
): ExamAttempt {
  const correct = countCorrect(items);
  return {
    id: `${kind}-${Date.now()}`,
    kind,
    date: new Date().toISOString(),
    ticketId,
    total: items.length,
    correct,
    durationSec,
    passed: correct >= threshold,
    answers: items.map((i) => ({
      questionId: i.question.id,
      chosen: i.chosen,
      correct: i.question.correct,
    })),
  };
}
