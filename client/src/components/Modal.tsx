import { X } from 'lucide-react';
import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

export function Modal({ title, subtitle, children, onClose, busy = false, className = '' }: {
  title: string; subtitle?: string; children: ReactNode; onClose: () => void; busy?: boolean; className?: string;
}) {
  const titleId = useId();
  const panel = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  const busyRef = useRef(busy);
  closeRef.current = onClose;
  busyRef.current = busy;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const bodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const getFocusable = () => Array.from(panel.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), textarea:not(:disabled), select:not(:disabled), [tabindex="0"]') || []);
    (getFocusable().find((element) => element.tagName === 'INPUT') || getFocusable()[0] || panel.current)?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !busyRef.current) closeRef.current();
      if (event.key !== 'Tab') return;
      const elements = getFocusable();
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (!first) { event.preventDefault(); return; }
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => { document.removeEventListener('keydown', onKeyDown); document.body.style.overflow = bodyOverflow; previous?.focus(); };
  }, []);
  return createPortal(<div className="modal-backdrop" onClick={(event) => { if (event.target === event.currentTarget && !busy) onClose(); }}>
    <div className={`modal ${className}`} role="dialog" aria-modal="true" aria-labelledby={titleId} ref={panel} tabIndex={-1}>
      <header className="modal-header"><div><h2 id={titleId}>{title}</h2>{subtitle && <p>{subtitle}</p>}</div><button type="button" className="icon-button" onClick={onClose} disabled={busy} aria-label="Cerrar ventana"><X size={20} /></button></header>
      {children}
    </div>
  </div>, document.body);
}
