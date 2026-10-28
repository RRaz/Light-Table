// Rebuild gallery.json inside a downloaded container.
//
//   npm run reindex -- --container "D:\downloads\people"
//   npm run reindex -- --container "D:\downloads\catalog" --images catalog
//
// The image folder is found automatically: the subfolder that is not "viewer"
// and contains images. Existing titles in gallery.json are kept, keyed by file
// name; URLs are rewritten to point at the images beside the manifest.

import fs from 'node:fs';
import path from 'node:path';
import {
  listImages,
  manifestKey,
  readManifestEntries,
  readTitles,
  writeManifest,
} from './manifest-utils.js';

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
  fail('Usage: npm run reindex -- --container "D:\\downloads\\people" [--images people]');
}

const containerDir = path.resolve(args.container);
if (!fs.existsSync(containerDir) || !fs.statSync(containerDir).isDirectory()) {
  fail(`Container not found: ${containerDir}`);
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

  // Prefer the folder named like the container, then one with a manifest.
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
const viewerPath = path.join(containerDir, 'viewer', 'viewer.html');

console.log(`Reindexed ${entries.length} images in ${path.relative(process.cwd(), imagesDir)}`);
console.log(`  kept:    ${kept}`);
console.log(`  added:   ${added.length}${added.length ? ` (${added.slice(0, 6).join(', ')}${added.length > 6 ? ', …' : ''})` : ''}`);
console.log(`  removed: ${removed.length}${removed.length ? ` (${removed.slice(0, 6).join(', ')}${removed.length > 6 ? ', …' : ''})` : ''}`);
console.log('');

if (!fs.existsSync(viewerPath)) {
  console.warn(`Warning: ${path.relative(process.cwd(), viewerPath)} is missing.`);
} else {
  console.log(`Open from the deployed container:`);
  console.log(`  /${containerName}/viewer/viewer.html`);
}
