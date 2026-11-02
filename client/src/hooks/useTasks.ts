import { useCallback, useEffect, useState } from 'react';
import { errorMessage, tasksApi } from '../services/api';
import type { Task, TaskInput } from '../types';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try { const response = await tasksApi.list(); setTasks(response.data.tasks); }
    catch (err) { setError(errorMessage(err)); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void reload(); }, [reload]);

  const create = async (input: TaskInput) => {
    const response = await tasksApi.create(input);
    setTasks((current) => [response.data.task, ...current]);
  };
  const update = async (id: string, input: Partial<TaskInput>) => {
    const response = await tasksApi.update(id, input);
    setTasks((current) => current.map((task) => task.id === id ? response.data.task : task));
  };
  const remove = async (id: string) => {
    await tasksApi.remove(id);
    setTasks((current) => current.filter((task) => task.id !== id));
  };
  return { tasks, loading, error, reload, create, update, remove };
}
