import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import type { Pool, RowDataPacket } from 'mysql2/promise';
import { createSqlApp } from '../src/pa4/app.js';
import { createDatabase } from '../src/pa4/config/database.js';
import { loadSqlConfig } from '../src/pa4/config/env.js';

dotenv.config({ path: fileURLToPath(new URL('../.env.pa4', import.meta.url)), quiet: true });
const config = loadSqlConfig({ ...process.env, NODE_ENV: 'test', DB_NAME: process.env.DB_TEST_NAME ?? `${process.env.DB_NAME}_test`, AUTH_RATE_LIMIT_MAX: '1000' });
if (!config.dbName.endsWith('_test')) throw new Error('Las pruebas SQL requieren una base independiente terminada en _test.');
let database: Pool;
let app: ReturnType<typeof createSqlApp>;
let tokenA: string;
let tokenB: string;
let userA: string;
let userB: string;
let taskId: string;
const account = { name: 'Persona de prueba', email: `${randomUUID()}@taskflow.test`, password: 'Prueba-SQL-123!' };
const ownedUserIds: string[] = [];

async function importSql(filename: string): Promise<void> {
  const sql = await readFile(new URL(`../../database/${filename}`, import.meta.url), 'utf8');
  for (const statement of sql.split(';').map((entry) => entry.trim()).filter(Boolean)) await database.query(statement);
}

beforeAll(async () => {
  database = createDatabase(config);
  await importSql('schema.sql');
  await importSql('seed.sql');
  app = createSqlApp(database, config);
});

afterAll(async () => {
  if (database) {
    for (const id of ownedUserIds) await database.execute('DELETE FROM users WHERE id=?', [id]);
    await database.end();
  }
});

