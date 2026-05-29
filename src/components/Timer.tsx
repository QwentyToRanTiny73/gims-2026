import { useEffect, useRef, useState } from 'react';
import { Clock } from 'lucide-react';
import { formatClock, cx } from '../ui/util';

interface Props {
  seconds: number; // стартовая длительность
  onExpire: () => void;
  running: boolean;
}

/** Обратный отсчёт. Сообщает об истечении один раз. */
export function Timer({ seconds, onExpire, running }: Props) {
  const [left, setLeft] = useState(seconds);
  const expired = useRef(false);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    if (!running) return;
    const started = Date.now();
    const startLeft = left;
    const id = window.setInterval(() => {
      const elapsed = (Date.now() - started) / 1000;
      const next = Math.max(0, startLeft - elapsed);
      setLeft(next);
      if (next <= 0 && !expired.current) {
        expired.current = true;
        window.clearInterval(id);
        onExpireRef.current();
      }
    }, 250);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const danger = left <= 60;
  return (
    <div
      className={cx(
        'inline-flex items-center gap-2 rounded-xl px-3 py-1.5 font-mono text-lg tabular-nums',
        danger ? 'bg-danger/15 text-danger' : 'bg-surface2 text-ink'
      )}
      role="timer"
      aria-live={danger ? 'assertive' : 'off'}
      aria-label={`Осталось времени ${formatClock(left)}`}
    >
      <Clock className="h-5 w-5" aria-hidden="true" />
      {formatClock(left)}
    </div>
  );
}
