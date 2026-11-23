import { ArrowRight, BookOpen, ChevronRight, Layers3, Search } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CatalogState } from '../components/CatalogState';
import { ResourceImage } from '../components/ResourceImage';
import { useCatalog } from '../hooks/useCatalog';
import { catalogApi } from '../services/catalog';

export function TemplatesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawCategory = searchParams.get('categoria');
  const categoryId = rawCategory && /^[1-9]\d*$/.test(rawCategory) ? Number(rawCategory) : null;
  const invalidCategory = rawCategory !== null && categoryId === null;
  const categories = useCatalog(catalogApi.categorias);
  const loadTemplates = useCallback((signal: AbortSignal) => categoryId ? catalogApi.porCategoria(categoryId, signal) : catalogApi.plantillas(signal), [categoryId]);
  const templates = useCatalog(loadTemplates);
  const [query, setQuery] = useState('');
  const category = categories.data?.categorias.find((item) => item.id === categoryId);
  const filtered = useMemo(() => (templates.data?.plantillas || []).filter((item) => `${item.nombre} ${item.descripcion}`.toLocaleLowerCase('es').includes(query.trim().toLocaleLowerCase('es'))), [templates.data, query]);
  function selectCategory(id: number | null) { setQuery(''); setSearchParams(id ? { categoria: String(id) } : {}); }

  return <>
    <div className="tf-page-heading"><div><p className="tf-eyebrow">IDEAS QUE TOMAN FORMA</p><h1>Biblioteca de plantillas</h1><p>Encuentra una forma práctica de organizar lo que tienes por delante.</p></div><span className="tf-count"><BookOpen size={16} />Recursos de productividad</span></div>
    <div className="tf-catalog-layout">
      <aside className="tf-categories" aria-label="Categorías de plantillas"><div className="tf-category-heading"><Layers3 size={18} /><h2>Categorías</h2></div>
        <CatalogState loading={categories.loading} error={categories.error} retry={categories.retry} label="Cargando categorías…" />
        {!categories.loading && !categories.error && <div className="tf-category-list"><button className={!rawCategory ? 'tf-category-active' : ''} aria-pressed={!rawCategory} onClick={() => selectCategory(null)}><span>Todas las plantillas</span><ChevronRight size={15} /></button>{categories.data?.categorias.map((item) => <button key={item.id} className={categoryId === item.id ? 'tf-category-active' : ''} aria-pressed={categoryId === item.id} onClick={() => selectCategory(item.id)}><ResourceImage src={item.imagen} alt="" className="tf-category-image" /><span>{item.nombre}<small>{item.total_plantillas} plantillas</small></span><ChevronRight size={15} /></button>)}</div>}
        <div className="tf-category-tip"><span>UN BUEN PUNTO DE PARTIDA</span><p>Elige una categoría y encuentra una estructura que se adapte a ti.</p></div>
      </aside>
      <section className="tf-template-results" aria-labelledby="templates-title">
        <div className="tf-section-toolbar"><div><h2 id="templates-title">{category?.nombre || 'Todas las plantillas'}</h2><p>{category?.descripcion || 'Explora recursos para tu vida personal, tu trabajo y tus estudios.'}</p></div><label className="tf-search"><Search size={17} /><span className="sr-only">Buscar plantillas</span><input type="search" placeholder="Buscar una plantilla" value={query} onChange={(event) => setQuery(event.target.value)} /></label></div>
        {invalidCategory ? <div className="tf-state" role="alert"><h2>La categoría no es válida</h2><p>Selecciona una de las categorías disponibles.</p><button className="button button-primary" onClick={() => selectCategory(null)}>Ver todas las plantillas</button></div> : <>
          <CatalogState loading={templates.loading} error={templates.error} retry={templates.retry} label="Cargando plantillas…" />
          {!templates.loading && !templates.error && <><p className="tf-result-count" aria-live="polite">{filtered.length} {filtered.length === 1 ? 'plantilla disponible' : 'plantillas disponibles'}</p>{filtered.length ? <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 2xl:grid-cols-3">{filtered.map((item) => <article className="tf-template-card" key={item.id}><Link to={`/plantillas/${item.id}`} className="tf-template-visual" aria-label={`Ver ${item.nombre}`}><ResourceImage src={item.imagen} alt={`Vista de la plantilla ${item.nombre}`} className="tf-template-image" /><span className="tf-difficulty">{item.dificultad}</span></Link><div className="tf-template-copy"><span className="tf-template-category">{item.categoria_nombre}</span><h3><Link to={`/plantillas/${item.id}`}>{item.nombre}</Link></h3><p>{item.descripcion}</p><Link className="tf-detail-link" to={`/plantillas/${item.id}`}>Ver plantilla<ArrowRight size={16} /></Link></div></article>)}</div> : <div className="tf-state"><BookOpen size={30} /><h3>No hay plantillas para mostrar</h3><p>{query ? 'Prueba otra búsqueda dentro de esta categoría.' : 'Elige otra categoría para seguir explorando.'}</p>{query && <button className="button button-quiet" onClick={() => setQuery('')}>Limpiar búsqueda</button>}</div>}</>}
        </>}
      </section>
    </div>
  </>;
}
