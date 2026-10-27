// Build one self-contained gallery container for a static host.
//
//   npm run container -- --gallery galleries/people
//   npm run container -- --images "D:\galleries\people" --name people
//
// Layout, matching the live site:
//
//   <name>/
//     viewer/viewer.html
//     viewer/assets/...
//     <name>/<images>
//     <name>/gallery.json
//
// Upload <name>/ as /name/ and open /name/viewer/viewer.html?gallery=/name.

import fs from 'node:fs';
import path from 'node:path';
import {
  copyDirectory,
  listImages,
  normalizeName,
  readTitles,
  writeManifest,
} from './manifest-utils.js';

const projectRoot = process.cwd();
const distRoot = path.join(projectRoot, 'dist');
const viewerSource = path.join(distRoot, 'viewer.html');
const assetsSource = path.join(distRoot, 'assets');

function fail(message) {
  console.error(message);
  process.exit(1);
}

function parseArgs(argv) {
  const args = { images: '', gallery: '', name: '', out: '' };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--images') args.images = argv[++i] || '';
    else if (arg.startsWith('--images=')) args.images = arg.slice('--images='.length);
    else if (arg === '--gallery') args.gallery = argv[++i] || '';
    else if (arg.startsWith('--gallery=')) args.gallery = arg.slice('--gallery='.length);
    else if (arg === '--name') args.name = argv[++i] || '';
    else if (arg.startsWith('--name=')) args.name = arg.slice('--name='.length);
    else if (arg === '--out') args.out = argv[++i] || '';
    else if (arg.startsWith('--out=')) args.out = arg.slice('--out='.length);
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));

if (!args.images && !args.gallery) {
  fail('Usage: npm run container -- --gallery galleries/people\n       npm run container -- --images "D:\\galleries\\people" [--name people]');
}

const sourceDir = args.images
  ? path.resolve(args.images)
  : path.resolve(projectRoot, 'public', args.gallery.replace(/^[/\\]+/, ''));

if (!fs.existsSync(sourceDir) || !fs.statSync(sourceDir).isDirectory()) {
  fail(`Image folder not found: ${sourceDir}`);
}

const name = normalizeName(args.name || path.basename(sourceDir));
if (!name) {
  fail('Could not derive a container name. Pass --name.');
}

const images = listImages(sourceDir);
if (images.length === 0) {
  fail(`No images found in ${sourceDir}`);
}

if (!fs.existsSync(viewerSource) || !fs.existsSync(assetsSource)) {
  fail('The viewer bundle is missing. Run "npm run build" first.');
}

const outRoot = path.resolve(args.out || path.join(distRoot, 'containers'));
const containerDir = path.join(outRoot, name);
const galleryDir = path.join(containerDir, name);
const viewerDir = path.join(containerDir, 'viewer');

fs.rmSync(containerDir, { recursive: true, force: true });
fs.mkdirSync(viewerDir, { recursive: true });
fs.mkdirSync(galleryDir, { recursive: true });

// The built viewer asks for ./assets/..., so it must sit beside an assets folder.
const viewerHtml = fs.readFileSync(viewerSource, 'utf8')
  .replaceAll('src="/assets/', 'src="./assets/')
  .replaceAll('href="/assets/', 'href="./assets/');
fs.writeFileSync(path.join(viewerDir, 'viewer.html'), viewerHtml, 'utf8');
copyDirectory(assetsSource, path.join(viewerDir, 'assets'));

for (const file of images) {
  fs.copyFileSync(path.join(sourceDir, file), path.join(galleryDir, file));
}

const titles = readTitles(path.join(sourceDir, 'gallery.json'));
const { entries } = writeManifest(galleryDir, images, titles);

const bytes = fs.readdirSync(galleryDir, { withFileTypes: true })
  .filter((entry) => entry.isFile())
  .reduce((total, entry) => total + fs.statSync(path.join(galleryDir, entry.name)).size, 0);

console.log(`Container: ${path.relative(projectRoot, containerDir)}`);
console.log(`  ${entries.length} images, ${(bytes / 1024 / 1024).toFixed(1)} MB`);
console.log(`  viewer/viewer.html`);
console.log(`  ${name}/gallery.json`);
console.log('');
console.log(`Upload the "${name}" folder as /${name}/ and open:`);
console.log(`  /${name}/viewer/viewer.html`);
