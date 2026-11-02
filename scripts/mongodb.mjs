// Runs an actual local mongod process. WiredTiger keeps application data on disk.
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const dbPath = path.join(root, '.local', 'mongodb');
const downloadDir = path.join(root, '.local', 'mongodb-binaries');
await mkdir(dbPath, { recursive: true });
await mkdir(downloadDir, { recursive: true });
process.env.MONGOMS_DOWNLOAD_DIR = downloadDir;
process.env.MONGOMS_VERSION ??= '8.0.17';
const { MongoMemoryServer } = await import('mongodb-memory-server-core');

console.log('Iniciando MongoDB local real (WiredTiger). La primera ejecución descarga mongod de MongoDB.');
console.log('Datos persistentes: .local/mongodb. Mantén abierta esta terminal.');
let mongo;
let closing = false;
async function shutdown() {
  if (closing) return;
  closing = true;
  console.log('\nCerrando MongoDB y conservando los documentos en disco…');
  await mongo?.stop({ doCleanup: false, force: false });
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
try {
  mongo = await MongoMemoryServer.create({
    binary: { downloadDir, version: process.env.MONGOMS_VERSION },
    instance: {
      ip: '127.0.0.1', port: 27017, dbName: 'taskflow', dbPath,
      storageEngine: 'wiredTiger', portGeneration: false,
    },
  });
  console.log('MongoDB listo en mongodb://127.0.0.1:27017/taskflow');
  console.log('Solo acepta conexiones locales. Ctrl+C cierra el proceso y conserva los datos.');
} catch (error) {
  console.error('No se pudo iniciar MongoDB local:', error instanceof Error ? error.message : 'Error desconocido');
  console.error('Comprueba Internet/puerto 27017 o utiliza MongoDB instalado / Atlas con server/.env.');
  process.exitCode = 1;
}
