import { readFile, readdir } from 'node:fs/promises';
import { extname, join, relative, resolve, sep } from 'node:path';
import process from 'node:process';

const root = process.cwd();
const srcRoot = join(root, 'src');
const allowedDependencies = {
  domain: new Set(['domain']),
  application: new Set(['application', 'domain']),
  content: new Set(['content', 'domain']),
  infrastructure: new Set(['infrastructure', 'application', 'domain']),
  runtime: new Set(['runtime', 'application', 'content', 'domain']),
  app: new Set(['app', 'application', 'infrastructure', 'runtime', 'content', 'domain']),
};

const errors = [];
const files = await collect(srcRoot);
for (const file of files) {
  if (!['.ts', '.tsx'].includes(extname(file))) continue;
  const source = await readFile(file, 'utf8');
  const relativePath = normalize(relative(root, file));
  const layer = relativePath.split('/')[1];
  if (!layer || !(layer in allowedDependencies)) continue;

  if (layer !== 'runtime' && layer !== 'app' && /from\s+['"]phaser['"]/.test(source)) {
    errors.push(`${relativePath}: only runtime/app may import Phaser.`);
  }
  if (layer !== 'infrastructure' && /\blocalStorage\b/.test(source)) {
    errors.push(`${relativePath}: localStorage is restricted to infrastructure.`);
  }
  if (layer !== 'infrastructure' && /CrazyGames|CrazySDK|crazygames/i.test(source)) {
    errors.push(`${relativePath}: platform SDK references are restricted to infrastructure.`);
  }
  if (/switch\s*\([^)]*(levelId|level\.id)/.test(source)) {
    errors.push(`${relativePath}: per-level switch statements are forbidden.`);
  }

  for (const match of source.matchAll(/from\s+['"](\.\.?\/[^'"]+)['"]/g)) {
    const specifier = match[1];
    const target = resolve(join(file, '..'), specifier);
    const targetRelative = normalize(relative(srcRoot, target));
    const targetLayer = targetRelative.split('/')[0];
    if (targetLayer && targetLayer in allowedDependencies && !allowedDependencies[layer].has(targetLayer)) {
      errors.push(`${relativePath}: layer '${layer}' cannot import '${targetLayer}'.`);
    }
  }
}

if (errors.length > 0) {
  console.error('Architecture validation failed:\n' + errors.map((error) => `- ${error}`).join('\n'));
  process.exit(1);
}

console.log(`Architecture validation passed (${files.length} source files checked).`);

async function collect(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const result = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) result.push(...await collect(path));
    else result.push(path);
  }
  return result;
}

function normalize(path) {
  return path.split(sep).join('/');
}
