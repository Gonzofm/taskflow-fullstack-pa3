import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import { z } from 'zod';

dotenv.config({ path: fileURLToPath(new URL('./server/.env.pa4', import.meta.url)), quiet: true });

const schema = z.object({
  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().int().min(1).max(65535).default(3306),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string().min(1).max(64),
  DB_SSL: z.enum(['true', 'false']).default('false'),
});

function statements(sql) {
  const output = [];
  let statement = '';
  let quote = '';
  for (let index = 0; index < sql.length; index += 1) {
    const character = sql[index];
    if (quote) {
      statement += character;
      if (character === '\\' && index + 1 < sql.length) statement += sql[++index];
      else if (character === quote) {
        if (sql[index + 1] === quote) statement += sql[++index];
        else quote = '';
      }
    } else if (character === "'" || character === '"' || character === '`') {
      quote = character;
      statement += character;
    } else if (character === ';') {
      if (statement.trim()) output.push(statement.trim());
      statement = '';
    } else statement += character;
  }
  if (quote) throw new Error('El script SQL contiene una cadena sin cerrar.');
  if (statement.trim()) output.push(statement.trim());
  return output;
}

async function main() {
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) throw new Error('Faltan variables SQL válidas para importar la base de datos.');
  const config = parsed.data;
  const scripts = [];
  for (const filename of ['schema.sql', 'seed.sql']) {
    const sql = await readFile(new URL(`../../database/${filename}`, import.meta.url), 'utf8');
    const entries = statements(sql);
    if (entries.some((statement) => /^(?:DROP|TRUNCATE|DELETE|UPDATE|ALTER)\b/i.test(statement))) throw new Error('La importación sólo admite los scripts de creación e inserción del proyecto.');
    scripts.push(...entries);
  }
  const database = await mysql.createConnection({
    host: config.DB_HOST,
    port: config.DB_PORT,
    user: config.DB_USER,
    password: config.DB_PASSWORD,
    database: config.DB_NAME,
    charset: 'utf8mb4',
    timezone: 'Z',
    connectTimeout: 10000,
    multipleStatements: false,
    ...(config.DB_SSL === 'true' ? { ssl: { rejectUnauthorized: true } } : {}),
  });
  try {
    for (const statement of scripts) await database.query(statement);
    const [counts] = await database.execute('SELECT (SELECT COUNT(*) FROM integrantes) AS integrantes,(SELECT COUNT(*) FROM categorias) AS categorias,(SELECT COUNT(*) FROM plantillas) AS plantillas');
    const [categories] = await database.execute('SELECT c.id,COUNT(p.id) AS plantillas FROM categorias c LEFT JOIN plantillas p ON p.categoria_id=c.id GROUP BY c.id ORDER BY c.id');
    console.log(JSON.stringify({ imported: true, counts: counts[0], categories }));
  } finally {
    await database.end();
  }
}

main().catch(() => {
  console.error('No se pudo importar el catálogo. Revisa las variables SQL, permisos y scripts del proyecto.');
  process.exitCode = 1;
});
