import { randomBytes } from 'node:crypto';
import { access, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
for (const workspace of ['server', 'client']) {
  const target = path.join(root, workspace, '.env');
  try {
    await access(target);
    console.log(`${workspace}/.env ya existe; se conserva.`);
  } catch {
    let content = await readFile(path.join(root, workspace, '.env.example'), 'utf8');
    if (workspace === 'server') {
      content = content.replace(/^JWT_SECRET=.*$/m, `JWT_SECRET=${randomBytes(48).toString('base64url')}`);
    }
    await writeFile(target, content, { flag: 'wx', mode: 0o600 });
    console.log(`${workspace}/.env creado${workspace === 'server' ? ' con secreto JWT aleatorio' : ''}.`);
  }
}
console.log('Configuración lista. Inicia MongoDB con npm run db:start (o configura Atlas), luego npm run dev.');
