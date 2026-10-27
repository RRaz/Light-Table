// Rebuild gallery.json for every folder under public/.
// Existing titles and entry order are kept; new images are appended.

import fs from 'node:fs';
import path from 'node:path';
import { listImages, writeManifest } from './manifest-utils.js';

const projectRoot = process.cwd();
const publicDir = path.join(projectRoot, 'public');
const toPosix = (filePath) => filePath.split(path.sep).join('/');

const write = (dirPath) => {
  const images = listImages(dirPath);
  const { manifestPath } = writeManifest(dirPath, images);
  console.log(`Generated ${toPosix(path.relative(projectRoot, manifestPath))}`);
};

const scanDirectory = (dirPath) => {
  write(dirPath);

  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
      scanDirectory(path.join(dirPath, entry.name));
    }
  }
};

if (!fs.existsSync(publicDir)) {
  console.error('Unable to find public directory:', publicDir);
  process.exit(1);
}

scanDirectory(publicDir);
