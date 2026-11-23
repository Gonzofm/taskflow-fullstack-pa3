import { randomBytes } from 'node:crypto';
import { access, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
for (const [targetFile, exampleFile] of [
  ['server/.env.pa4', 'server/.env.pa4.example'],
  ['client/.env', 'client/.env.example'],
]) {
  const target = path.join(root, targetFile);
  try {
    await access(target);
    console.log(`${targetFile} ya existe; se conserva.`);
  } catch {
    let content = await readFile(path.join(root, exampleFile), 'utf8');
    content = content.replace(/^JWT_SECRET=.*$/m, `JWT_SECRET=${randomBytes(48).toString('base64url')}`);
    await writeFile(target, content, { flag: 'wx', mode: 0o600 });
    console.log(`${targetFile} creado.`);
  }
}
console.log('Configura MariaDB/MySQL en server/.env.pa4 y ejecuta npm run sql:import.');
