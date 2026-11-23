import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
dotenv.config({ path: path.join(root, 'server/.env.pa4'), quiet: true });
const mode = process.argv[2];
if (!['import', 'inspect'].includes(mode)) throw new Error('Utiliza npm run sql:import o npm run sql:inspect.');
const required = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const missing = required.filter((field) => process.env[field] === undefined);
if (missing.length) throw new Error(`Falta configuración SQL: ${missing.join(', ')}.`);

export function splitSql(source) {
  const statements = [];
  let start = 0;
  let quote = '';
  for (let index = 0; index < source.length; index++) {
    const character = source[index];
    if (quote) {
      if (character === '\\') index++;
      else if (character === quote && source[index + 1] === quote) index++;
      else if (character === quote) quote = '';
    } else if (['\'', '"', '`'].includes(character)) quote = character;
    else if (character === ';') {
      const statement = source.slice(start, index).trim();
      if (statement) statements.push(statement);
      start = index + 1;
    }
  }
  if (quote) throw new Error('El archivo SQL tiene una cadena sin cerrar.');
  if (source.slice(start).trim()) statements.push(source.slice(start).trim());
  return statements;
}

let connection;
try {
  connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    charset: 'utf8mb4',
    timezone: 'Z',
    multipleStatements: false,
    connectTimeout: 10000,
    ...(process.env.DB_SSL === 'true' ? { ssl: { rejectUnauthorized: true } } : {}),
  });
  const files = mode === 'import' ? ['schema.sql', 'seed.sql'] : ['checks.sql'];
  for (const file of files) {
    const source = await readFile(path.join(root, 'database', file), 'utf8');
    for (const statement of splitSql(source)) {
      const [result] = await connection.query(statement);
      if (mode === 'inspect') console.log(JSON.stringify(result, null, 2));
    }
    console.log(`${file}: ejecutado correctamente.`);
  }
} catch {
  console.error('No se pudo completar la operación SQL. Revisa la base de datos, los permisos y server/.env.pa4.');
  process.exitCode = 1;
} finally {
  await connection?.end();
}
