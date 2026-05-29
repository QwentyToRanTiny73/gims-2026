// Параметры экзамена. ВНИМАНИЕ: значения взяты из учебных материалов
// (Тесты.pdf: «20 вопросов · 40 минут · проходной 80%»). Их следует
// сверять с актуальными требованиями ГИМС МЧС России перед использованием.
export const examConfig = {
  questionCount: 20,
  durationMinutes: 40,
  passRatio: 0.8, // 80% => 16 из 20
} as const;

export function passThreshold(total: number = examConfig.questionCount): number {
  return Math.ceil(total * examConfig.passRatio);
}

export const APP_TITLE = 'ГИМС 2026';
export const STORAGE_KEY = 'gims2026:v1';