describe('TaskFlow PA4: integración HTTP y MariaDB real', () => {
  it('comprueba conexión SQL y cabeceras de seguridad', async () => {
    const response = await request(app).get('/api/health').expect(200);
    expect(response.body.data).toEqual({ status: 'ok', database: 'connected', engine: 'mysql' });
    expect(response.headers['x-powered-by']).toBeUndefined();
    expect(response.headers['x-content-type-options']).toBe('nosniff');
  });

  it('verifica seis integrantes y seis columnas desde information_schema', async () => {
    const [rows] = await database.execute<RowDataPacket[]>('SELECT COUNT(*) AS total FROM integrantes');
    const [columns] = await database.execute<RowDataPacket[]>('SELECT COUNT(*) AS total FROM information_schema.columns WHERE table_schema=? AND table_name=?', [config.dbName, 'integrantes']);
    expect(Number(rows[0]!.total)).toBeGreaterThanOrEqual(6);
    expect(Number(columns[0]!.total)).toBeGreaterThanOrEqual(4);
    const response = await request(app).get('/api/integrantes').expect(200);
    expect(response.body.data.integrantes).toHaveLength(Number(rows[0]!.total));
    for (const integrante of response.body.data.integrantes) {
      expect(integrante).toEqual(expect.objectContaining({ id: expect.any(Number), nombre: expect.any(String), cargo: expect.any(String), descripcion: expect.any(String), imagen: expect.stringMatching(/^https?:\/\//) }));
    }
  });

  it('verifica tres categorías y al menos cuatro plantillas por categoría', async () => {
    const response = await request(app).get('/api/categorias').expect(200);
    expect(response.body.data.categorias.length).toBeGreaterThanOrEqual(3);
    for (const categoria of response.body.data.categorias) {
      expect(categoria.total_plantillas).toBeGreaterThanOrEqual(4);
      const detail = await request(app).get(`/api/plantillas/categoria/${categoria.id}`).expect(200);
      expect(detail.body.data.plantillas.length).toBe(categoria.total_plantillas);
      expect(detail.body.data.plantillas.every((plantilla: { categoria_id: number }) => plantilla.categoria_id === categoria.id)).toBe(true);
    }
  });

  it('obtiene doce plantillas y un detalle con categoría real', async () => {
    const response = await request(app).get('/api/plantillas').expect(200);
    expect(response.body.data.plantillas.length).toBeGreaterThanOrEqual(12);
    const sample = response.body.data.plantillas[0];
    const detail = await request(app).get(`/api/plantillas/${sample.id}`).expect(200);
    expect(detail.body.data.plantilla).toEqual(sample);
    expect(sample.categoria_nombre).toBeTruthy();
  });

  it('la clave foránea impide insertar plantillas sin categoría', async () => {
    await expect(database.execute('INSERT INTO plantillas(categoria_id,nombre,descripcion,imagen) VALUES(?,?,?,?)', [4294967294, 'Prueba FK', 'Registro inválido de prueba', '/images/invalid.svg'])).rejects.toMatchObject({ code: 'ER_NO_REFERENCED_ROW_2' });
    const [rows] = await database.execute<RowDataPacket[]>('SELECT p.id FROM plantillas p LEFT JOIN categorias c ON p.categoria_id=c.id WHERE c.id IS NULL');
    expect(rows).toHaveLength(0);
  });

  it('reimportar el seed conserva los registros sin duplicarlos', async () => {
    const before = (await request(app).get('/api/plantillas').expect(200)).body;
    await importSql('seed.sql');
    const after = (await request(app).get('/api/plantillas').expect(200)).body;
    expect(after).toEqual(before);
  });

  it('todas las imágenes SQL existen y se sirven con tipo correcto', async () => {
    const integrantes = (await request(app).get('/api/integrantes').expect(200)).body.data.integrantes;
    const categorias = (await request(app).get('/api/categorias').expect(200)).body.data.categorias;
    const plantillas = (await request(app).get('/api/plantillas').expect(200)).body.data.plantillas;
    for (const entry of [...integrantes, ...categorias, ...plantillas]) {
      const url = new URL(entry.imagen);
      expect(url.origin).toBe(config.apiPublicUrl);
      const image = await request(app).get(url.pathname).expect(200);
      expect(image.headers['content-type']).toMatch(/^image\/(jpeg|svg\+xml)/);
      expect(image.headers['cross-origin-resource-policy']).toBe('cross-origin');
    }
  });

  it('rechaza identificadores inválidos e intentos de inyección SQL', async () => {
    for (const id of ['0', '-1', '1 OR 1=1', "1' OR '1'='1", '4294967296']) {
      await request(app).get(`/api/plantillas/${encodeURIComponent(id)}`).expect(400);
      await request(app).get(`/api/plantillas/categoria/${encodeURIComponent(id)}`).expect(400);
    }
    await request(app).get('/api/plantillas/4294967294').expect(404);
    await request(app).get('/api/plantillas/categoria/4294967294').expect(404);
  });

  it('autoriza el origen configurado y bloquea orígenes ajenos', async () => {
    const response = await request(app).get('/api/integrantes').set('Origin', config.clientOrigin).expect(200);
    expect(response.headers['access-control-allow-origin']).toBe(config.clientOrigin);
    await request(app).options('/api/tasks').set('Origin', config.clientOrigin).set('Access-Control-Request-Method', 'POST').expect(204);
    await request(app).get('/api/integrantes').set('Origin', 'https://otro.taskflow.test').expect(403);
  });

  it('registra con bcrypt y devuelve usuario público y JWT', async () => {
    const response = await request(app).post('/api/auth/register').send({ ...account, email: ` ${account.email.toUpperCase()} ` }).expect(201);
    tokenA = response.body.data.token;
    userA = response.body.data.user.id;
    ownedUserIds.push(userA);
    expect(response.body.data.user.email).toBe(account.email);
    expect(response.body.data.user.password).toBeUndefined();
    expect(Math.abs(Date.parse(response.body.data.user.createdAt) - Date.now())).toBeLessThan(30000);
    const [rows] = await database.execute<RowDataPacket[]>('SELECT password FROM users WHERE id=?', [userA]);
    expect(rows[0]!.password).toMatch(/^\$2[aby]\$12\$/);
    expect(await bcrypt.compare(account.password, rows[0]!.password)).toBe(true);
    expect(jwt.verify(tokenA, config.jwtSecret, { algorithms: ['HS256'], issuer: 'taskflow-api', audience: 'taskflow-client' })).toMatchObject({ sub: userA });
  });

  it('valida registro y detecta correo duplicado', async () => {
    await request(app).post('/api/auth/register').send(account).expect(400);
    await request(app).post('/api/auth/register').send({ name: 'A', email: 'invalido', password: '123' }).expect(400);
    await request(app).post('/api/auth/register').send({ ...account, email: `${randomUUID()}@taskflow.test`, role: 'admin' }).expect(400);
  });

  it('inicia sesión, recupera la cuenta y rechaza credenciales inválidas', async () => {
    const response = await request(app).post('/api/auth/login').send({ email: account.email, password: account.password }).expect(200);
    tokenA = response.body.data.token;
    expect(response.body.data.user.id).toBe(userA);
    await request(app).get('/api/auth/me').set('Authorization', `Bearer ${tokenA}`).expect(200);
    const invalid = await request(app).post('/api/auth/login').send({ email: account.email, password: 'Incorrecta123' }).expect(401);
    const missing = await request(app).post('/api/auth/login').send({ email: 'inexistente@taskflow.test', password: 'Incorrecta123' }).expect(401);
    expect(invalid.body).toEqual(missing.body);
  });

  it('protege todas las operaciones privadas y rechaza JWT vencidos', async () => {
    await request(app).get('/api/tasks').expect(401);
    await request(app).post('/api/tasks').send({ title: 'No autorizada' }).expect(401);
    await request(app).get('/api/auth/me').set('Authorization', 'Bearer no-es-un-token').expect(401);
    const expired = jwt.sign({}, config.jwtSecret, { algorithm: 'HS256', subject: userA, issuer: 'taskflow-api', audience: 'taskflow-client', expiresIn: -1 });
    await request(app).get('/api/auth/me').set('Authorization', `Bearer ${expired}`).expect(401);
  });

  it('crea y consulta una tarea propia mediante SQL parametrizado', async () => {
    const response = await request(app).post('/api/tasks').set('Authorization', `Bearer ${tokenA}`).send({ title: "Organizar 'mi' semana; SELECT * FROM users", description: 'https://taskflow.test/recurso', priority: 'high' }).expect(201);
    taskId = response.body.data.task.id;
    expect(response.body.data.task.user).toBe(userA);
    expect(response.body.data.task.status).toBe('pending');
    expect(Math.abs(Date.parse(response.body.data.task.createdAt) - Date.now())).toBeLessThan(30000);
    const detail = await request(app).get(`/api/tasks/${taskId}`).set('Authorization', `Bearer ${tokenA}`).expect(200);
    expect(detail.body).toEqual({ success: true, data: { task: response.body.data.task } });
    const list = await request(app).get('/api/tasks').set('Authorization', `Bearer ${tokenA}`).expect(200);
    expect(list.body.data.tasks.some((task: { id: string }) => task.id === taskId)).toBe(true);
  });

  it('impide asignar dueño y valida las tareas', async () => {
    await request(app).post('/api/tasks').set('Authorization', `Bearer ${tokenA}`).send({ title: 'Sin dueño externo', user: userA }).expect(400);
    await request(app).put(`/api/tasks/${taskId}`).set('Authorization', `Bearer ${tokenA}`).send({}).expect(400);
    await request(app).post('/api/tasks').set('Authorization', `Bearer ${tokenA}`).send({ title: '', priority: 'urgent' }).expect(400);
    await request(app).get('/api/tasks/invalido').set('Authorization', `Bearer ${tokenA}`).expect(400);
  });

  it('aísla las tareas entre dos cuentas en GET, PUT y DELETE', async () => {
    const response = await request(app).post('/api/auth/register').send({ ...account, email: `${randomUUID()}@taskflow.test` }).expect(201);
    tokenB = response.body.data.token;
    userB = response.body.data.user.id;
    ownedUserIds.push(userB);
    const list = await request(app).get('/api/tasks').set('Authorization', `Bearer ${tokenB}`).expect(200);
    expect(list.body.data.tasks).toEqual([]);
    await request(app).get(`/api/tasks/${taskId}`).set('Authorization', `Bearer ${tokenB}`).expect(404);
    await request(app).put(`/api/tasks/${taskId}`).set('Authorization', `Bearer ${tokenB}`).send({ title: 'Cambio ajeno' }).expect(404);
    await request(app).delete(`/api/tasks/${taskId}`).set('Authorization', `Bearer ${tokenB}`).expect(404);
  });

  it('actualiza y conserva la tarea después de cerrar y reabrir el pool SQL', async () => {
    const response = await request(app).put(`/api/tasks/${taskId}`).set('Authorization', `Bearer ${tokenA}`).send({ title: 'Semana organizada', status: 'completed' }).expect(200);
    expect(response.body.data.task.status).toBe('completed');
    expect(Math.abs(Date.parse(response.body.data.task.updatedAt) - Date.now())).toBeLessThan(30000);
    await database.end();
    database = createDatabase(config);
    app = createSqlApp(database, config);
    const detail = await request(app).get(`/api/tasks/${taskId}`).set('Authorization', `Bearer ${tokenA}`).expect(200);
    expect(detail.body.data.task).toEqual(response.body.data.task);
    await request(app).put(`/api/tasks/${taskId}`).set('Authorization', `Bearer ${tokenA}`).send({ title: 'Semana organizada' }).expect(200);
  });

  it('elimina sólo una tarea propia y devuelve errores JSON seguros', async () => {
    await request(app).delete(`/api/tasks/${taskId}`).set('Authorization', `Bearer ${tokenA}`).expect(200);
    await request(app).get(`/api/tasks/${taskId}`).set('Authorization', `Bearer ${tokenA}`).expect(404);
    await request(app).get('/api/ruta-inexistente').expect(404);
    await request(app).post('/api/auth/login').set('Content-Type', 'application/json').send('{invalid').expect(400);
    const body = await request(app).post('/api/auth/login').send({ data: 'x'.repeat(20000) }).expect(413);
    expect(JSON.stringify(body.body)).not.toMatch(/password|DB_PASSWORD|stack|mysql2|SELECT/);
  });
});
