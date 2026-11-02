import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const evidenceDir = path.join(root, 'docs', 'evidencias');
const npmCli = process.env.npm_execpath;
if (!npmCli) throw new Error('Ejecuta este script mediante npm run verify.');
await mkdir(evidenceDir, { recursive: true });

const report = {
  generatedAt: new Date().toISOString(),
  timezone: 'America/Lima',
  node: process.version,
  checks: [],
};
for (const name of ['typecheck', 'build', 'test']) {
  const started = Date.now();
  let output = '';
  console.log(`\nVerificando: npm run ${name}`);
  const exitCode = await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [npmCli, 'run', name], {
      cwd: root, env: { ...process.env, NO_COLOR: '1', FORCE_COLOR: '0' },
      windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'],
    });
    for (const stream of [child.stdout, child.stderr]) {
      stream.on('data', (chunk) => { const text = chunk.toString(); output += text; process.stdout.write(text); });
    }
    child.on('error', reject);
    child.on('close', (code) => resolve(code ?? 1));
  });
  // Las evidencias públicas no deben revelar rutas del equipo de desarrollo.
  const clean = output.replace(/\x1b\[[0-9;]*[A-Za-z]/g, '')
    .replaceAll(root.replaceAll('\\', '/').replace(/\/$/, ''), '<proyecto>')
    .replaceAll(root.replace(/\\$/, ''), '<proyecto>')
    .replace(/\r\n?/g, '\n').trimEnd() + '\n';
  const filename = `${name}.txt`;
  await writeFile(path.join(evidenceDir, filename), `Comando: npm run ${name}\nFecha UTC: ${report.generatedAt}\nNode: ${process.version}\n\n${clean}`, 'utf8');
  report.checks.push({ command: `npm run ${name}`, exitCode, durationMs: Date.now() - started, log: filename });
  if (exitCode !== 0) {
    process.exitCode = 1;
    break;
  }
}
await writeFile(path.join(evidenceDir, 'verificacion.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(`\nResultados reales guardados en docs/evidencias/verificacion.json (${process.exitCode ? 'hay errores' : 'correcto'}).`);
