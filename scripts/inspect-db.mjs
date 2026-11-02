// Read-only view for academic evidence. Never print password hashes or tokens.
import { fileURLToPath } from 'node:url';
import { config } from 'dotenv';
import mongoose from 'mongoose';

config({ path: fileURLToPath(new URL('../server/.env', import.meta.url)), quiet: true });
try {
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  const db = mongoose.connection.db;
  const users = await db.collection('users').find({}, { projection: { password: 0 } }).toArray();
  const tasks = await db.collection('tasks').find({}).toArray();
  console.log(JSON.stringify({ database: db.databaseName, users, tasks }, null, 2));
} catch {
  console.error('No se pudo inspeccionar MongoDB. Revisa MONGODB_URI e inicia la base de datos.');
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
