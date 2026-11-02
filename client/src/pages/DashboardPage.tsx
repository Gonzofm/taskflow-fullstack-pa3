import { ArrowDownUp, ArrowRight, Check, CheckCheck, ChevronRight, Circle, CircleCheck, CircleDashed, ClipboardList, LayoutGrid, LockKeyhole, LogOut, Plus, Search, ShieldCheck, SlidersHorizontal, Sparkles, X } from 'lucide-react';
import { useMemo, useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brand } from '../components/Brand';
import { DeleteTaskModal } from '../components/DeleteTaskModal';
import { Spinner } from '../components/Spinner';
import { TaskCard } from '../components/TaskCard';
import { TaskForm } from '../components/TaskForm';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTasks } from '../hooks/useTasks';
import { errorMessage } from '../services/api';
import type { Priority, Task, TaskFilter, TaskInput } from '../types';

const filterLabels = { all: 'Todas las tareas', pending: 'Pendientes', completed: 'Completadas' };

export function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const notify = useToast();
  const { tasks, loading, error, reload, create, update, remove } = useTasks();
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [query, setQuery] = useState('');
  const [priority, setPriority] = useState<Priority | 'all'>('all');
  const [sort, setSort] = useState('newest');
  const [taskForm, setTaskForm] = useState<Task | 'new' | null>(null);
  const [deleteTask, setDeleteTask] = useState<Task | null>(null);
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());
  const completed = tasks.filter((task) => task.status === 'completed').length;
  const pending = tasks.length - completed;
  const progress = tasks.length ? Math.round(completed / tasks.length * 100) : 0;
  const counts = { all: tasks.length, pending, completed };
  const today = new Intl.DateTimeFormat('es-PE', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());

  const filtered = useMemo(() => {
    const search = query.trim().toLocaleLowerCase('es');
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return tasks.filter((task) => (filter === 'all' || task.status === filter) && (priority === 'all' || task.priority === priority) && (!search || `${task.title} ${task.description}`.toLocaleLowerCase('es').includes(search))).sort((a, b) => {
      if (sort === 'oldest') return Date.parse(a.createdAt) - Date.parse(b.createdAt);
      if (sort === 'priority') return priorityOrder[a.priority] - priorityOrder[b.priority] || Date.parse(b.createdAt) - Date.parse(a.createdAt);
      if (sort === 'title') return a.title.localeCompare(b.title, 'es');
      return Date.parse(b.createdAt) - Date.parse(a.createdAt);
    });
  }, [tasks, filter, query, priority, sort]);

  function clearFilters() { setFilter('all'); setQuery(''); setPriority('all'); }
  function signOut() { logout(); notify('Sesión cerrada. ¡Hasta pronto!'); navigate('/login', { replace: true }); }
  async function saveTask(input: TaskInput) {
    if (taskForm && taskForm !== 'new') { await update(taskForm.id, input); notify('Cambios guardados. Todo en orden.'); }
    else { await create(input); clearFilters(); notify('Tarea creada. ¡Ya tienes tu siguiente paso!'); }
  }
  async function toggleTask(task: Task) {
    setBusyIds((current) => new Set(current).add(task.id));
    try {
      await update(task.id, { status: task.status === 'completed' ? 'pending' : 'completed' });
      notify(task.status === 'completed' ? 'La tarea vuelve a tus pendientes.' : '¡Un paso más! Tarea completada.');
    } catch (err) { notify(errorMessage(err), 'error'); }
    finally { setBusyIds((current) => { const next = new Set(current); next.delete(task.id); return next; }); }
  }

  return <div className="dashboard-layout">
    <a href="#main-content" className="skip-link">Ir a mis tareas</a>
    <aside className="sidebar">
      <div className="sidebar-top"><Brand /><span className="workspace-label"><span className="workspace-avatar">P</span> Espacio personal <span className="workspace-tag">TÚ</span></span></div>
      <div className="sidebar-navigation"><span className="nav-caption">MI ORGANIZACIÓN</span><nav aria-label="Navegación de tareas">{(['all', 'pending', 'completed'] as const).map((value) => <button key={value} className={`nav-item ${filter === value ? 'active' : ''}`} onClick={() => setFilter(value)} aria-current={filter === value ? 'page' : undefined}>{value === 'all' ? <LayoutGrid size={18} /> : value === 'pending' ? <CircleDashed size={18} /> : <CircleCheck size={18} />}<span>{value === 'all' ? <><span className="nav-desktop-label">Todas las tareas</span><span className="nav-mobile-label">Todas</span></> : filterLabels[value]}</span><span className="nav-count">{counts[value]}</span></button>)}</nav></div>
      <div className="sidebar-bottom"><div className="focus-note"><span className="note-spark"><Sparkles size={19} /></span><h3>Cada paso cuenta.</h3><p>No tienes que hacerlo todo hoy. Solo empieza por algo.</p><span className="note-line" /></div><div className="private-note"><ShieldCheck size={15} /><span>Solo tú puedes ver tus tareas</span></div><div className="sidebar-profile"><span className="avatar">{user?.name.charAt(0).toLocaleUpperCase('es')}</span><div><strong>{user?.name}</strong><span title={user?.email}>{user?.email}</span></div><button className="icon-button" onClick={signOut} aria-label="Cerrar sesión" title="Cerrar sesión"><LogOut size={17} /></button></div></div>
      <button className="mobile-logout icon-button" onClick={signOut} aria-label="Cerrar sesión"><LogOut size={18} /></button>
    </aside>
    <div className="workspace-main">
      <header className="workspace-topbar"><div className="breadcrumb">Espacio personal<ChevronRight size={14} /><strong>Mis tareas</strong></div><div className="topbar-right"><span className="topbar-date">{today}</span><span className="topbar-divider" /><span className="private-badge"><LockKeyhole size={12} />Privado</span></div></header>
      <main className="dashboard-content" id="main-content">
        <section className="page-heading"><div><span className="eyebrow greeting"><span className="tiny-dot" /> HOLA, {user?.name.split(' ')[0].toLocaleUpperCase('es')} <span aria-hidden="true">✳</span></span><h1>Mi espacio de trabajo<span className="accent-text">.</span></h1><p>Un poco de orden para enfocarte en lo que de verdad importa.</p></div><button className="button button-primary new-task-button" onClick={() => setTaskForm('new')}><Plus size={18} />Nueva tarea</button></section>
        <section className="overview-grid" aria-label="Resumen de tus tareas"><div className="stat-card"><div className="stat-label"><span>Total de tareas</span><span className="stat-icon icon-purple"><ClipboardList size={18} /></span></div><div className="stat-number">{loading ? '—' : tasks.length}<span>en tu espacio</span></div><span className="stat-footnote">Todo empieza con una idea.</span></div><div className="stat-card"><div className="stat-label"><span>Pendientes</span><span className="stat-icon icon-orange"><CircleDashed size={18} /></span></div><div className="stat-number">{loading ? '—' : pending}<span>por hacer</span></div><span className="stat-footnote">Tu siguiente paso está aquí.</span></div><div className="stat-card"><div className="stat-label"><span>Completadas</span><span className="stat-icon icon-green"><CheckCheck size={18} /></span></div><div className="stat-number">{loading ? '—' : completed}<span>pequeñas victorias</span></div><span className="stat-footnote">Cada avance merece su check.</span></div><div className="progress-card"><div className="progress-copy"><span className="progress-label">TU PROGRESO</span><strong>{progress === 100 ? '¡Lo lograste!' : 'A tu ritmo.'}</strong><span>{completed} de {tasks.length} tareas listas</span></div><div className="progress-ring" style={{ '--progress': `${progress}%` } as CSSProperties}><span>{progress}<small>%</small></span></div></div></section>
        <section className="tasks-section" aria-labelledby="tasks-heading"><div className="section-heading"><div><span className="section-eyebrow">DE LA IDEA A LA ACCIÓN</span><h2 id="tasks-heading">Mis tareas <span>{loading ? '·' : tasks.length}</span></h2></div><div className="section-note"><span className="tiny-dot" /> Un paso a la vez</div></div>
          <div className="tasks-toolbar"><div className="filter-tabs" role="group" aria-label="Filtrar por estado">{(['all', 'pending', 'completed'] as const).map((value) => <button key={value} className={filter === value ? 'selected' : ''} onClick={() => setFilter(value)} aria-pressed={filter === value}>{value === 'all' ? 'Todas' : filterLabels[value]}<span>{counts[value]}</span></button>)}</div><div className="search-field"><Search size={16} /><input aria-label="Buscar tareas" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar una tarea…" />{query && <button className="icon-button" onClick={() => setQuery('')} aria-label="Limpiar búsqueda"><X size={14} /></button>}</div></div>
          <div className="task-controls"><span className="results-caption">{loading ? 'Buscando tus tareas…' : `${filtered.length} ${filtered.length === 1 ? 'tarea' : 'tareas'}${filter !== 'all' ? ` ${filter === 'pending' ? (filtered.length === 1 ? 'pendiente' : 'pendientes') : (filtered.length === 1 ? 'completada' : 'completadas')}` : ' en tu lista'}`}</span><div className="select-controls"><label className="compact-select"><SlidersHorizontal size={14} /><span className="sr-only">Filtrar por prioridad</span><select value={priority} onChange={(event) => setPriority(event.target.value as Priority | 'all')} aria-label="Filtrar por prioridad"><option value="all">Todas las prioridades</option><option value="high">Prioridad alta</option><option value="medium">Prioridad media</option><option value="low">Prioridad baja</option></select></label><label className="compact-select"><ArrowDownUp size={14} /><span className="sr-only">Ordenar tareas</span><select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Ordenar tareas"><option value="newest">Más recientes</option><option value="oldest">Más antiguas</option><option value="priority">Por prioridad</option><option value="title">Por título</option></select></label></div></div>
          {error && <div className="load-error" role="alert"><CircleDashed size={22} /><div><strong>No pudimos cargar tus tareas</strong><p>{error}</p></div><button className="button button-quiet" onClick={() => void reload()} disabled={loading}>Reintentar</button></div>}
          {loading ? <div className="task-grid skeleton-grid" aria-label="Cargando tareas" aria-busy="true">{Array.from({ length: 6 }, (_, index) => <div key={index} className="task-skeleton"><span /><strong /><p /><i /></div>)}<span className="sr-only"><Spinner /></span></div> : !error && filtered.length > 0 ? <div className="task-grid">{filtered.map((task) => <TaskCard key={task.id} task={task} busy={busyIds.has(task.id)} onToggle={() => void toggleTask(task)} onEdit={() => setTaskForm(task)} onDelete={() => setDeleteTask(task)} />)}<button className="add-task-card" onClick={() => setTaskForm('new')}><span><Plus size={23} /></span><strong>Un nuevo siguiente paso</strong><small>Añade una tarea a tu día<ArrowRight size={13} /></small></button></div> : !error && <div className="empty-state"><div className="empty-illustration" aria-hidden="true"><span className="empty-spark">✳</span><div className="empty-paper"><span /><span /><div><Circle size={14} /><i /></div><div><Circle size={14} /><i /></div><div className="empty-check"><Check size={20} /></div></div></div><span className="section-eyebrow">{tasks.length ? 'UN POCO DE PERSPECTIVA' : 'TODO ESTÁ POR EMPEZAR'}</span><h3>{tasks.length ? 'No hay tareas por aquí.' : 'Tu próximo paso empieza aquí.'}</h3><p>{tasks.length ? 'Prueba con otra búsqueda o cambia los filtros para encontrar lo que necesitas.' : 'Libera espacio en tu cabeza. Añade tu primera tarea y empieza a avanzar, a tu ritmo.'}</p><button className={`button ${tasks.length ? 'button-quiet' : 'button-primary'}`} onClick={tasks.length ? clearFilters : () => setTaskForm('new')}>{tasks.length ? <><SlidersHorizontal size={16} />Limpiar filtros</> : <><Plus size={17} />Crear mi primera tarea</>}</button></div>}
        </section>
        <footer className="dashboard-footer"><Brand /><span>Menos pendientes en la cabeza. Más espacio para ti.</span><span className="footer-status"><span className="tiny-dot" />Tu espacio personal</span></footer>
      </main>
    </div>
    {taskForm && <TaskForm task={taskForm === 'new' ? undefined : taskForm} onClose={() => setTaskForm(null)} onSave={saveTask} />}
    {deleteTask && <DeleteTaskModal task={deleteTask} onClose={() => setDeleteTask(null)} onDelete={async () => { await remove(deleteTask.id); notify('Tarea eliminada de tu espacio.'); }} />}
  </div>;
}
