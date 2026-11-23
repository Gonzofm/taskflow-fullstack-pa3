import { ArrowLeft, ArrowUpRight, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return <section className="tf-not-found"><span className="tf-not-found-icon"><Compass size={38} strokeWidth={1.5} /></span><p className="tf-error-number">404</p><h1>Esta página se salió del plan.</h1><p>El enlace no existe o la página cambió de lugar.<br />Volvamos a un punto conocido para seguir avanzando.</p><div><Link to="/" className="button button-primary"><ArrowLeft size={17} />Volver al inicio</Link><Link to="/plantillas" className="button button-quiet">Explorar plantillas<ArrowUpRight size={17} /></Link></div></section>;
}
