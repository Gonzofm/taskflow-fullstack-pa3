import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const deployment = path.join(root, 'deployment', 'alwaysdata');
const require = createRequire(path.join(deployment, 'package.json'));
const ts = require('typescript');
const source = path.join(root, 'server', 'src', 'pa4');
const output = path.join(deployment, 'server', 'dist', 'pa4');
const publicSource = path.join(root, 'server', 'public');
const publicOutput = path.join(deployment, 'server', 'public');

function assertDeploymentPath(target) {
  const relative = path.relative(deployment, path.resolve(target));
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) throw new Error('El destino de compilación debe estar dentro del despliegue AlwaysData.');
}

async function collect(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collect(filename));
    else if (entry.isFile() && entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')) files.push(filename);
  }
  return files.sort();
}

const compiled = [];
for (const filename of await collect(source)) {
  const result = ts.transpileModule(await readFile(filename, 'utf8'), {
    fileName: filename,
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ES2022,
      removeComments: true,
      sourceMap: false,
      inlineSourceMap: false,
      importHelpers: false,
      esModuleInterop: true,
      newLine: ts.NewLineKind.LineFeed,
    },
    reportDiagnostics: true,
  });
  const errors = result.diagnostics?.filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error) ?? [];
  if (errors.length) throw new Error(`No se pudo compilar ${path.relative(root, filename)}.`);
  compiled.push({ filename: path.join(output, path.relative(source, filename).replace(/\.ts$/, '.js')), code: result.outputText });
}

assertDeploymentPath(output);
assertDeploymentPath(publicOutput);
await rm(output, { recursive: true, force: true });
await rm(publicOutput, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const entry of compiled) {
  assertDeploymentPath(entry.filename);
  await mkdir(path.dirname(entry.filename), { recursive: true });
  await writeFile(entry.filename, entry.code, 'utf8');
}
await cp(publicSource, publicOutput, { recursive: true, force: false, errorOnExist: true });
console.log(`AlwaysData preparado con ${compiled.length} módulos SQL y sus imágenes públicas.`);
