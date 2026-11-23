import mysql, { type Pool } from 'mysql2/promise';
import type { SqlConfig } from './env.js';

export function createDatabase(config: SqlConfig): Pool {
  return mysql.createPool({
    host: config.dbHost, port: config.dbPort, user: config.dbUser,
    password: config.dbPassword, database: config.dbName,
    charset: 'utf8mb4', timezone: 'Z', connectionLimit: 5,
    waitForConnections: true, queueLimit: 30, connectTimeout: 10000,
    enableKeepAlive: true, multipleStatements: false,
    ...(config.dbSsl ? { ssl: { rejectUnauthorized: true } } : {}),
  });
}

export async function checkDatabase(database: Pool): Promise<void> {
  await database.execute('SELECT 1 AS connected');
}
