import { useEffect, useRef, useState } from 'react';
import { useStore } from '../store';
import { navigate } from '../router';
import { Trash2, AlertTriangle, X } from 'lucide-react';

export function ResetScreen() {
  const { resetAll } = useStore();
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(false);

  return (
    <div className="space-y-4">
      <section className="card">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <Trash2 className="h-5 w-5 text-danger" aria-hidden="true" /> Сброс прогресса
        </h2>
        <p className="mt-2 text-muted">
          Удаляет весь локальный прогресс: историю экзаменов и билетов, статистику карточек,
          избранное, закладки и позицию марафона. Действие необратимо. Очищаются только данные этого
          приложения в браузере.
        </p>
        <button
          type="button"
          className="btn mt-4 bg-danger/20 text-danger hover:bg-danger/30"
          onClick={() => setConfirming(true)}
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" /> Очистить весь прогресс
        </button>
      </section>

      {done && (
        <div className="card border-ok/60 text-center" role="status" aria-live="polite">
          <p className="text-ok">Прогресс очищен.</p>
          <button type="button" className="btn-ghost mx-auto mt-3" onClick={() => navigate('plan')}>
            На главную
          </button>
        </div>
      )}

      {confirming && (
        <ConfirmModal
          onCancel={() => setConfirming(false)}
          onConfirm={() => {
            resetAll();
            setConfirming(false);
            setDone(true);
          }}
        />
      )}
    </div>
  );
}

function ConfirmModal({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  const confirmRef = useRef<HTMLButtonElement>(null);
  const titleId = 'reset-modal-title';

  useEffect(() => {
    confirmRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4"
      onClick={onCancel}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="card w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-2">
          <h3 id={titleId} className="flex items-center gap-2 text-lg font-bold text-danger">
            <AlertTriangle className="h-5 w-5" aria-hidden="true" /> Удалить весь прогресс?
          </h3>
          <button
            type="button"
            onClick={onCancel}
            className="tap rounded-lg p-2 hover:bg-surface2"
            aria-label="Отмена"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <p className="mt-2 text-muted">Это удалит весь прогресс безвозвратно.</p>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" className="btn-ghost" onClick={onCancel}>
            Отмена
          </button>
          <button
            ref={confirmRef}
            type="button"
            className="btn bg-danger text-white hover:bg-danger/80"
            onClick={onConfirm}
          >
            Удалить
          </button>
        </div>
      </div>
    </div>
  );
}
