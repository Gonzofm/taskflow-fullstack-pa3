import { Search, UsersRound } from 'lucide-react';
import { useMemo, useState } from 'react';
import { CatalogState } from '../components/CatalogState';
import { ResourceImage } from '../components/ResourceImage';
import { useCatalog } from '../hooks/useCatalog';
import { catalogApi } from '../services/catalog';

export function TeamPage() {
  const { data, loading, error, retry } = useCatalog(catalogApi.integrantes);
  const [query, setQuery] = useState('');
  const members = useMemo(() => {
    const search = query.trim().toLocaleLowerCase('es');
    return (data?.integrantes || []).filter((member) => `${member.nombre} ${member.cargo} ${member.especialidad}`.toLocaleLowerCase('es').includes(search));
  }, [data, query]);

  return <>
    <div className="tf-page-heading">
      <div><p className="tf-eyebrow">PERSONAS QUE SUMAN</p><h1>Nuestro equipo</h1><p>Distintas habilidades, una misma idea. Hacer que cada día cuente.</p></div>
      <span className="tf-count"><UsersRound size={16} />{data ? `${data.integrantes.length} integrantes` : 'Equipo TaskFlow'}</span>
    </div>
    <section className="tf-section" aria-labelledby="team-title">
      <div className="tf-section-toolbar"><div><h2 id="team-title">Conoce a las personas</h2><p>Perfiles de demostración del equipo de productividad.</p></div><label className="tf-search"><Search size={17} /><span className="sr-only">Buscar integrantes</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar nombre o especialidad" /></label></div>
      <CatalogState loading={loading} error={error} retry={retry} label="Cargando integrantes…" />
      {!loading && !error && (members.length ? <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">{members.map((member) => <article className="tf-member" key={member.id}>
        <div className="tf-member-photo"><ResourceImage src={member.imagen} alt={`Retrato de ${member.nombre}`} className="tf-avatar-photo" /><span className="tf-member-indicator" aria-hidden="true" /></div>
        <div className="tf-member-info"><span className="tf-role">{member.cargo}</span><h3>{member.nombre}</h3><p>{member.descripcion}</p><div className="tf-specialty"><span>Especialidad</span><strong>{member.especialidad}</strong></div></div>
      </article>)}</div> : <div className="tf-state"><UsersRound size={30} /><h3>No encontramos integrantes</h3><p>{query ? 'Prueba con otro nombre o especialidad.' : 'Todavía no hay perfiles disponibles.'}</p>{query && <button className="button button-quiet" onClick={() => setQuery('')}>Limpiar búsqueda</button>}</div>)}
    </section>
  </>;
}
