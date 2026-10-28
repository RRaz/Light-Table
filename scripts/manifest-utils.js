// Shared helpers for the static gallery containers.

import fs from 'node:fs';
import path from 'node:path';

export const IMAGE_EXTENSIONS = new Set([
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.bmp', '.svg',
]);

export function isImageFile(fileName) {
  return IMAGE_EXTENSIONS.has(path.extname(fileName).toLowerCase());
}

export function listImages(dirPath) {
  return fs.readdirSync(dirPath, { withFileTypes: true })
    .filter((entry) => entry.isFile() && isImageFile(entry.name))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
}

export function readManifestData(manifestPath) {
  if (!fs.existsSync(manifestPath)) return { photos: [], updated: '' };

  const raw = fs.readFileSync(manifestPath, 'utf8').trim();
  if (!raw) return { photos: [], updated: '' };

  const data = JSON.parse(raw);
  if (Array.isArray(data)) {
    return { photos: data, updated: '' };
  }
  if (data && typeof data === 'object' && Array.isArray(data.photos)) {
    return {
      photos: data.photos,
      updated: typeof data.updated === 'string' ? data.updated : '',
    };
  }
  throw new Error(`Gallery manifest at ${manifestPath} must be an array or an object with a photos array.`);
}

export function readManifestEntries(manifestPath) {
  return readManifestData(manifestPath).photos;
}

export function manifestKey(entry) {
  const name = path.basename(String(entry.url || entry.id || ''));
  return name.toLowerCase();
}

// Keep the titles that are already in the manifest; the file names come from disk.
export function readTitles(manifestPath) {
  const titles = new Map();
  for (const entry of readManifestEntries(manifestPath)) {
    const key = manifestKey(entry);
    if (!key) continue;
    titles.set(key, entry.title || path.basename(key, path.extname(key)));
  }
  return titles;
}

// Keep the order that is already in the manifest; new files go at the end in
// their natural name order.
export function orderImages(images, entries) {
  const available = new Map(images.map((name) => [name.toLowerCase(), name]));
  const ordered = [];

  for (const entry of entries) {
    const key = manifestKey(entry);
    if (!key) continue;
    const name = available.get(key);
    if (name) {
      ordered.push(name);
      available.delete(key);
    }
  }

  ordered.push(...available.values());
  return ordered;
}

export function writeManifest(dirPath, images, titles = null, options = {}) {
  const manifestPath = path.join(dirPath, 'gallery.json');
  const existing = readManifestData(manifestPath);
  const ordered = orderImages(images, existing.photos);
  const resolvedTitles = titles || readTitles(manifestPath);

  const entries = ordered.map((name) => {
    const key = name.toLowerCase();
    return {
      id: path.basename(name, path.extname(name)),
      url: `./${name}`,
      title: resolvedTitles.get(key) || path.basename(name, path.extname(name)),
    };
  });

  const unchanged = JSON.stringify(existing.photos) === JSON.stringify(entries);
  const updated = options.stamp
    ? new Date().toISOString()
    : (unchanged && existing.updated ? existing.updated : new Date().toISOString());

  fs.writeFileSync(manifestPath, `${JSON.stringify({ updated, photos: entries }, null, 2)}\n`, 'utf8');
  return { manifestPath, entries, updated };
}

export function copyDirectory(sourceDir, targetDir) {
  fs.mkdirSync(targetDir, { recursive: true });
  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);
    if (entry.isDirectory()) copyDirectory(sourcePath, targetPath);
    else fs.copyFileSync(sourcePath, targetPath);
  }
}

export function normalizeName(value) {
  return String(value || '')
    .replace(/\\/g, '/')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
