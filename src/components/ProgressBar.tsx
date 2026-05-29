import { cx } from '../ui/util';

interface Props {
  value: number; // 0..total
  total: number;
  label?: string;
  className?: string;
  tone?: 'accent' | 'ok' | 'warn';
}

export function ProgressBar({ value, total, label, className, tone = 'accent' }: Props) {
  const ratio = total > 0 ? Math.min(1, value / total) : 0;
  const toneClass = tone === 'ok' ? 'bg-ok' : tone === 'warn' ? 'bg-warn' : 'bg-accent';
  return (
    <div className={cx('w-full', className)}>
      {label && <div className="mb-1 flex justify-between text-sm text-muted">{label}</div>}
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-surface2"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={total}
      >
        <div className={cx('h-full rounded-full transition-all', toneClass)} style={{ width: `${ratio * 100}%` }} />
      </div>
    </div>
  );
}
