import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Modal } from './Modal';
import { Spinner } from './Spinner';
import { errorMessage } from '../services/api';
import type { Task } from '../types';

export function DeleteTaskModal({ task, onClose, onDelete }: { task: Task; onClose: () => void; onDelete: () => Promise<void> }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  async function confirm() {
    setDeleting(true);
    setError('');
    try { await onDelete(); onClose(); }
    catch (err) { setError(errorMessage(err)); }
    finally { setDeleting(false); }
  }
  return <Modal title="¿Eliminar esta tarea?" onClose={onClose} busy={deleting} className="delete-modal"><div className="delete-content"><div className="delete-icon"><Trash2 size={24} /></div><p>Se eliminará <strong>“{task.title}”</strong> de tu espacio. Esta acción no se puede deshacer.</p>{error && <div className="form-alert" role="alert">{error}</div>}</div><footer className="modal-actions"><button className="button button-quiet" onClick={onClose} disabled={deleting}>Conservar tarea</button><button className="button button-danger" onClick={() => void confirm()} disabled={deleting}>{deleting ? <Spinner label="Eliminando…" /> : <><Trash2 size={16} />Eliminar tarea</>}</button></footer></Modal>;
}
