import { Search, X } from 'lucide-react';
import type { ReactNode } from 'react';

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  label: string;
}

export function SearchBar({ value, onChange, placeholder, label }: Props) {
  return (
    <div className="relative">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted"
        aria-hidden="true"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={label}
        className="tap w-full rounded-xl border border-line bg-surface py-2.5 pl-10 pr-10 text-ink placeholder:text-muted focus:border-accent"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Очистить поиск"
          className="tap absolute right-1 top-1/2 -translate-y-1/2 rounded-lg p-2 text-muted hover:bg-surface2"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

// Подсветка совпадения в тексте.
export function Highlight({ text, query }: { text: string; query: string }): ReactNode {
  const q = query.trim();
  if (!q) return text;
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx < 0) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded bg-warn/30 px-0.5 text-ink">{text.slice(idx, idx + q.length)}</mark>
      {text.slice(idx + q.length)}
    </>
  );
}
