import { AlertCircle, RefreshCw } from 'lucide-react';
import { Spinner } from './Spinner';

export function CatalogState({ loading, error, retry, label }: { loading: boolean; error: Error | null; retry: () => void; label: string }) {
  if (loading) return <div className="tf-state" role="status"><Spinner label={label} /></div>;
  if (error) return <div className="tf-state tf-state-error" role="alert"><AlertCircle size={30} /><h2>No pudimos cargar la información</h2><p>{error.name === 'TypeError' ? 'No se pudo conectar con la API. Revisa tu conexión y vuelve a intentarlo.' : error.message}</p><button className="button button-primary" onClick={retry}><RefreshCw size={16} />Reintentar</button></div>;
  return null;
}
