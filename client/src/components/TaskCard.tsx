import { Check, CheckCheck, Flag, Pencil, Trash2 } from 'lucide-react';
import type { Task } from '../types';

export function TaskCard({ task, busy, onToggle, onEdit, onDelete }: {
  task: Task; busy: boolean; onToggle: () => void; onEdit: () => void; onDelete: () => void;
}) {
  const completed = task.status === 'completed';
  const date = new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'short' }).format(new Date(task.createdAt));
  return <article className={`task-card ${completed ? 'task-completed' : ''}`}>
    <div className="task-card-top"><span className={`priority-badge priority-${task.priority}`}><Flag size={11} fill="currentColor" />{({ low: 'Baja', medium: 'Media', high: 'Alta' })[task.priority]}</span><div className="task-actions"><button className="icon-button" onClick={onEdit} disabled={busy} aria-label={`Editar ${task.title}`} title="Editar tarea"><Pencil size={15} /></button><button className="icon-button danger-hover" onClick={onDelete} disabled={busy} aria-label={`Eliminar ${task.title}`} title="Eliminar tarea"><Trash2 size={15} /></button></div></div>
    <div className="task-title-row"><button type="button" className={`task-checkbox ${completed ? 'is-checked' : ''}`} onClick={onToggle} disabled={busy} aria-label={completed ? `Marcar pendiente: ${task.title}` : `Completar: ${task.title}`} aria-pressed={completed}>{completed && <Check size={14} strokeWidth={3} />}{busy && <span className="mini-spinner" />}</button><h3>{task.title}</h3></div>
    <p className={`task-description ${!task.description ? 'no-description' : ''}`}>{task.description || 'Sin descripción. Todo empieza con un primer paso.'}</p>
    <footer className="task-card-footer"><span className={`task-status ${completed ? 'status-completed' : ''}`}>{completed ? <CheckCheck size={13} /> : <span className="status-dot" />}{completed ? 'Completada' : 'Pendiente'}</span><time dateTime={task.createdAt} title={new Date(task.createdAt).toLocaleString('es-PE')}>{date}</time></footer>
  </article>;
}
