import { ArrowUpRight, BookOpen, LayoutDashboard, LogOut, Menu, UsersRound, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Brand } from './Brand';

export function SiteSidebar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) { if (event.key === 'Escape') setOpen(false); }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);
  function close() { setOpen(false); }
  function signOut() { logout(); close(); navigate('/equipo'); }

  return <>
    <div className="tf-mobile-bar"><Link to="/" aria-label="TaskFlow, inicio" onClick={close}><Brand /></Link><button className="tf-menu-toggle" onClick={() => setOpen((value) => !value)} aria-label={open ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={open} aria-controls="site-navigation">{open ? <X size={22} /> : <Menu size={22} />}</button></div>
    {open && <button className="tf-nav-backdrop" onClick={close} aria-label="Cerrar navegación" />}
    <aside className={`tf-sidebar ${open ? 'tf-sidebar-open' : ''}`} id="site-navigation">
      <Link className="tf-sidebar-brand" to="/" aria-label="TaskFlow, inicio" onClick={close}><Brand light /></Link>
      <div className="tf-workspace"><span className="tf-workspace-avatar">T</span><div><strong>TaskFlow</strong><span>Tu espacio de productividad</span></div></div>
      <p className="tf-nav-label">ESPACIO DE TRABAJO</p>
      <nav aria-label="Navegación principal">
        <NavLink to="/dashboard" className={({ isActive }) => `tf-nav-link ${isActive ? 'tf-nav-active' : ''}`} onClick={close}><LayoutDashboard size={19} />Mis tareas</NavLink>
        <NavLink to="/equipo" className={({ isActive }) => `tf-nav-link ${isActive ? 'tf-nav-active' : ''}`} onClick={close}><UsersRound size={19} />Nuestro equipo</NavLink>
        <NavLink to="/plantillas" className={({ isActive }) => `tf-nav-link ${isActive ? 'tf-nav-active' : ''}`} onClick={close}><BookOpen size={19} />Plantillas</NavLink>
      </nav>
      <div className="tf-sidebar-bottom"><div className="tf-sidebar-note"><span className="tf-note-icon"><ArrowUpRight size={24} /></span><h2>Un poco de orden.<br />Más espacio para ti.</h2><p>Personas y recursos para dar forma a tu próximo objetivo.</p><Link to="/plantillas" onClick={close}>Explorar plantillas <ArrowUpRight size={15} /></Link></div>
        <div className="tf-profile"><span className="tf-profile-avatar">{user ? user.name.charAt(0).toUpperCase() : 'T'}</span><div><strong>{user?.name || 'Bienvenido a TaskFlow'}</strong><span>{user ? 'Espacio personal' : 'Organiza tu siguiente paso'}</span></div>{user ? <button onClick={signOut} aria-label="Cerrar sesión" title="Cerrar sesión"><LogOut size={19} /></button> : <Link to="/login" onClick={close} aria-label="Iniciar sesión"><ArrowUpRight size={19} /></Link>}</div>
      </div>
    </aside>
  </>;
}
