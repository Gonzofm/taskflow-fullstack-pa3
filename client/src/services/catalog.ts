import type { Categoria, Integrante, Plantilla } from '../types/catalog';

const configuredUrl = import.meta.env.VITE_API_URL?.trim();
export const apiBaseUrl = (configuredUrl || (import.meta.env.DEV ? 'http://localhost:4000/api' : '')).replace(/\/$/, '');
if (!apiBaseUrl) throw new Error('Configura VITE_API_URL antes de compilar TaskFlow.');

export class CatalogError extends Error {
  constructor(message: string, public readonly status: number) { super(message); }
}

async function get<T>(path: string, signal: AbortSignal): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, { signal, headers: { Accept: 'application/json' } });
  const body = await response.json().catch(() => null) as { success: boolean; data: T; message?: string } | null;
  if (!response.ok) throw new CatalogError(body?.message || 'No pudimos cargar esta información.', response.status);
  if (!body?.success || !body.data) throw new Error('La API devolvió una respuesta inesperada.');
  return body.data;
}

export function imageUrl(path: string): string {
  return new URL(path, apiBaseUrl).toString();
}

export const catalogApi = {
  integrantes: (signal: AbortSignal) => get<{ integrantes: Integrante[] }>('/integrantes', signal),
  categorias: (signal: AbortSignal) => get<{ categorias: Categoria[] }>('/categorias', signal),
  plantillas: (signal: AbortSignal) => get<{ plantillas: Plantilla[] }>('/plantillas', signal),
  porCategoria: (id: number, signal: AbortSignal) => get<{ plantillas: Plantilla[] }>(`/plantillas/categoria/${id}`, signal),
  detalle: (id: string, signal: AbortSignal) => get<{ plantilla: Plantilla }>(`/plantillas/${encodeURIComponent(id)}`, signal),
};
