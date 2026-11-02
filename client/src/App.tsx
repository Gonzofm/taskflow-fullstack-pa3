import { Navigate, Route, Routes } from 'react-router-dom';
import type { ReactNode } from 'react';
import { Brand } from './components/Brand';
import { Spinner } from './components/Spinner';
import { useAuth } from './context/AuthContext';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { session } from './services/api';

function PrivateRoute({ children }: { children: ReactNode }) {
  const { user, loading, authError, retry, logout } = useAuth();
  if (loading) return <div className="page-loader"><Brand /><Spinner label="Preparando tu espacio…" /></div>;
  if (authError && session.getToken()) return <main className="session-error"><Brand /><h1>Tu espacio te está esperando.</h1><p role="alert">{authError}</p><div><button className="button button-primary" onClick={() => void retry()}>Reintentar conexión</button><button className="button button-quiet" onClick={logout}>Volver a iniciar sesión</button></div></main>;
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return <Routes><Route path="/login" element={<AuthPage key="login" mode="login" />} /><Route path="/register" element={<AuthPage key="register" mode="register" />} /><Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} /><Route path="*" element={<Navigate to="/dashboard" replace />} /></Routes>;
}
