import { CheckCircle2, CircleAlert, X } from 'lucide-react';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

type Toast = { id: number; text: string; kind: 'success' | 'error' };
const ToastContext = createContext<((text: string, kind?: Toast['kind']) => void) | undefined>(undefined);

function ToastItem({ toast, remove }: { toast: Toast; remove: (id: number) => void }) {
  useEffect(() => { const timer = window.setTimeout(() => remove(toast.id), 5500); return () => window.clearTimeout(timer); }, [toast.id, remove]);
  return <div className={`toast toast-${toast.kind}`} role={toast.kind === 'error' ? 'alert' : 'status'}>
    {toast.kind === 'success' ? <CheckCircle2 size={20} /> : <CircleAlert size={20} />}
    <span>{toast.text}</span><button className="icon-button" onClick={() => remove(toast.id)} aria-label="Cerrar notificación"><X size={16} /></button>
  </div>;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const notify = useCallback((text: string, kind: Toast['kind'] = 'success') => {
    setToasts((current) => [...current.slice(-3), { id: Date.now() + Math.random(), text, kind }]);
  }, []);
  const remove = useCallback((id: number) => setToasts((current) => current.filter((toast) => toast.id !== id)), []);
  return <ToastContext.Provider value={notify}>{children}<div className="toast-container">{toasts.map((toast) => <ToastItem key={toast.id} toast={toast} remove={remove} />)}</div></ToastContext.Provider>;
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast necesita ToastProvider.');
  return context;
}
