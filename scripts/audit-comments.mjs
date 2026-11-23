import ts from 'typescript';
import postcss from 'postcss';
import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const excluded = new Set(['node_modules', '.git', '.local', 'dist', 'coverage', '.netlify']);
const files = [];
async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (excluded.has(entry.name)) continue;
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) await walk(file);
    else if (/\.(?:[cm]?[jt]sx?|css|html|sql|svg)$/.test(entry.name)) files.push(file);
  }
}
await walk(root);
const comments = [];
for (const file of files) {
  const content = await readFile(file, 'utf8');
  const relative = path.relative(root, file).replaceAll('\\', '/');
  const locations = new Set();
  if (/\.[cm]?[jt]sx?$/.test(file)) {
    const source = ts.createSourceFile(file, content, ts.ScriptTarget.Latest, true);
    function visit(node) {
      for (const position of [node.pos, node.end]) {
        for (const range of [...(ts.getLeadingCommentRanges(content, position) ?? []), ...(ts.getTrailingCommentRanges(content, position) ?? [])]) locations.add(range.pos);
      }
      if (ts.isJsxExpression(node)) for (const range of ts.getTrailingCommentRanges(content, node.getStart(source) + 1) ?? []) locations.add(range.pos);
      ts.forEachChild(node, visit);
    }
    visit(source);
  } else if (file.endsWith('.css')) {
    postcss.parse(content, { from: file }).walkComments((comment) => locations.add(comment.source?.start?.offset ?? 0));
  } else if (/\.(html|svg)$/.test(file)) {
    for (const match of content.matchAll(/<!--[\s\S]*?-->/g)) locations.add(match.index);
  } else {
    let quote = '';
    for (let i = 0; i < content.length; i++) {
      const c = content[i];
      if (quote) {
        if (c === '\\') i++;
        else if (c === quote && content[i + 1] === quote) i++;
        else if (c === quote) quote = '';
      } else if (c === "'" || c === '"' || c === '`') quote = c;
      else if (c === '#' || (c === '-' && content[i + 1] === '-' && /\s/.test(content[i + 2] ?? '')) || (c === '/' && content[i + 1] === '*')) locations.add(i);
    }
  }
  for (const offset of locations) comments.push({ file: relative, line: content.slice(0, offset).split('\n').length });
}
const report = { generatedAt: new Date().toISOString(), scope: 'Código fuente propio JS/TS/JSX/TSX/CSS/HTML/SQL/SVG; dependencias, builds y archivos privados excluidos.', files: files.length, comments: comments.length, findings: comments };
await mkdir(path.join(root, 'docs/evidencias/pa4'), { recursive: true });
await writeFile(path.join(root, 'docs/evidencias/pa4/comentarios.json'), JSON.stringify(report, null, 2) + '\n');
console.log(`Auditoría: ${report.files} archivos propios, ${report.comments} comentarios.`);
if (comments.length) { console.log(JSON.stringify(comments, null, 2)); process.exitCode = 1; }
