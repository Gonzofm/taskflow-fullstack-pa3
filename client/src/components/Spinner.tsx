export function Spinner({ label = 'Cargando…' }: { label?: string }) {
  return <span className="loading-inline" role="status"><span className="spinner" aria-hidden="true" />{label}</span>;
}
