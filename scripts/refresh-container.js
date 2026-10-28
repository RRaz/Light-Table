// Refresh a downloaded container in place: new viewer code, then reindex.
//
//   npm run refresh -- --container "D:\downloads\people"
//
// The images, their order and the existing titles are left alone. Only
// viewer/viewer.html, viewer/assets and the image folder's gallery.json change.
// Run npm run build first (the batch file does that for you).

import fs from 'node:fs';
import path from 'node:path';
import {
  copyDirectory,
  listImages,
  manifestKey,
  readManifestEntries,
  readTitles,
  writeManifest,
} from './manifest-utils.js';

const projectRoot = process.cwd();
const distRoot = path.join(projectRoot, 'dist');
const distViewer = path.join(distRoot, 'viewer.html');
const distAssets = path.join(distRoot, 'assets');

function fail(message) {
  console.error(message);
  process.exit(1);
}

function parseArgs(argv) {
  const args = { container: '', images: '' };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--container') args.container = argv[++i] || '';
    else if (arg.startsWith('--container=')) args.container = arg.slice('--container='.length);
    else if (arg === '--images') args.images = argv[++i] || '';
    else if (arg.startsWith('--images=')) args.images = arg.slice('--images='.length);
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));
if (!args.container) {
  fail('Usage: npm run refresh -- --container "D:\\downloads\\people" [--images people]');
}

const containerDir = path.resolve(args.container);
if (!fs.existsSync(containerDir) || !fs.statSync(containerDir).isDirectory()) {
  fail(`Container not found: ${containerDir}`);
}

const containerKey = containerDir.toLowerCase();
const distKey = distRoot.toLowerCase();
if (containerKey === distKey || containerKey.startsWith(`${distKey}${path.sep}`)) {
  fail('This container is inside dist/, which npm run build empties. Move it outside dist/ (for example to containers/) and try again.');
}

if (!fs.existsSync(distViewer) || !fs.existsSync(distAssets)) {
  fail('The viewer bundle is missing. Run "npm run build" first.');
}

function findImagesDir() {
  if (args.images) {
    return path.resolve(containerDir, args.images);
  }

  const candidates = fs.readdirSync(containerDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name !== 'viewer')
    .map((entry) => path.join(containerDir, entry.name))
    .filter((dir) => listImages(dir).length > 0);

  if (candidates.length === 0) return '';
  if (candidates.length === 1) return candidates[0];

  const containerName = path.basename(containerDir).toLowerCase();
  const named = candidates.find((dir) => path.basename(dir).toLowerCase() === containerName);
  if (named) return named;

  const withManifest = candidates.find((dir) => fs.existsSync(path.join(dir, 'gallery.json')));
  return withManifest || candidates[0];
}

const imagesDir = findImagesDir();
if (!imagesDir || !fs.existsSync(imagesDir)) {
  fail(`Could not find the image folder inside ${containerDir}. Pass --images <subfolder>.`);
}

// Live layout is <container>/viewer/viewer.html. Support the older root layout
// as well, but leave the live one in charge if both exist.
const viewerDir = path.join(containerDir, 'viewer');
const hasViewerDir = fs.existsSync(path.join(viewerDir, 'viewer.html'));
const hasRootViewer = fs.existsSync(path.join(containerDir, 'viewer.html'));
if (!hasViewerDir && !hasRootViewer) {
  fail(`Could not find viewer.html in ${containerDir} (looked in viewer/ and the root).`);
}

const targetViewerDir = hasViewerDir ? viewerDir : containerDir;
const viewerTarget = path.join(targetViewerDir, 'viewer.html');
const assetsTarget = path.join(targetViewerDir, 'assets');

fs.rmSync(assetsTarget, { recursive: true, force: true });
copyDirectory(distAssets, assetsTarget);

const viewerHtml = fs.readFileSync(distViewer, 'utf8')
  .replaceAll('src="/assets/', 'src="./assets/')
  .replaceAll('href="/assets/', 'href="./assets/');
fs.writeFileSync(viewerTarget, viewerHtml, 'utf8');

const manifestPath = path.join(imagesDir, 'gallery.json');
const previous = readManifestEntries(manifestPath);
const previousKeys = new Set(previous.map(manifestKey).filter(Boolean));
const titles = readTitles(manifestPath);
const images = listImages(imagesDir);

if (images.length === 0) {
  fail(`No images found in ${imagesDir}.`);
}

const { entries } = writeManifest(imagesDir, images, titles, { stamp: true });
const nextKeys = new Set(entries.map((entry) => path.basename(entry.url).toLowerCase()));
const added = [...nextKeys].filter((key) => !previousKeys.has(key));
const removed = [...previousKeys].filter((key) => !nextKeys.has(key));
const kept = [...nextKeys].filter((key) => previousKeys.has(key)).length;

const containerName = path.basename(containerDir);
const imagesName = path.basename(imagesDir);

console.log(`Container: ${path.relative(projectRoot, containerDir) || '.'}`);
console.log(`  viewer:  ${path.relative(containerDir, viewerTarget)} (updated)`);
console.log(`  images:  ${path.relative(containerDir, imagesDir)} (${entries.length})`);
console.log(`  manifest: ${manifestPath}`);
console.log(`  kept:    ${kept}`);
console.log(`  added:   ${added.length}${added.length ? ` (${added.slice(0, 6).join(', ')}${added.length > 6 ? ', …' : ''})` : ''}`);
console.log(`  removed: ${removed.length}${removed.length ? ` (${removed.slice(0, 6).join(', ')}${removed.length > 6 ? ', …' : ''})` : ''}`);
console.log('');

if (imagesName.toLowerCase() !== containerName.toLowerCase()) {
  console.warn(`Warning: the image folder is "${imagesName}" but the container is "${containerName}".`);
  console.warn(`The short URL will not find it; use ?gallery=/${imagesName}.`);
  console.warn('');
}

console.log(`Upload the "${containerName}" folder and open:`);
console.log(`  /${containerName}/viewer/viewer.html`);
