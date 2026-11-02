export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export type Priority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'completed';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: TaskStatus;
  user: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: true;
  data: { user: User; token: string };
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Array<{ field: string; message: string }>;
}

export type TaskInput = Pick<Task, 'title' | 'description' | 'priority' | 'status'>;
export type TaskFilter = 'all' | TaskStatus;
