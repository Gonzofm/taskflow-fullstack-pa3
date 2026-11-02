export interface PublicUser {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export type Priority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'completed';

export interface PublicTask {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: TaskStatus;
  user: string;
  createdAt: Date;
  updatedAt: Date;
}
