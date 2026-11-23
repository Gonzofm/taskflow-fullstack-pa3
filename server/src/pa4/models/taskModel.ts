import { randomUUID } from 'node:crypto';
import type { Pool, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import type { PublicTask, Priority, TaskStatus } from '../../types/entities.js';

export interface SqlTask extends RowDataPacket {
  id: string; title: string; description: string; priority: Priority; status: TaskStatus;
  user_id: string; created_at: Date; updated_at: Date;
}

export interface TaskInput { title: string; description: string; priority: Priority; status: TaskStatus }

export function publicTask(task: SqlTask): PublicTask {
  return { id: task.id, title: task.title, description: task.description, priority: task.priority, status: task.status, user: task.user_id, createdAt: task.created_at, updatedAt: task.updated_at };
}

export function createTaskModel(database: Pool) {
  const columns = 'id,title,description,priority,status,user_id,created_at,updated_at';
  async function byId(id: string, userId: string): Promise<SqlTask | null> {
    const [rows] = await database.execute<SqlTask[]>(`SELECT ${columns} FROM tasks WHERE id=? AND user_id=?`, [id, userId]);
    return rows[0] ?? null;
  }
  return {
    byId,
    async list(userId: string): Promise<SqlTask[]> {
      const [rows] = await database.execute<SqlTask[]>(`SELECT ${columns} FROM tasks WHERE user_id=? ORDER BY created_at DESC,id DESC`, [userId]);
      return rows;
    },
    async create(userId: string, input: TaskInput): Promise<SqlTask> {
      const id = randomUUID();
      await database.execute('INSERT INTO tasks(id,user_id,title,description,priority,status,created_at,updated_at) VALUES(?,?,?,?,?,?,UTC_TIMESTAMP(3),UTC_TIMESTAMP(3))', [id, userId, input.title, input.description, input.priority, input.status]);
      const task = await byId(id, userId);
      if (!task) throw new Error('No se pudo consultar la tarea creada.');
      return task;
    },
    async update(id: string, userId: string, input: Partial<TaskInput>): Promise<SqlTask | null> {
      const [result] = await database.execute<ResultSetHeader>('UPDATE tasks SET title=COALESCE(?,title),description=COALESCE(?,description),priority=COALESCE(?,priority),status=COALESCE(?,status),updated_at=UTC_TIMESTAMP(3) WHERE id=? AND user_id=?', [input.title ?? null, input.description ?? null, input.priority ?? null, input.status ?? null, id, userId]);
      if (!result.affectedRows) return null;
      return byId(id, userId);
    },
    async remove(id: string, userId: string): Promise<boolean> {
      const [result] = await database.execute<ResultSetHeader>('DELETE FROM tasks WHERE id=? AND user_id=?', [id, userId]);
      return result.affectedRows > 0;
    },
  };
}
