import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, Layers3 } from 'lucide-react';
import { useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CatalogState } from '../components/CatalogState';
import { ResourceImage } from '../components/ResourceImage';
import { useCatalog } from '../hooks/useCatalog';
import { catalogApi } from '../services/catalog';

export function TemplateDetailPage() {
  const { id } = useParams();
  const load = useCallback((signal: AbortSignal) => catalogApi.detalle(id || '', signal), [id]);
  const { data, loading, error, retry } = useCatalog(load);
  const template = data?.plantilla;

  return <>
    <Link className="tf-back-link" to={template ? `/plantillas?categoria=${template.categoria_id}` : '/plantillas'}><ArrowLeft size={17} />Volver a las plantillas</Link>
    <CatalogState loading={loading} error={error} retry={retry} label="Cargando el detalle de la plantilla…" />
    {template && <article className="tf-detail"><div className="tf-detail-preview"><ResourceImage src={template.imagen} alt={`Vista completa de ${template.nombre}`} className="tf-detail-image" /></div><div className="tf-detail-copy"><span className="tf-role"><Layers3 size={13} />{template.categoria_nombre}</span><h1>{template.nombre}</h1><p>{template.descripcion}</p><dl className="tf-detail-meta"><div><dt><BookOpen size={16} />Dificultad</dt><dd>{template.dificultad}</dd></div><div><dt><CheckCircle2 size={16} />Estado</dt><dd>{template.estado}</dd></div></dl><div className="tf-detail-next"><h2>De la idea a tu siguiente tarea</h2><p>Usa esta estructura como referencia para definir tus actividades y prioridades en tu espacio personal.</p><Link className="button button-primary" to="/dashboard">Ir a mis tareas<ArrowRight size={16} /></Link></div><Link className="tf-detail-link" to={`/plantillas?categoria=${template.categoria_id}`}>Más de esta categoría<ArrowRight size={16} /></Link></div></article>}
  </>;
}
