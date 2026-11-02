import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp } from '../src/app.js';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { loadConfig, type AppConfig } from '../src/config/env.js';
import { User } from '../src/models/User.js';
import { Task } from '../src/models/Task.js';
import { JWT_AUDIENCE, JWT_ISSUER } from '../src/middlewares/auth.js';

// mongodb-memory-server ejecuta un binario mongod real con WiredTiger.
// Es una base temporal de pruebas; la aplicación utiliza MONGODB_URI persistente.
const config: AppConfig = {
  nodeEnv: 'test', port: 4000, mongodbUri: '', clientOrigin: 'http://localhost:5173',
  jwtSecret: 'taskflow-test-only-secret-with-at-least-32-bytes',
  jwtExpiresInSeconds: 3600, authRateLimitMax: 1000,
};
const app = createApp(config);
const account = { name: 'Ana Prueba', email: 'ana@taskflow.test', password: 'Segura123!' };
let database: MongoMemoryServer;
let databaseDirectory: string;
const binaryOptions = {
  version: '8.0.17',
  downloadDir: fileURLToPath(new URL('../../.local/mongodb-binaries', import.meta.url)),
};
let tokenA: string;
let tokenB: string;
let userA: string;
let userB: string;
let taskId: string;

beforeAll(async () => {
  databaseDirectory = await mkdtemp(join(tmpdir(), 'taskflow-api-test-'));
  database = await MongoMemoryServer.create({
    binary: binaryOptions,
    instance: { dbPath: databaseDirectory, dbName: 'taskflow_test', storageEngine: 'wiredTiger' },
  });
  config.mongodbUri = database.getUri();
  await connectDatabase(config.mongodbUri);
  await Promise.all([User.init(), Task.init()]);
});

afterAll(async () => {
  await disconnectDatabase();
  if (database) await database.stop({ doCleanup: false, force: false });
  // Se elimina exclusivamente la carpeta temporal que creó esta suite.
  if (databaseDirectory && dirname(resolve(databaseDirectory)) === resolve(tmpdir()) && basename(databaseDirectory).startsWith('taskflow-api-test-')) {
    await rm(databaseDirectory, { recursive: true, force: true });
  }
});

