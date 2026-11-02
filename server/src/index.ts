import 'dotenv/config';
import { createApp } from './app.js';
import { loadConfig } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { User } from './models/User.js';
import { Task } from './models/Task.js';

async function main(): Promise<void> {
  const config = loadConfig();
  try {
    await connectDatabase(config.mongodbUri);
    await Promise.all([User.init(), Task.init()]);
  } catch {
    throw new Error('No fue posible conectar con MongoDB. Inicia MongoDB local o revisa MONGODB_URI, usuario y acceso de red de Atlas.');
  }
  const app = createApp(config);
  const server = app.listen(config.port, '127.0.0.1', () => {
    console.info(`TaskFlow API disponible en http://localhost:${config.port}`);
    console.info('MongoDB conectado.');
  });
  server.on('error', () => {
    console.error('No fue posible iniciar la API. Revisa que PORT esté disponible.');
    void disconnectDatabase().finally(() => process.exit(1));
  });
  let closing = false;
  function shutdown(): void {
    if (closing) return;
    closing = true;
    const timer = setTimeout(() => process.exit(1), 10_000).unref();
    server.close(() => {
      void disconnectDatabase().finally(() => {
        clearTimeout(timer);
        process.exit(0);
      });
    });
  }
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((error: unknown) => {
  // Los mensajes construidos arriba no incluyen credenciales ni la URI de MongoDB.
  console.error(error instanceof Error ? error.message : 'No fue posible iniciar la API.');
  void disconnectDatabase().finally(() => process.exit(1));
});
