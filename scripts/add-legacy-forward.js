// Add the old-address forwarding page to a container that was rebuilt from a
// plain image folder, so links to <container>/viewer/viewer.html keep working.
//
//   npm run forward -- --container "containers\kodachrome"
import fs from 'node:fs';
import path from 'node:path';
import { writeLegacyForward } from './legacy-forward.js';

const args = process.argv.slice(2);
let container = '';
for (let i = 0; i < args.length; i += 1) {
  if (args[i] === '--container') container = args[++i] || '';
  else if (args[i].startsWith('--container=')) container = args[i].slice('--container='.length);
}

if (!container) {
  console.error('Usage: npm run forward -- --container "containers\\kodachrome"');
  process.exit(1);
}

const containerDir = path.resolve(container);
if (!fs.existsSync(containerDir) || !fs.statSync(containerDir).isDirectory()) {
  console.error(`Container not found: ${containerDir}`);
  process.exit(1);
}

if (!fs.existsSync(path.join(containerDir, 'light-table', 'index.html'))) {
  console.error(`No light-table/index.html in ${containerDir}. Build the container first.`);
  process.exit(1);
}

const target = writeLegacyForward(containerDir);
console.log(`Forward written: ${path.relative(process.cwd(), target)}`);
console.log(`Old address keeps working: /${path.basename(containerDir)}/viewer/viewer.html`);
