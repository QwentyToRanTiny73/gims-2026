import {
  Bookmark,
  BookOpen,
  LayoutDashboard,
  GraduationCap,
  Timer,
  Tickets,
  Infinity as InfinityIcon,
  TrendingDown,
  Star,
  Search,
  HelpCircle,
  BarChart3,
  Trash2,
} from 'lucide-react';
import type { ScreenId } from './router';

export interface NavItem {
  screen: ScreenId;
  label: string;
  icon: typeof Bookmark;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const NAV: NavGroup[] = [
  {
    title: 'Библиотека',
    items: [
      { screen: 'bookmarks', label: 'Закладки', icon: Bookmark },
      { screen: 'rules', label: 'Правила', icon: BookOpen },
    ],
  },
  {
    title: 'Обучение',
    items: [
      { screen: 'plan', label: 'Мой план', icon: LayoutDashboard },
      { screen: 'study', label: 'Режим изучения', icon: GraduationCap },
      { screen: 'exam', label: 'Режим экзамена', icon: Timer },
      { screen: 'tickets', label: 'Билеты', icon: Tickets },
      { screen: 'marathon', label: 'Марафон', icon: InfinityIcon },
      { screen: 'mistakes', label: 'Топ моих ошибок', icon: TrendingDown },
      { screen: 'favorites', label: 'Избранные вопросы', icon: Star },
      { screen: 'search', label: 'Поиск по вопросам', icon: Search },
      { screen: 'guide', label: 'Руководство', icon: HelpCircle },
      { screen: 'stats', label: 'Статистика', icon: BarChart3 },
      { screen: 'reset', label: 'Сброс', icon: Trash2 },
    ],
  },
];

export const SCREEN_TITLES: Record<ScreenId, string> = {
  plan: 'Мой план',
  study: 'Режим изучения',
  exam: 'Режим экзамена',
  tickets: 'Билеты',
  marathon: 'Марафон',
  mistakes: 'Топ моих ошибок',
  favorites: 'Избранные вопросы',
  search: 'Поиск по вопросам',
  rules: 'Правила',
  bookmarks: 'Закладки',
  guide: 'Руководство',
  stats: 'Статистика',
  reset: 'Сброс прогресса',
};
