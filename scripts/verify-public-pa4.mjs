import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

const [apiBase, frontend] = process.argv.slice(2);
assert(apiBase && frontend, 'Indica URL base de API y origen del frontend.');
for (const value of [apiBase, frontend]) assert.equal(new URL(value).protocol, 'https:');
const checks = [];
async function json(path, status = 200) {
  const response = await fetch(apiBase.replace(/\/$/, '') + path, { headers: { Origin: frontend }, signal: AbortSignal.timeout(20000) });
  assert.equal(response.status, status, path);
  assert.match(response.headers.get('content-type') ?? '', /application\/json/);
  assert.equal(response.headers.get('access-control-allow-origin'), frontend, path + ' CORS');
  const body = await response.json();
  checks.push({ path, status: response.status });
  return body.data;
}
try {
  const health = await json('/health');
  assert.equal(health.database, 'connected');
  assert.equal(health.engine, 'mysql');
  const { integrantes } = await json('/integrantes');
  const { categorias } = await json('/categorias');
  const { plantillas } = await json('/plantillas');
  assert(integrantes.length >= 6);
  assert(categorias.length >= 3);
  assert(plantillas.length >= 12);
  const relations = [];
  for (const category of categorias) {
    const data = await json(`/plantillas/categoria/${category.id}`);
    assert(data.plantillas.length >= 4);
    assert(data.plantillas.every((entry) => entry.categoria_id === category.id));
    relations.push({ category: category.id, templates: data.plantillas.length });
  }
  const detail = await json(`/plantillas/${plantillas[0].id}`);
  assert.equal(detail.plantilla.nombre, plantillas[0].nombre);
  await json('/plantillas/no-valido', 400);
  await json('/plantillas/2147483647', 404);
  await json('/auth/me', 401);
  const images = [];
  for (const url of new Set([...integrantes, ...categorias, ...plantillas].map((entry) => entry.imagen))) {
    assert.equal(new URL(url).protocol, 'https:');
    assert.equal(new URL(url).origin, new URL(apiBase).origin);
    const response = await fetch(url, { headers: { Origin: frontend }, signal: AbortSignal.timeout(20000) });
    assert.equal(response.status, 200, url);
    assert.match(response.headers.get('content-type') ?? '', /image\/(jpeg|png|svg\+xml)/);
    assert((await response.arrayBuffer()).byteLength > 200);
    images.push({ url, status: response.status });
  }
  const routes = [];
  for (const route of ['/', '/equipo', '/plantillas', '/plantillas/1', '/ruta-inexistente-pa4']) {
    const response = await fetch(frontend + route, { signal: AbortSignal.timeout(20000) });
    assert.equal(response.status, 200, route);
    assert.match(await response.text(), /<div id="root"><\/div>/);
    routes.push({ route, status: response.status, note: 'HTML SPA; el render de React se comprueba en navegador.' });
  }
  const report = { generatedAt: new Date().toISOString(), apiBase, frontend, result: 'PASS', engine: health.engine, records: { integrantes: integrantes.length, categorias: categorias.length, plantillas: plantillas.length }, relations, api: checks, images, frontendRoutes: routes };
  await mkdir(new URL('../docs/evidencias/pa4/', import.meta.url), { recursive: true });
  await writeFile(new URL('../docs/evidencias/pa4/publicacion.json', import.meta.url), JSON.stringify(report, null, 2) + '\n');
  console.log(`PASS: API SQL pública, ${integrantes.length}/${categorias.length}/${plantillas.length} registros, ${images.length} imágenes y ${routes.length} rutas SPA.`);
} catch (error) {
  console.error('Falló la verificación pública:', error instanceof Error ? error.message : 'Error desconocido.');
  process.exitCode = 1;
}
