import { useEffect, useState } from 'react';

export function useCatalog<T>(load: (signal: AbortSignal) => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const abort = new AbortController();
    const timeout = window.setTimeout(() => abort.abort(new DOMException('El servidor está tardando demasiado. Vuelve a intentarlo.', 'TimeoutError')), 15000);
    let active = true;
    setLoading(true);
    setError(null);
    setData(null);
    void load(abort.signal).then((response) => {
      if (active) setData(response);
    }).catch((reason: unknown) => {
      if (active) setError(reason instanceof Error ? reason : new Error('No podemos conectar con el servidor.'));
    }).finally(() => {
      window.clearTimeout(timeout);
      if (active) setLoading(false);
    });
    return () => { active = false; window.clearTimeout(timeout); abort.abort(); };
  }, [load, attempt]);

  return { data, loading, error, retry: () => setAttempt((value) => value + 1) };
}
