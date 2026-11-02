import type { ApiErrorResponse, AuthResponse, Task, TaskInput, User } from '../types';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace(/\/$/, '');
const TOKEN_KEY = 'taskflow_token';

export const session = {
  getToken: () => sessionStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => sessionStorage.setItem(TOKEN_KEY, token),
  clear: () => sessionStorage.removeItem(TOKEN_KEY),
};

export class ApiError extends Error {
  constructor(message: string, public status: number, public errors?: ApiErrorResponse['errors']) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = session.getToken();
  const abort = new AbortController();
  const timeout = window.setTimeout(() => abort.abort(), 15000);
  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      signal: abort.signal,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
    const body = await response.json().catch(() => null) as (T & ApiErrorResponse) | null;
    if (!response.ok) {
      if (response.status === 401 && token) {
        session.clear();
        window.dispatchEvent(new Event('taskflow:unauthorized'));
      }
      throw new ApiError(body?.message || 'No pudimos completar la solicitud.', response.status, body?.errors);
    }
    if (!body) throw new ApiError('La API devolvió una respuesta no válida.', response.status);
    return body;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError('El servidor está tardando demasiado. Inténtalo de nuevo.', 0);
    }
    throw new ApiError('No podemos conectar con el servidor. Comprueba que la API esté en ejecución.', 0);
  } finally {
    window.clearTimeout(timeout);
  }
}

export const authApi = {
  login: (email: string, password: string) => request<AuthResponse>('/auth/login', {
    method: 'POST', body: JSON.stringify({ email, password }),
  }),
  register: (name: string, email: string, password: string) => request<AuthResponse>('/auth/register', {
    method: 'POST', body: JSON.stringify({ name, email, password }),
  }),
  me: () => request<{ success: true; data: { user: User } }>('/auth/me'),
};

export const tasksApi = {
  list: () => request<{ success: true; data: { tasks: Task[] } }>('/tasks'),
  create: (task: TaskInput) => request<{ success: true; data: { task: Task } }>('/tasks', {
    method: 'POST', body: JSON.stringify(task),
  }),
  update: (id: string, task: Partial<TaskInput>) => request<{ success: true; data: { task: Task } }>(`/tasks/${id}`, {
    method: 'PUT', body: JSON.stringify(task),
  }),
  remove: (id: string) => request<{ success: true; message: string }>(`/tasks/${id}`, { method: 'DELETE' }),
};

export const errorMessage = (error: unknown) => error instanceof Error ? error.message : 'Ocurrió un error inesperado. Inténtalo de nuevo.';
