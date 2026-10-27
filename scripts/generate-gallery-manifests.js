import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();
const publicDir = path.join(projectRoot, 'public');
const imageExtensions = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.bmp', '.svg']);

const isImageFile = (fileName) => imageExtensions.has(path.extname(fileName).toLowerCase());
const formatTitle = (fileName) => path.basename(fileName, path.extname(fileName));
const toPosix = (filePath) => filePath.split(path.sep).join('/');

// Titles are the one thing the file names cannot tell us, so keep any that are
// already in the manifest. A renamed file falls back to its file name.
const readExistingTitles = (manifestPath) => {
  const titles = new Map();
  if (!fs.existsSync(manifestPath)) return titles;

  try {
    const raw = fs.readFileSync(manifestPath, 'utf8').trim();
    if (!raw) return titles;

    const manifest = JSON.parse(raw);
    if (!Array.isArray(manifest)) return titles;

    for (const entry of manifest) {
      const fileName = path.basename(String(entry.url || entry.id || '')).toLowerCase();
      if (fileName && typeof entry.title === 'string' && entry.title.trim()) {
        titles.set(fileName, entry.title);
      }
    }
  } catch (error) {
    console.warn(`Could not read existing titles from ${toPosix(path.relative(projectRoot, manifestPath))}: ${error.message}`);
  }

  return titles;
};

const writeManifest = (dirPath) => {
  const manifestPath = path.join(dirPath, 'gallery.json');
  const existingTitles = readExistingTitles(manifestPath);

  const entries = fs.readdirSync(dirPath, { withFileTypes: true })
    .filter((entry) => entry.isFile() && isImageFile(entry.name))
    .map((entry) => ({
      id: path.basename(entry.name, path.extname(entry.name)),
      url: `./${toPosix(entry.name)}`,
      title: existingTitles.get(entry.name.toLowerCase()) || formatTitle(entry.name)
    }));

  fs.writeFileSync(manifestPath, JSON.stringify(entries, null, 2) + '\n', 'utf8');
  console.log(`Generated ${toPosix(path.relative(projectRoot, manifestPath))}`);
  return true;
};

const scanDirectory = (dirPath, relativeDir = '') => {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  writeManifest(dirPath);

  entries
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules')
    .forEach((entry) => {
      scanDirectory(path.join(dirPath, entry.name), toPosix(path.join(relativeDir, entry.name)));
    });
};

const main = () => {
  if (!fs.existsSync(publicDir)) {
    console.error('Unable to find public directory:', publicDir);
    process.exit(1);
  }

  scanDirectory(publicDir);
};

main();
