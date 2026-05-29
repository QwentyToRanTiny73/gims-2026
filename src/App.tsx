import { useState } from 'react';
import { Menu, Type, Sun, Moon } from 'lucide-react';
import { PrefsProvider, usePrefs } from './ui/prefs';
import { StoreProvider } from './store';
import { DataProvider } from './data/context';
import { Sidebar } from './components/Sidebar';
import { useRoute } from './router';
import { SCREEN_TITLES } from './nav';
import { cx } from './ui/util';

import { PlanScreen } from './screens/PlanScreen';
import { StudyScreen } from './screens/StudyScreen';
import { ExamScreen } from './screens/ExamScreen';
import { TicketsScreen } from './screens/TicketsScreen';
import { MarathonScreen } from './screens/MarathonScreen';
import { MistakesScreen } from './screens/MistakesScreen';
import { FavoritesScreen } from './screens/FavoritesScreen';
import { SearchScreen } from './screens/SearchScreen';
import { RulesScreen } from './screens/RulesScreen';
import { BookmarksScreen } from './screens/BookmarksScreen';
import { GuideScreen } from './screens/GuideScreen';
import { StatsScreen } from './screens/StatsScreen';
import { ResetScreen } from './screens/ResetScreen';

const FONT_LABEL: Record<string, string> = { normal: 'A', large: 'A+', xlarge: 'A++' };
const FONT_NAME: Record<string, string> = {
  normal: 'обычный',
  large: 'крупный',
  xlarge: 'очень крупный',
};

function FontToggle() {
  const { font, cycleFont } = usePrefs();
  return (
    <button
      type="button"
      onClick={cycleFont}
      className="tap inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 hover:bg-surface2"
      aria-label={`Размер шрифта: ${FONT_NAME[font]}. Нажмите, чтобы изменить`}
      title="Размер шрифта"
    >
      <Type className="h-5 w-5" aria-hidden="true" />
      <span className="text-sm font-semibold tabular-nums">{FONT_LABEL[font]}</span>
    </button>
  );
}

function ThemeToggle() {
  const { theme, toggleTheme } = usePrefs();
  const dark = theme === 'dark';
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="tap inline-flex items-center justify-center rounded-lg p-2 hover:bg-surface2"
      aria-pressed={dark}
      aria-label={dark ? 'Светлая (дневная) тема' : 'Тёмная (ночная) тема'}
      title={dark ? 'Светлая тема' : 'Тёмная тема'}
    >
      {dark ? (
        <Sun className="h-5 w-5" aria-hidden="true" />
      ) : (
        <Moon className="h-5 w-5" aria-hidden="true" />
      )}
    </button>
  );
}

function Shell() {
  const route = useRoute();
  const [menuOpen, setMenuOpen] = useState(false);

  const screens: Record<typeof route.screen, JSX.Element> = {
    plan: <PlanScreen />,
    study: <StudyScreen param={route.param} />,
    exam: <ExamScreen />,
    tickets: <TicketsScreen param={route.param} />,
    marathon: <MarathonScreen />,
    mistakes: <MistakesScreen />,
    favorites: <FavoritesScreen />,
    search: <SearchScreen />,
    rules: <RulesScreen param={route.param} />,
    bookmarks: <BookmarksScreen />,
    guide: <GuideScreen />,
    stats: <StatsScreen />,
    reset: <ResetScreen />,
  };

  return (
    <div className="min-h-screen">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-[60] focus:rounded-lg focus:bg-accent focus:px-3 focus:py-2"
      >
        К содержимому
      </a>

      <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-line bg-bg/95 px-2 py-2 backdrop-blur">
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="tap rounded-lg p-2 hover:bg-surface2"
          aria-label="Открыть меню"
          aria-expanded={menuOpen}
        >
          <Menu className="h-6 w-6" aria-hidden="true" />
        </button>
        <h1 className="flex-1 truncate text-lg font-bold">{SCREEN_TITLES[route.screen]}</h1>
        <ThemeToggle />
        <FontToggle />
      </header>

      <Sidebar open={menuOpen} current={route.screen} onClose={() => setMenuOpen(false)} />

      <main id="main" className={cx('mx-auto w-full max-w-3xl px-3 py-4 pb-16')}>
        {screens[route.screen]}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <PrefsProvider>
      <StoreProvider>
        <DataProvider>
          <Shell />
        </DataProvider>
      </StoreProvider>
    </PrefsProvider>
  );
}
