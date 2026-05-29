import { useEffect, useRef } from 'react';
import { X, Anchor } from 'lucide-react';
import { NAV } from '../nav';
import { navigate } from '../router';
import type { ScreenId } from '../router';
import { cx } from '../ui/util';
import { APP_TITLE } from '../config';

interface Props {
  open: boolean;
  current: ScreenId;
  onClose: () => void;
}

export function Sidebar({ open, current, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Esc закрывает; при открытии фокус на крестик
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const go = (screen: ScreenId) => {
    navigate(screen);
    onClose();
  };

  return (
    <>
      {/* Оверлей */}
      <div
        className={cx(
          'fixed inset-0 z-40 bg-black/60 transition-opacity',
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Панель */}
      <nav
        ref={panelRef}
        aria-label="Главное меню"
        aria-hidden={!open}
        className={cx(
          'fixed inset-y-0 left-0 z-50 flex w-[84%] max-w-[320px] flex-col bg-surface shadow-2xl transition-transform',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <div className="flex items-center gap-2">
            <Anchor className="h-6 w-6 text-accent" aria-hidden="true" />
            <span className="text-lg font-bold">{APP_TITLE}</span>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="tap rounded-lg p-2 hover:bg-surface2"
            aria-label="Закрыть меню"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-3">
          {NAV.map((group) => (
            <div key={group.title} className="mb-4">
              <div className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-muted">
                {group.title}
              </div>
              <ul>
                {group.items.map((item) => {
                  const active = item.screen === current;
                  const Icon = item.icon;
                  return (
                    <li key={item.screen}>
                      <button
                        type="button"
                        onClick={() => go(item.screen)}
                        aria-current={active ? 'page' : undefined}
                        className={cx(
                          'tap flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
                          active ? 'bg-accent/20 text-ink' : 'text-ink hover:bg-surface2'
                        )}
                      >
                        <Icon
                          className={cx('h-5 w-5 shrink-0', active ? 'text-accent-hover' : 'text-muted')}
                          aria-hidden="true"
                        />
                        <span>{item.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-line px-4 py-2 text-xs text-muted">
          Правила 2026 · Приказ МЧС № 636
        </div>
      </nav>
    </>
  );
}
