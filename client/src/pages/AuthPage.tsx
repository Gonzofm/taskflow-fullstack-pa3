import { ArrowRight, Check, Eye, EyeOff, LockKeyhole, Mail, Sparkles, UserRound } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Brand } from '../components/Brand';
import { Spinner } from '../components/Spinner';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ApiError, errorMessage } from '../services/api';

export function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  const isRegister = mode === 'register';
  const { user, loading: checking, login, register, authError } = useAuth();
  const navigate = useNavigate();
  const notify = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fields, setFields] = useState<Record<string, string>>({});

  if (checking) return <div className="page-loader"><Spinner label="Preparando tu espacio…" /></div>;
  if (user) return <Navigate to="/dashboard" replace />;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (isRegister && name.trim().length < 2) next.name = 'Escribe tu nombre (al menos 2 caracteres).';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = 'Escribe un correo electrónico válido.';
    if (password.length < 8) next.password = 'Tu contraseña debe tener al menos 8 caracteres.';
    else if (new TextEncoder().encode(password).length > 72) next.password = 'Tu contraseña supera el límite de 72 bytes. Usa una más corta.';
    setFields(next);
    setError('');
    if (Object.keys(next).length) return;
    setSubmitting(true);
    try {
      if (isRegister) await register(name.trim(), email.trim().toLowerCase(), password);
      else await login(email.trim().toLowerCase(), password);
      notify(isRegister ? '¡Tu cuenta está lista! Este es tu espacio.' : '¡Qué bueno verte de nuevo!');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(errorMessage(err));
      if (err instanceof ApiError && err.errors) setFields(Object.fromEntries(err.errors.map((item) => [item.field, item.message])));
    } finally { setSubmitting(false); }
  }

  return <main className="auth-layout">
    <section className="auth-form-side">
      <div className="auth-brand"><Brand /><span className="auth-small-label">TU ESPACIO PERSONAL</span></div>
      <div className="auth-form-wrap">
        <span className="eyebrow"><span className="tiny-dot" /> UN DÍA, UN PASO A LA VEZ</span>
        <h1>{isRegister ? <>Las grandes cosas<br />empiezan aquí<span className="accent-text">.</span></> : <>Vuelve a lo<br />que importa<span className="accent-text">.</span></>}</h1>
        <p className="auth-description">{isRegister ? 'Crea tu cuenta y dale a tus ideas un lugar para crecer.' : 'Tu día tiene potencial. Vamos a darle un poco de orden.'}</p>
        <div className="auth-tab-switch"><Link to="/login" className={!isRegister ? 'selected' : ''}>Iniciar sesión</Link><Link to="/register" className={isRegister ? 'selected' : ''}>Crear una cuenta</Link></div>
        {(error || authError) && <div className="form-alert" role="alert">{error || authError}</div>}
        <form onSubmit={onSubmit} noValidate className="auth-form">
          {isRegister && <div className="field"><label htmlFor="name">Tu nombre</label><div className={`input-icon ${fields.name ? 'has-error' : ''}`}><UserRound size={18} /><input id="name" name="name" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" maxLength={80} placeholder="¿Cómo te llamas?" aria-invalid={Boolean(fields.name)} aria-describedby={fields.name ? 'name-error' : undefined} required disabled={submitting} /></div>{fields.name && <span id="name-error" className="field-error">{fields.name}</span>}</div>}
          <div className="field"><label htmlFor="email">Correo electrónico</label><div className={`input-icon ${fields.email ? 'has-error' : ''}`}><Mail size={18} /><input id="email" name="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" maxLength={254} placeholder="tu@correo.com" aria-invalid={Boolean(fields.email)} aria-describedby={fields.email ? 'email-error' : undefined} required disabled={submitting} /></div>{fields.email && <span id="email-error" className="field-error">{fields.email}</span>}</div>
          <div className="field"><label htmlFor="password">Contraseña</label><div className={`input-icon ${fields.password ? 'has-error' : ''}`}><LockKeyhole size={18} /><input id="password" name="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={isRegister ? 'new-password' : 'current-password'} placeholder={isRegister ? 'Al menos 8 caracteres' : 'Tu contraseña'} aria-invalid={Boolean(fields.password)} aria-describedby={fields.password ? 'password-error' : isRegister ? 'password-hint' : undefined} required disabled={submitting} /><button type="button" className="password-toggle" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>{fields.password ? <span id="password-error" className="field-error">{fields.password}</span> : isRegister && <span id="password-hint" className="field-hint">Usa 8 caracteres o más para proteger tu cuenta.</span>}</div>
          <button type="submit" className="button button-primary auth-submit" disabled={submitting}>{submitting ? <Spinner label={isRegister ? 'Creando tu cuenta…' : 'Entrando…'} /> : <>{isRegister ? 'Crear mi cuenta' : 'Entrar a mi espacio'}<ArrowRight size={18} /></>}</button>
        </form>
        <p className="auth-privacy"><LockKeyhole size={13} /> Tus tareas son personales. Tu espacio también.</p>
      </div>
      <footer className="auth-footer"><span>© {new Date().getFullYear()} TaskFlow</span><span>Hecho para avanzar a tu ritmo <span aria-hidden="true">↗</span></span></footer>
    </section>
    <aside className="auth-art-side" aria-label="Organiza tu día con TaskFlow">
      <div className="art-grid" aria-hidden="true" /><div className="art-orbit orbit-one" aria-hidden="true" /><div className="art-orbit orbit-two" aria-hidden="true" />
      <span className="art-badge"><Sparkles size={15} /> MENOS RUIDO. MÁS ENFOQUE.</span>
      <div className="art-illustration" aria-hidden="true"><div className="art-float float-star">✳</div><div className="illustration-card"><div className="illustration-heading"><span>Un paso a la vez</span><span>↗</span></div><div className="illustration-row"><span className="illustration-check"><Check size={17} /></span><i className="line-done" /></div><div className="illustration-row"><span className="illustration-check"><Check size={17} /></span><i className="line-done short" /></div><div className="illustration-row"><span className="illustration-empty" /><i /></div><div className="illustration-progress"><span /><span /><span /><span /></div><span className="illustration-caption">Pequeñas acciones. Grandes cambios.</span></div><div className="art-float float-check"><Check size={31} strokeWidth={3} /></div><div className="art-floating-label"><span className="tiny-dot" /> A TU PROPIO RITMO</div></div>
      <div className="art-copy"><h2>Haz espacio para<br />lo importante.</h2><p>Deja las ideas sueltas en un solo lugar.<br />Organiza, enfócate y disfruta de avanzar.</p><div className="art-pagination" aria-hidden="true"><span /><span /><span /></div></div>
      <span className="art-bottom-note">UN POCO DE ORDEN CAMBIA TODO.</span>
    </aside>
  </main>;
}
