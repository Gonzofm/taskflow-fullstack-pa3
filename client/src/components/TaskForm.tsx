import { ArrowRight, Flag } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Modal } from './Modal';
import { Spinner } from './Spinner';
import { ApiError, errorMessage } from '../services/api';
import type { Priority, Task, TaskInput, TaskStatus } from '../types';

export function TaskForm({ task, onClose, onSave }: { task?: Task; onClose: () => void; onSave: (input: TaskInput) => Promise<void> }) {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [priority, setPriority] = useState<Priority>(task?.priority || 'medium');
  const [status, setStatus] = useState<TaskStatus>(task?.status || 'pending');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fields, setFields] = useState<Record<string, string>>({});

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!title.trim()) next.title = 'Dale un título a tu tarea.';
    else if (title.trim().length > 120) next.title = 'Usa como máximo 120 caracteres.';
    if (description.trim().length > 2000) next.description = 'Usa como máximo 2000 caracteres.';
    setFields(next);
    setError('');
    if (Object.keys(next).length) return;
    setSaving(true);
    try { await onSave({ title: title.trim(), description: description.trim(), priority, status }); onClose(); }
    catch (err) {
      setError(errorMessage(err));
      if (err instanceof ApiError && err.errors) setFields(Object.fromEntries(err.errors.map((item) => [item.field, item.message])));
    } finally { setSaving(false); }
  }

  return <Modal title={task ? 'Editar tarea' : 'Una idea, un siguiente paso.'} subtitle={task ? 'Ajusta los detalles y sigue avanzando.' : 'Sácala de tu cabeza. Dale un lugar en tu día.'} onClose={onClose} busy={saving}>
    <form onSubmit={onSubmit} className="task-form" noValidate>
      {error && <div className="form-alert" role="alert">{error}</div>}
      <div className="field"><label htmlFor="task-title">Título <span className="required-marker">*</span></label><input id="task-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="¿Qué quieres hacer?" maxLength={120} required disabled={saving} aria-invalid={Boolean(fields.title)} aria-describedby={fields.title ? 'title-error' : undefined} />{fields.title && <span id="title-error" className="field-error">{fields.title}</span>}</div>
      <div className="field"><label htmlFor="task-description">Descripción <span className="optional-label">opcional</span></label><textarea id="task-description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Añade contexto, ideas o los pasos que te ayudarán…" rows={4} maxLength={2000} disabled={saving} aria-invalid={Boolean(fields.description)} aria-describedby={fields.description ? 'description-error' : undefined} /><div className="field-meta">{fields.description ? <span id="description-error" className="field-error">{fields.description}</span> : <span>Los detalles hacen más fácil empezar.</span>}<span>{description.length}/2000</span></div></div>
      <div className="field"><span className="field-label" id="priority-label">Prioridad</span><div className="priority-picker" role="group" aria-labelledby="priority-label">{([['low', 'Baja'], ['medium', 'Media'], ['high', 'Alta']] as const).map(([value, label]) => <button key={value} className={`priority-option priority-${value} ${priority === value ? 'is-selected' : ''}`} type="button" onClick={() => setPriority(value)} aria-pressed={priority === value} disabled={saving}><Flag size={15} />{label}</button>)}</div></div>
      <div className="field"><label htmlFor="task-status">Estado</label><select id="task-status" value={status} onChange={(event) => setStatus(event.target.value as TaskStatus)} disabled={saving}><option value="pending">Pendiente</option><option value="completed">Completada</option></select></div>
      <footer className="modal-actions"><button type="button" className="button button-quiet" onClick={onClose} disabled={saving}>Cancelar</button><button type="submit" className="button button-primary" disabled={saving}>{saving ? <Spinner label="Guardando…" /> : <>{task ? 'Guardar cambios' : 'Crear tarea'}<ArrowRight size={16} /></>}</button></footer>
    </form>
  </Modal>;
}
