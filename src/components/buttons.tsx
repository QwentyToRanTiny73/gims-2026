import { Star, Bookmark, AlertCircle } from 'lucide-react';
import { cx } from '../ui/util';

export function StarButton({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="tap inline-flex items-center justify-center rounded-lg p-2 hover:bg-surface2"
      aria-pressed={active}
      aria-label={active ? 'Убрать из избранного' : 'Добавить в избранное'}
      title={active ? 'В избранном' : 'В избранное'}
    >
      <Star className={cx('h-5 w-5', active ? 'fill-warn text-warn' : 'text-muted')} aria-hidden="true" />
    </button>
  );
}

export function BookmarkButton({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="tap inline-flex items-center justify-center rounded-lg p-2 hover:bg-surface2"
      aria-pressed={active}
      aria-label={active ? 'Убрать из закладок' : 'Добавить в закладки'}
      title={active ? 'В закладках' : 'В закладки'}
    >
      <Bookmark className={cx('h-5 w-5', active ? 'fill-accent text-accent' : 'text-muted')} aria-hidden="true" />
    </button>
  );
}

export function ReviewBadge() {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-md border border-warn/60 bg-warn/10 px-2 py-0.5 text-xs font-medium text-warn"
      title="Данные в источнике неполные/обрезаны — требуется проверка"
    >
      <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" /> требует проверки
    </span>
  );
}
