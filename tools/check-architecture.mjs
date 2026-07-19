import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const root = new URL('../src/', import.meta.url);
const files = await walk(root);
const violations = [];

for (const fileUrl of files.filter((file) => file.pathname.endsWith('.js'))) {
  const path = relative(new URL('..', root).pathname, fileUrl.pathname);
  const source = await readFile(fileUrl, 'utf8');

  if (path.includes('/domain/') && /from ['"]\.\.\/game|Phaser|localStorage|AudioContext/.test(source)) {
    violations.push(`${path}: domain must remain framework and browser independent`);
  }
  if (!path.includes('/infrastructure/') && /localStorage/.test(source)) {
    violations.push(`${path}: localStorage is restricted to infrastructure`);
  }
  if (path !== 'src/main.js' && /new Phaser\.Game/.test(source)) {
    violations.push(`${path}: Phaser game composition belongs only in main.js`);
  }
  if (/route\.id\s*===|switch\s*\(\s*route\.id/.test(source)) {
    violations.push(`${path}: route-specific branching is forbidden; move the value into route config`);
  }
  if (/load\.(image|spritesheet|audio)\(/.test(source)) {
    violations.push(`${path}: production assets must use the approved asset pipeline, not ad-hoc scene loading`);
  }
}

if (violations.length) {
  console.error('Architecture check failed:\n' + violations.map((v) => `- ${v}`).join('\n'));
  process.exit(1);
}
console.log(`Architecture check passed for ${files.length} source files`);

async function walk(directoryUrl) {
  const entries = await readdir(directoryUrl, { withFileTypes: true });
  const output = [];
  for (const entry of entries) {
    const child = new URL(`${entry.name}${entry.isDirectory() ? '/' : ''}`, directoryUrl);
    if (entry.isDirectory()) output.push(...await walk(child));
    else output.push(child);
  }
  return output;
}
