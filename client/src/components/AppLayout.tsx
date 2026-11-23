import { ArrowUpRight, ChevronRight, UserRound } from 'lucide-react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SiteSidebar } from './SiteSidebar';

export function AppLayout() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const section = pathname === '/equipo' ? 'Nuestro equipo' : pathname.startsWith('/plantillas') ? 'Biblioteca de plantillas' : 'Página no encontrada';
  return <div className="tf-app"><a href="#page-content" className="skip-link">Ir al contenido</a><SiteSidebar /><div className="tf-main"><header className="tf-topbar"><div className="tf-breadcrumb"><Link to="/">TaskFlow</Link><ChevronRight size={14} /><span>{section}</span></div><div className="tf-topbar-actions">{user ? <Link className="tf-account" to="/dashboard"><span className="tf-profile-avatar"><UserRound size={17} /></span><span>{user.name}</span></Link> : <><Link className="tf-login-link" to="/login">Iniciar sesión</Link><Link className="button button-primary" to="/register">Crear cuenta<ArrowUpRight size={15} /></Link></>}</div></header><main className="tf-content" id="page-content"><Outlet /></main><footer className="tf-footer"><span>© {new Date().getFullYear()} TaskFlow</span><span>Organiza tu día. Avanza a tu ritmo.</span></footer></div></div>;
}
