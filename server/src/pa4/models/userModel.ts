import { randomUUID } from 'node:crypto';
import type { Pool, RowDataPacket } from 'mysql2/promise';
import type { PublicUser } from '../../types/entities.js';

export interface SqlUser extends RowDataPacket {
  id: string; name: string; email: string; password: string; created_at: Date; updated_at: Date;
}

export function publicUser(user: SqlUser): PublicUser {
  return { id: user.id, name: user.name, email: user.email, createdAt: user.created_at, updatedAt: user.updated_at };
}

export function createUserModel(database: Pool) {
  async function byId(id: string): Promise<SqlUser | null> {
    const [rows] = await database.execute<SqlUser[]>('SELECT id,name,email,password,created_at,updated_at FROM users WHERE id=?', [id]);
    return rows[0] ?? null;
  }
  return {
    byId,
    async byEmail(email: string): Promise<SqlUser | null> {
      const [rows] = await database.execute<SqlUser[]>('SELECT id,name,email,password,created_at,updated_at FROM users WHERE email=?', [email]);
      return rows[0] ?? null;
    },
    async create(name: string, email: string, password: string): Promise<SqlUser> {
      const id = randomUUID();
      await database.execute('INSERT INTO users(id,name,email,password,created_at,updated_at) VALUES(?,?,?,?,UTC_TIMESTAMP(3),UTC_TIMESTAMP(3))', [id, name, email, password]);
      const user = await byId(id);
      if (!user) throw new Error('No se pudo consultar la cuenta creada.');
      return user;
    },
  };
}