describe('TaskFlow: integración HTTP + MongoDB real', () => {
  it('responde salud200 y oculta cabeceras de framework', async () => {
    const response = await request(app).get('/api/health').expect(200);
    expect(response.body).toEqual({ success: true, data: { status: 'ok', database: 'connected' } });
    expect(response.headers['x-powered-by']).toBeUndefined();
    expect(response.headers['x-content-type-options']).toBe('nosniff');
  });

  it('registra201, normaliza correo, almacena bcrypt y nunca expone el hash', async () => {
    const response = await request(app).post('/api/auth/register').send({ ...account, email: '  ANA@TASKFLOW.TEST  ' }).expect(201);
    tokenA = response.body.data.token;
    userA = response.body.data.user.id;
    expect(response.body.data.user.email).toBe(account.email);
    expect(response.body.data.user).not.toHaveProperty('password');
    expect(response.body.data.user).toHaveProperty('createdAt');
    const stored = await User.findById(userA).select('+password');
    expect(stored?.password).not.toBe(account.password);
    expect(stored?.password).toMatch(/^\$2[aby]\$12\$/);
    expect(await bcrypt.compare(account.password, stored!.password)).toBe(true);
    const defaultSelection = await User.findById(userA).lean();
    expect(defaultSelection).not.toHaveProperty('password');
    const decoded = jwt.verify(tokenA, config.jwtSecret, { algorithms: ['HS256'], issuer: JWT_ISSUER, audience: JWT_AUDIENCE });
    expect(decoded).toMatchObject({ sub: userA });
    expect(typeof decoded === 'object' && decoded.exp! > decoded.iat!).toBe(true);
  });

  it('rechaza correo duplicado normalizado400', async () => {
    await request(app).post('/api/auth/register').send({ ...account, email: 'ANA@TASKFLOW.TEST' }).expect(400);
    expect(await User.countDocuments({ email: account.email })).toBe(1);
  });

  it('valida registro, contraseña en bytes, inyecciones y campos desconocidos400', async () => {
    const invalid = [
      { ...account, name: ' ' },
      { ...account, email: 'correo-invalido' },
      { ...account, password: 'corta' },
      { ...account, password: '🔐'.repeat(19) },
      { ...account, email: { $ne: null } },
      { ...account, role: 'admin' },
    ];
    for (const input of invalid) {
      const response = await request(app).post('/api/auth/register').send(input).expect(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors.length).toBeGreaterThan(0);
    }
  });

  it('autentica200 y rechaza credenciales erróneas401 con mensaje uniforme', async () => {
    const valid = await request(app).post('/api/auth/login').send({ email: account.email, password: account.password }).expect(200);
    expect(valid.body.data.token).toBeTypeOf('string');
    expect(valid.body.data.user).not.toHaveProperty('password');
    const wrong = await request(app).post('/api/auth/login').send({ email: account.email, password: 'Incorrecta123' }).expect(401);
    const unknown = await request(app).post('/api/auth/login').send({ email: 'noexiste@taskflow.test', password: 'Incorrecta123' }).expect(401);
    expect(wrong.body.message).toBe(unknown.body.message);
  });

  it('rechaza tokens ausentes, inválidos, expirados y firmados por otra clave401', async () => {
    await request(app).get('/api/tasks').expect(401);
    await request(app).get('/api/auth/me').expect(401);
    const expired = jwt.sign({}, config.jwtSecret, { subject: userA, issuer: JWT_ISSUER, audience: JWT_AUDIENCE, expiresIn: -1 });
    const wrongKey = jwt.sign({}, 'otra-clave-de-pruebas-con-mas-de-32-bytes', { subject: userA, issuer: JWT_ISSUER, audience: JWT_AUDIENCE, expiresIn: 60 });
    for (const token of ['invalido', expired, wrongKey]) {
      await request(app).get('/api/tasks').auth(token, { type: 'bearer' }).expect(401);
    }
    const response = await request(app).get('/api/auth/me').auth(tokenA, { type: 'bearer' }).expect(200);
    expect(response.body.data.user.id).toBe(userA);
    expect(response.body.data.user).not.toHaveProperty('password');
  });

  it('protege todos los métodos de tareas, incluyendo IDs individuales401', async () => {
    const id = new mongoose.Types.ObjectId().toString();
    await request(app).post('/api/tasks').send({ title: 'Sin token' }).expect(401);
    await request(app).get(`/api/tasks/${id}`).expect(401);
    await request(app).put(`/api/tasks/${id}`).send({ title: 'Sin token' }).expect(401);
    await request(app).delete(`/api/tasks/${id}`).expect(401);
  });

  it('lista vacía200 y crea tarea201 con propietario del JWT', async () => {
    const empty = await request(app).get('/api/tasks').auth(tokenA, { type: 'bearer' }).expect(200);
    expect(empty.body.data.tasks).toEqual([]);
    const response = await request(app).post('/api/tasks').auth(tokenA, { type: 'bearer' })
      .send({ title: '  Preparar PA3  ', description: 'Integrar React, Express y MongoDB.', priority: 'high', status: 'pending' }).expect(201);
    taskId = response.body.data.task.id;
    expect(response.body.data.task).toMatchObject({ title: 'Preparar PA3', user: userA, priority: 'high', status: 'pending' });
    expect(response.body.data.task).toHaveProperty('createdAt');
    expect(await Task.countDocuments({ _id: taskId, user: userA })).toBe(1);
    const listed = await request(app).get('/api/tasks').auth(tokenA, { type: 'bearer' }).expect(200);
    expect(listed.body.data.tasks.map((task: { id: string }) => task.id)).toContain(taskId);
  });

  it('valida tareas400, IDs inválidos400 e inexistentes404', async () => {
    for (const input of [{ title: '' }, { title: 'a', priority: 'urgent' }, { title: 'a', status: 'deleted' }, { title: 'a', description: 'x'.repeat(2001) }, { title: { $gt: '' } }]) {
      await request(app).post('/api/tasks').auth(tokenA, { type: 'bearer' }).send(input).expect(400);
    }
    for (const method of ['get', 'put', 'delete'] as const) {
      const response = request(app)[method]('/api/tasks/no-es-un-object-id').auth(tokenA, { type: 'bearer' });
      if (method === 'put') response.send({ title: 'Válida' });
      await response.expect(400);
    }
    await request(app).get(`/api/tasks/${new mongoose.Types.ObjectId()}`).auth(tokenA, { type: 'bearer' }).expect(404);
    await request(app).put(`/api/tasks/${taskId}`).auth(tokenA, { type: 'bearer' }).send({}).expect(400);
    await request(app).put(`/api/tasks/${taskId}`).auth(tokenA, { type: 'bearer' }).send({ $set: { status: 'completed' } }).expect(400);
  });

  it('aísla cuentas: usuario B no lista, consulta, actualiza ni elimina tareas de A', async () => {
    const registration = await request(app).post('/api/auth/register').send({ name: 'Luis Prueba', email: 'luis@taskflow.test', password: 'Segura456!' }).expect(201);
    tokenB = registration.body.data.token;
    userB = registration.body.data.user.id;
    const list = await request(app).get('/api/tasks').auth(tokenB, { type: 'bearer' }).expect(200);
    expect(list.body.data.tasks).toEqual([]);
    await request(app).get(`/api/tasks/${taskId}`).auth(tokenB, { type: 'bearer' }).expect(404);
    await request(app).put(`/api/tasks/${taskId}`).auth(tokenB, { type: 'bearer' }).send({ title: 'Ataque' }).expect(404);
    await request(app).delete(`/api/tasks/${taskId}`).auth(tokenB, { type: 'bearer' }).expect(404);
    const original = await Task.findById(taskId);
    expect(original?.title).toBe('Preparar PA3');
    expect(original?.user.toString()).toBe(userA);
  });

  it('impide asignar o transferir propietario desde un payload400', async () => {
    await request(app).post('/api/tasks').auth(tokenA, { type: 'bearer' }).send({ title: 'Inyección de propietario', user: userB }).expect(400);
    await request(app).put(`/api/tasks/${taskId}`).auth(tokenA, { type: 'bearer' }).send({ user: userB }).expect(400);
    expect((await Task.findById(taskId))?.user.toString()).toBe(userA);
  });

  it('consulta y actualiza200, incluyendo completar y reabrir tareas', async () => {
    const fetched = await request(app).get(`/api/tasks/${taskId}`).auth(tokenA, { type: 'bearer' }).expect(200);
    expect(fetched.body.data.task.id).toBe(taskId);
    const completed = await request(app).put(`/api/tasks/${taskId}`).auth(tokenA, { type: 'bearer' })
      .send({ title: 'PA3 terminado', priority: 'medium', description: 'Pruebas verificadas.', status: 'completed' }).expect(200);
    expect(completed.body.data.task).toMatchObject({ title: 'PA3 terminado', priority: 'medium', status: 'completed' });
    const reopened = await request(app).put(`/api/tasks/${taskId}`).auth(tokenA, { type: 'bearer' }).send({ status: 'pending' }).expect(200);
    expect(reopened.body.data.task.status).toBe('pending');
  });

  it('persiste después de reiniciar el proceso mongod y la aplicación, conservando WiredTiger en disco', async () => {
    const before = await Task.findById(taskId).lean();
    await disconnectDatabase();
    await request(app).get('/api/health').expect(503);
    await database.stop({ doCleanup: false, force: false });
    database = await MongoMemoryServer.create({
      binary: binaryOptions,
      instance: { dbPath: databaseDirectory, dbName: 'taskflow_test', storageEngine: 'wiredTiger' },
    });
    config.mongodbUri = database.getUri();
    await connectDatabase(config.mongodbUri);
    const restartedApp = createApp(config);
    const response = await request(restartedApp).get(`/api/tasks/${taskId}`).auth(tokenA, { type: 'bearer' }).expect(200);
    expect(response.body.data.task.title).toBe(before?.title);
    expect(response.body.data.task.user).toBe(userA);
    expect(await User.countDocuments()).toBe(2);
  });

  it('elimina200, verifica persistencia de la eliminación y devuelve404 al repetir', async () => {
    await request(app).delete(`/api/tasks/${taskId}`).auth(tokenA, { type: 'bearer' }).expect(200);
    expect(await Task.findById(taskId)).toBeNull();
    await request(app).delete(`/api/tasks/${taskId}`).auth(tokenA, { type: 'bearer' }).expect(404);
    const list = await request(app).get('/api/tasks').auth(tokenA, { type: 'bearer' }).expect(200);
    expect(list.body.data.tasks).toEqual([]);
  });

  it('aplica CORS autorizado, preflight y rechaza origen ajeno403', async () => {
    const allowed = await request(app).get('/api/health').set('Origin', config.clientOrigin).expect(200);
    expect(allowed.headers['access-control-allow-origin']).toBe(config.clientOrigin);
    await request(app).get('/api/health').set('Origin', 'https://origen-ajeno.test').expect(403);
    const preflight = await request(app).options('/api/tasks').set('Origin', config.clientOrigin)
      .set('Access-Control-Request-Method', 'POST').set('Access-Control-Request-Headers', 'authorization,content-type').expect(204);
    expect(preflight.headers['access-control-allow-headers']).toContain('Authorization');
  });

  it('limita intentos de autenticación429', async () => {
    const limitedApp = createApp({ ...config, authRateLimitMax: 1 });
    await request(limitedApp).post('/api/auth/login').send({ email: account.email, password: 'incorrecta' }).expect(401);
    const blocked = await request(limitedApp).post('/api/auth/login').send({ email: account.email, password: 'incorrecta' }).expect(429);
    expect(blocked.body.success).toBe(false);
    expect(blocked.headers['retry-after']).toBeDefined();
  });

  it('devuelve JSON400 para sintaxis malformada y404 para rutas desconocidas', async () => {
    const malformed = await request(app).post('/api/auth/login').set('Content-Type', 'application/json').send('{invalido').expect(400);
    expect(malformed.body.success).toBe(false);
    const unknown = await request(app).get('/api/no-existe').expect(404);
    expect(unknown.body).toEqual({ success: false, message: 'La ruta solicitada no existe.' });
  });

  it('rechaza configuración insegura sin revelar sus valores', () => {
    expect(() => loadConfig({ MONGODB_URI: 'mongodb://localhost:27017/test', JWT_SECRET: 'corta' })).toThrow('JWT_SECRET');
    expect(() => loadConfig({ MONGODB_URI: 'invalido', JWT_SECRET: config.jwtSecret })).toThrow('MONGODB_URI');
    expect(() => loadConfig({ MONGODB_URI: config.mongodbUri, JWT_SECRET: config.jwtSecret, CLIENT_ORIGIN: 'http://localhost:5173/ruta' })).toThrow('CLIENT_ORIGIN');
    expect(loadConfig({ MONGODB_URI: config.mongodbUri, JWT_SECRET: config.jwtSecret }).jwtExpiresInSeconds).toBe(3600);
  });
});
