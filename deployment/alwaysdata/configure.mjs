import { randomBytes } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

const [apiUrl, clientOrigin] = process.argv.slice(2);
for (const value of [apiUrl, clientOrigin]) {
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.origin !== value) throw new Error('Utiliza orígenes HTTPS sin ruta ni barra final.');
}
const password = process.env.TASKFLOW_DB_PASSWORD;
if (!password) throw new Error('Introduce la contraseña MySQL mediante la entrada oculta de la terminal.');
const environment = {
  NODE_ENV: 'production',
  DB_HOST: 'mysql-taskflow4.alwaysdata.net',
  DB_PORT: '3306',
  DB_USER: 'taskflow4',
  DB_PASSWORD: password,
  DB_NAME: 'taskflow4_pa4',
  DB_SSL: 'true',
  CLIENT_ORIGIN: clientOrigin,
  API_PUBLIC_URL: apiUrl,
  JWT_SECRET: randomBytes(48).toString('base64url'),
  JWT_EXPIRES_IN_SECONDS: '3600',
  AUTH_RATE_LIMIT_MAX: '20',
};
function encode(value) {
  for (const quote of ["'", '"', '`']) {
    if (!value.includes(quote) && !/[\r\n]/.test(value)) {
      const encoded = quote + value + quote;
      if (dotenv.parse('VALUE=' + encoded).VALUE === value) return encoded;
    }
  }
  throw new Error('No se pudo representar un valor de configuración de forma segura.');
}
let connection;
try {
  const target = new URL('./server/.env.pa4', import.meta.url);
  await mkdir(new URL('./server/', import.meta.url), { recursive: true });
  await writeFile(target, Object.entries(environment).map(([name, value]) => `${name}=${encode(value)}`).join('\n') + '\n', { flag: 'wx', mode: 0o600 });
  console.log('Configuración privada guardada. Comprobando conexión SQL.');
  connection = await mysql.createConnection({ host: environment.DB_HOST, port: 3306, user: environment.DB_USER, password, database: environment.DB_NAME, ssl: { rejectUnauthorized: true }, connectTimeout: 10000 });
  await connection.execute('SELECT 1 AS connected');
  console.log('Conexión SQL TLS comprobada.');
} catch (error) {
  const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : 'CONFIGURATION_ERROR';
  console.error('No se pudo completar la comprobación de producción. Código:', code);
  process.exitCode = 1;
} finally {
  await connection?.end();
}
