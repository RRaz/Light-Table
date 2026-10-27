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

export function readManifestEntries(manifestPath) {
  if (!fs.existsSync(manifestPath)) return [];

  const raw = fs.readFileSync(manifestPath, 'utf8').trim();
  if (!raw) return [];

  const data = JSON.parse(raw);
  if (!Array.isArray(data)) {
    throw new Error(`Gallery manifest at ${manifestPath} must be an array.`);
  }
  return data;
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

export function writeManifest(dirPath, images, titles = new Map()) {
  const entries = images.map((name) => {
    const key = name.toLowerCase();
    return {
      id: path.basename(name, path.extname(name)),
      url: `./${name}`,
      title: titles.get(key) || path.basename(name, path.extname(name)),
    };
  });

  const manifestPath = path.join(dirPath, 'gallery.json');
  fs.writeFileSync(manifestPath, `${JSON.stringify(entries, null, 2)}\n`, 'utf8');
  return { manifestPath, entries };
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
