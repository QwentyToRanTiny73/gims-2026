import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { STORAGE_KEY } from '../config';
import { defaultStore } from './types';
import type { ExamAttempt, Store } from './types';

/* ─── Безопасная загрузка + миграция ─── */
function loadStore(): Store {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultStore();
    const parsed = JSON.parse(raw) as Partial<Store>;
    // мягкая миграция: дополняем недостающие поля дефолтами
    return { ...defaultStore(), ...parsed, version: 1 };
  } catch {
    return defaultStore();
  }
}

function isSameDay(a: Date, b: Date): boolean {
  return a.toDateString() === b.toDateString();
}

interface StoreContextValue {
  store: Store;
  // мутации
  recordAttempt: (a: ExamAttempt) => void;
  recordCard: (cardId: string, result: 'known' | 'unknown') => void;
  recordQuestion: (questionId: string, isCorrect: boolean) => void;
  toggleFavorite: (id: string) => void;
  toggleRuleBookmark: (ref: string) => void;
  toggleQuestionBookmark: (ref: string) => void;
  setMarathonPosition: (pos: number | null) => void;
  resetAll: () => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<Store>(loadStore);
  const firstRun = useRef(true);

  // обновляем серию дней и дату визита при старте
  useEffect(() => {
    setStore((s) => {
      const now = new Date();
      const last = new Date(s.lastVisit);
      let streak = s.streakDays || 0;
      if (!isSameDay(now, last)) {
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        streak = isSameDay(last, yesterday) ? streak + 1 : 1;
      } else if (streak === 0) {
        streak = 1;
      }
      return { ...s, lastVisit: now.toISOString(), streakDays: streak };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // персистентность
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch {
      /* квота/приватный режим — игнорируем */
    }
  }, [store]);

  const recordAttempt = useCallback((a: ExamAttempt) => {
    setStore((s) => {
      const questionStats = { ...s.questionStats };
      for (const ans of a.answers) {
        const cur = questionStats[ans.questionId] || { answered: 0, correct: 0, wrong: 0 };
        const ok = ans.chosen != null && ans.chosen === ans.correct;
        questionStats[ans.questionId] = {
          answered: cur.answered + 1,
          correct: cur.correct + (ok ? 1 : 0),
          wrong: cur.wrong + (ok ? 0 : 1),
        };
      }
      return { ...s, attempts: [...s.attempts, a], questionStats };
    });
  }, []);

  const recordCard = useCallback((cardId: string, result: 'known' | 'unknown') => {
    setStore((s) => {
      const cur = s.cardStats[cardId] || { seen: 0, known: 0, unknown: 0 };
      return {
        ...s,
        cardStats: {
          ...s.cardStats,
          [cardId]: {
            seen: cur.seen + 1,
            known: cur.known + (result === 'known' ? 1 : 0),
            unknown: cur.unknown + (result === 'unknown' ? 1 : 0),
          },
        },
      };
    });
  }, []);

  const recordQuestion = useCallback((questionId: string, isCorrect: boolean) => {
    setStore((s) => {
      const cur = s.questionStats[questionId] || { answered: 0, correct: 0, wrong: 0 };
      return {
        ...s,
        questionStats: {
          ...s.questionStats,
          [questionId]: {
            answered: cur.answered + 1,
            correct: cur.correct + (isCorrect ? 1 : 0),
            wrong: cur.wrong + (isCorrect ? 0 : 1),
          },
        },
      };
    });
  }, []);

  const toggleIn = (arr: string[], id: string) =>
    arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id];

  const toggleFavorite = useCallback((id: string) => {
    setStore((s) => ({ ...s, favorites: toggleIn(s.favorites, id) }));
  }, []);

  const toggleRuleBookmark = useCallback((ref: string) => {
    setStore((s) => ({
      ...s,
      bookmarks: { ...s.bookmarks, ruleRefs: toggleIn(s.bookmarks.ruleRefs, ref) },
    }));
  }, []);

  const toggleQuestionBookmark = useCallback((ref: string) => {
    setStore((s) => ({
      ...s,
      bookmarks: { ...s.bookmarks, questionRefs: toggleIn(s.bookmarks.questionRefs, ref) },
    }));
  }, []);

  const setMarathonPosition = useCallback((pos: number | null) => {
    setStore((s) => ({ ...s, marathonPosition: pos }));
  }, []);

  const resetAll = useCallback(() => {
    const fresh = defaultStore();
    setStore(fresh);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<StoreContextValue>(
    () => ({
      store,
      recordAttempt,
      recordCard,
      recordQuestion,
      toggleFavorite,
      toggleRuleBookmark,
      toggleQuestionBookmark,
      setMarathonPosition,
      resetAll,
    }),
    [
      store,
      recordAttempt,
      recordCard,
      recordQuestion,
      toggleFavorite,
      toggleRuleBookmark,
      toggleQuestionBookmark,
      setMarathonPosition,
      resetAll,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
