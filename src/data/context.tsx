import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { loadData } from './index';
import type { AppData } from './index';

const Ctx = createContext<AppData | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData().then(setData).catch((e: unknown) => setError(String(e)));
  }, []);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-center">
        <div className="card max-w-md">
          <h1 className="text-lg font-semibold text-danger">Ошибка загрузки данных</h1>
          <p className="mt-2 text-muted">{error}</p>
          <p className="mt-2 text-sm text-muted">
            Проверьте, что файлы <code>public/data/*.json</code> собраны командой <code>npm run data</code>.
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-muted">Загрузка данных…</div>
      </div>
    );
  }

  return <Ctx.Provider value={data}>{children}</Ctx.Provider>;
}

export function useAppData(): AppData {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAppData must be used within DataProvider');
  return ctx;
}
