// Refresh a container in place: new light table page, then reindex.
//
//   npm run refresh -- --container "D:\downloads\people"
//
// The images, their order and the existing titles are left alone. Only
// light-table/index.html, light-table/assets and the image folder's gallery.json change.
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
const distViewerCheck = path.join(distRoot, 'light-table.html');
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

if (!fs.existsSync(distViewerCheck) || !fs.existsSync(distAssets)) {
  fail('The light table bundle is missing. Run "npm run build" first.');
}

function findImagesDir() {
  if (args.images) {
    return path.resolve(containerDir, args.images);
  }

  // Images can sit directly in the container root, or in one subfolder.
  if (listImages(containerDir).length > 0) return containerDir;

  const candidates = fs.readdirSync(containerDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name !== 'viewer' && entry.name !== 'light-table')
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
  fail(`No image folder found inside ${containerDir}. Put the images in it, or in one subfolder, and run again.`);
}

// Live layout is <container>/light-table/index.html. The older layout kept the
// page at <container>/viewer/viewer.html; it is migrated rather than refused, so
// an existing gallery can be brought up to date in place.
const distViewerFile = path.join(distRoot, 'light-table.html');
const lightTableDir = path.join(containerDir, 'light-table');
const legacyViewerDir = path.join(containerDir, 'viewer');
const legacyRootViewer = path.join(containerDir, 'viewer.html');

const hadNew = fs.existsSync(path.join(lightTableDir, 'index.html'));
const hadLegacyDir = fs.existsSync(path.join(legacyViewerDir, 'viewer.html'));
const hadLegacyRoot = fs.existsSync(legacyRootViewer);
const created = !hadNew && !hadLegacyDir && !hadLegacyRoot;
const migrated = !hadNew && (hadLegacyDir || hadLegacyRoot);

const targetViewerDir = lightTableDir;
const viewerTarget = path.join(targetViewerDir, 'index.html');
const assetsTarget = path.join(targetViewerDir, 'assets');

fs.mkdirSync(targetViewerDir, { recursive: true });
fs.rmSync(assetsTarget, { recursive: true, force: true });
copyDirectory(distAssets, assetsTarget);

const viewerHtml = fs.readFileSync(distViewerFile, 'utf8')
  .replaceAll('src="/assets/', 'src="./assets/')
  .replaceAll('href="/assets/', 'href="./assets/');
fs.writeFileSync(viewerTarget, viewerHtml, 'utf8');

if (migrated) {
  // Leave a forwarding page at the old address instead of deleting it, so links
  // that already point at .../viewer/viewer.html keep working.
  const stub = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Image Light Table</title>
<link rel="canonical" href="../light-table/">
<meta http-equiv="refresh" content="0; url=../light-table/">
<script>location.replace('../light-table/' + location.search + location.hash);</script>
</head>
<body>
<p><a href="../light-table/">Open the gallery</a></p>
</body>
</html>
`;
  if (hadLegacyDir) {
    fs.rmSync(path.join(legacyViewerDir, 'assets'), { recursive: true, force: true });
    fs.writeFileSync(path.join(legacyViewerDir, 'viewer.html'), stub, 'utf8');
  }
  if (hadLegacyRoot) {
    fs.rmSync(path.join(containerDir, 'assets'), { recursive: true, force: true });
    fs.writeFileSync(legacyRootViewer, stub.replaceAll('../light-table/', 'light-table/'), 'utf8');
  }
}

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

console.log(`Container: ${containerDir}`);
console.log(`  page:    ${path.relative(containerDir, viewerTarget)} ${created ? '(created)' : migrated ? '(migrated)' : '(updated)'}`);
if (migrated) console.log('  old link: viewer/viewer.html now forwards to light-table/');
console.log(`  images:  ${path.relative(containerDir, imagesDir) || '.'} (${entries.length})`);
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
console.log(`  /${containerName}/light-table/`);
