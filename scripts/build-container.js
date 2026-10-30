// Build one self-contained gallery container for a static host.
//
//   npm run container -- --gallery galleries/people
//   npm run container -- --images "D:\galleries\people" --name people
//
// Layout, matching the live site:
//
//   <name>/
//     light-table/index.html
//     light-table/assets/...
//     <name>/<images>
//     <name>/gallery.json
//
// Upload <name>/ as /name/ and open /name/light-table/?gallery=/name.

import fs from 'node:fs';
import path from 'node:path';
import {
  copyDirectory,
  listImages,
  normalizeName,
  orderImages,
  readManifestEntries,
  readTitles,
  writeManifest,
} from './manifest-utils.js';

const projectRoot = process.cwd();
const distRoot = path.join(projectRoot, 'dist');
const viewerSource = path.join(distRoot, 'light-table.html');
const assetsSource = path.join(distRoot, 'assets');

function fail(message) {
  console.error(message);
  process.exit(1);
}

function parseArgs(argv) {
  const args = { images: '', gallery: '', name: '', out: '', carry: '', refreshSource: '' };
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
    else if (arg === '--carry-viewer') args.carry = argv[++i] || '';
    else if (arg === '--refresh-source') args.refreshSource = argv[++i] || '';
    else if (arg.startsWith('--carry-viewer=')) args.carry = arg.slice('--carry-viewer='.length);
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
  fail(
    `No images found in ${sourceDir}.\n` +
      'Supported types: jpg, jpeg, png, gif, webp, avif, bmp, svg.\n' +
      'Put the image files in that folder, or point at the folder that contains them.'
  );
}

const sourceManifest = path.join(sourceDir, 'gallery.json');
const orderedImages = orderImages(images, readManifestEntries(sourceManifest));

if (!fs.existsSync(viewerSource) || !fs.existsSync(assetsSource)) {
  fail('The light table bundle is missing. Run "npm run build" first.');
}

const outRoot = path.resolve(args.out || path.join(projectRoot, 'containers'));
const containerDir = path.join(outRoot, name);
const galleryDir = path.join(containerDir, name);
const viewerDir = path.join(containerDir, 'light-table');

// Building replaces the container folder. If the folder we were given is that
// container, or lives inside it, the images would be deleted before they are
// copied. Refuse rather than destroy them.
const relative = path.relative(containerDir, path.resolve(sourceDir));
const sourceInsideContainer = relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
if (sourceInsideContainer) {
  fail(
    `The images are inside the folder that would be rebuilt:\n  ${containerDir}\n\n` +
      'Building would delete them before copying. Either:\n' +
      `  - put the images in ${path.join(containerDir, name)} and run the batch on ${containerDir}, or\n` +
      '  - build from a copy outside containers\\.'
  );
}

fs.rmSync(containerDir, { recursive: true, force: true });
fs.mkdirSync(viewerDir, { recursive: true });
fs.mkdirSync(galleryDir, { recursive: true });

// The built page asks for ./assets/..., so it must sit beside an assets folder.
const viewerHtml = fs.readFileSync(viewerSource, 'utf8')
  .replaceAll('src="/assets/', 'src="./assets/')
  .replaceAll('href="/assets/', 'href="./assets/');
fs.writeFileSync(path.join(viewerDir, 'index.html'), viewerHtml, 'utf8');
copyDirectory(assetsSource, path.join(viewerDir, 'assets'));

for (const file of orderedImages) {
  fs.copyFileSync(path.join(sourceDir, file), path.join(galleryDir, file));
}

const titles = readTitles(sourceManifest);
const { entries } = writeManifest(galleryDir, orderedImages, titles);

// If the folder you built from carries a viewer/ folder — the forward that keeps
// the old /viewer/viewer.html address alive — bring it along, so it does not have
// to be added afterwards.
const carryRoot = args.carry ? path.resolve(args.carry) : sourceDir;
const carriedViewer = path.join(carryRoot, 'viewer');
const carriedRootViewer = path.join(carryRoot, 'viewer.html');
let carried = '';
if (fs.existsSync(carriedViewer) && fs.statSync(carriedViewer).isDirectory()) {
  copyDirectory(carriedViewer, path.join(containerDir, 'viewer'));
  carried = 'viewer/';
} else if (fs.existsSync(carriedRootViewer)) {
  fs.copyFileSync(carriedRootViewer, path.join(containerDir, 'viewer.html'));
  carried = 'viewer.html';
}

const bytes = fs.readdirSync(galleryDir, { withFileTypes: true })
  .filter((entry) => entry.isFile())
  .reduce((total, entry) => total + fs.statSync(path.join(galleryDir, entry.name)).size, 0);

if (args.refreshSource) {
  const sourceGallery = path.resolve(args.refreshSource);
  if (sourceGallery !== galleryDir) {
    fs.rmSync(sourceGallery, { recursive: true, force: true });
    copyDirectory(galleryDir, sourceGallery);
    console.log(`  source image folder updated: ${sourceGallery}`);
  }
}

console.log(`Container folder: ${containerDir}`);
console.log(`  images taken from: ${sourceDir}`);
console.log(`  ${entries.length} images, ${(bytes / 1024 / 1024).toFixed(1)} MB`);
console.log(`  light-table/index.html`);
console.log(`  ${name}/gallery.json`);
if (carried) console.log(`  ${carried} (old address kept)`);
console.log('');
console.log(`Upload that folder as /${name}/ and open:`);
console.log(`  /${name}/light-table/`);
