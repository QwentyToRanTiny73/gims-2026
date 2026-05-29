import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

export type FontSize = 'normal' | 'large' | 'xlarge';
export type Theme = 'light' | 'dark';

const FONT_KEY = 'gims2026:font';
const THEME_KEY = 'gims2026:theme';

// Порядок перебора размеров шрифта.
const FONT_ORDER: FontSize[] = ['normal', 'large', 'xlarge'];

interface PrefsValue {
  font: FontSize;
  setFont: (f: FontSize) => void;
  cycleFont: () => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
}

const Ctx = createContext<PrefsValue | null>(null);

function initialTheme(): Theme {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  // По умолчанию — светлая (дневная) тема, как просил пользователь.
  return 'light';
}

function initialFont(): FontSize {
  const stored = localStorage.getItem(FONT_KEY) as FontSize | null;
  return stored && FONT_ORDER.includes(stored) ? stored : 'normal';
}

export function PrefsProvider({ children }: { children: ReactNode }) {
  const [font, setFont] = useState<FontSize>(initialFont);
  const [theme, setTheme] = useState<Theme>(initialTheme);

  useEffect(() => {
    document.documentElement.dataset.font = font;
    try {
      localStorage.setItem(FONT_KEY, font);
    } catch {
      /* ignore */
    }
  }, [font]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    // Обновляем цвет адресной строки/PWA под тему.
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#0B1B29' : '#E9F2F8');
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  const cycleFont = () =>
    setFont((f) => FONT_ORDER[(FONT_ORDER.indexOf(f) + 1) % FONT_ORDER.length]);
  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  return (
    <Ctx.Provider value={{ font, setFont, cycleFont, theme, setTheme, toggleTheme }}>
      {children}
    </Ctx.Provider>
  );
}

export function usePrefs(): PrefsValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('usePrefs must be used within PrefsProvider');
  return ctx;
}
