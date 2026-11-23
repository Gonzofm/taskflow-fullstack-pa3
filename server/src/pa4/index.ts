import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:http';
import { createSqlApp } from './app.js';
import { loadSqlConfig } from './config/env.js';
import { checkDatabase, createDatabase } from './config/database.js';

dotenv.config({ path: fileURLToPath(new URL('../../.env.pa4', import.meta.url)), quiet: true });

async function start() {
  const config = loadSqlConfig({ ...process.env, HOST: process.env.HOST ?? process.env.IP });
  const database = createDatabase(config);
  await checkDatabase(database);
  const server = createServer(createSqlApp(database, config));
  server.listen(config.port, config.host, () => console.log(`TaskFlow API SQL lista en ${config.apiPublicUrl}`));
  let stopping = false;
  async function stop() {
    if (stopping) return;
    stopping = true;
    server.close(async () => { await database.end(); process.exit(0); });
    setTimeout(() => process.exit(1), 10000).unref();
  }
  process.on('SIGINT', () => void stop());
  process.on('SIGTERM', () => void stop());
}

start().catch(() => {
  console.error('No se pudo iniciar TaskFlow. Revisa las variables de entorno y la conexión SQL.');
  process.exitCode = 1;
});
