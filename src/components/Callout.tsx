import { Sparkles, RefreshCw, ShieldCheck, AlertTriangle, Lightbulb } from 'lucide-react';
import type { ReactNode } from 'react';
import { cx } from '../ui/util';

export type CalloutKind = 'new2026' | 'changed2026' | 'kept' | 'warning' | 'trap';

const META: Record<
  CalloutKind,
  { label: string; cls: string; Icon: typeof Sparkles }
> = {
  new2026: { label: 'НОВОЕ 2026', cls: 'border-accent/60 bg-accent/10 text-ink', Icon: Sparkles },
  changed2026: { label: 'ИЗМЕНЕНИЕ 2026', cls: 'border-warn/60 bg-warn/10 text-ink', Icon: RefreshCw },
  kept: { label: 'БЕЗ ИЗМЕНЕНИЙ', cls: 'border-line bg-surface2 text-muted', Icon: ShieldCheck },
  warning: { label: 'ВАЖНО', cls: 'border-warn/70 bg-warn/10 text-ink', Icon: AlertTriangle },
  trap: { label: 'ЛОВУШКА', cls: 'border-warn bg-warn/15 text-ink', Icon: AlertTriangle },
};

export function Callout({ kind, children }: { kind: CalloutKind; children: ReactNode }) {
  const { label, cls, Icon } = META[kind];
  return (
    <div className={cx('rounded-xl border-2 p-3 flex gap-3', cls)} role="note">
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-warn" aria-hidden="true" />
      <div className="min-w-0">
        <div className="text-xs font-bold uppercase tracking-wide text-warn">{label}</div>
        <div className="mt-0.5 text-[0.95em] leading-snug">{children}</div>
      </div>
    </div>
  );
}

export function Mnemonic({ children }: { children: ReactNode }) {
  return (
    <div className="flex gap-3 rounded-xl border border-accent/40 bg-accent/5 p-3" role="note">
      <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-accent-hover" aria-hidden="true" />
      <div className="min-w-0">
        <div className="text-xs font-bold uppercase tracking-wide text-accent-hover">Мнемоника</div>
        <div className="mt-0.5 leading-snug">{children}</div>
      </div>
    </div>
  );
}
