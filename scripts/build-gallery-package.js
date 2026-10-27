import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();
const publicRoot = path.join(projectRoot, 'public');
const distRoot = path.join(projectRoot, 'dist');
const viewerSource = path.join(distRoot, 'viewer.html');
const imageExtensions = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.bmp', '.svg']);

function parseArgs(argv) {
  const args = { gallery: '', action: 'add', baseUrl: '', manifestUrl: '', fresh: false };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--gallery') {
      args.gallery = argv[i + 1] || '';
      i += 1;
    } else if (arg.startsWith('--gallery=')) {
      args.gallery = arg.slice('--gallery='.length);
    } else if (arg === '--action') {
      args.action = (argv[i + 1] || 'add').toLowerCase();
      i += 1;
    } else if (arg.startsWith('--action=')) {
      args.action = arg.slice('--action='.length).toLowerCase();
    } else if (arg === '--base-url') {
      args.baseUrl = argv[i + 1] || '';
      i += 1;
    } else if (arg.startsWith('--base-url=')) {
      args.baseUrl = arg.slice('--base-url='.length);
    } else if (arg === '--manifest-url') {
      args.manifestUrl = argv[i + 1] || '';
      i += 1;
    } else if (arg.startsWith('--manifest-url=')) {
      args.manifestUrl = arg.slice('--manifest-url='.length);
    } else if (arg === '--fresh' || arg === '--clean') {
      args.fresh = true;
    }
  }

  return args;
}

function normalizeGalleryPath(value) {
  return value.replace(/\\+/g, '/').replace(/^\/+/g, '').replace(/\/+/g, '/').replace(/\/$/, '');
}

function ensureViewerBundle() {
  if (!fs.existsSync(viewerSource)) {
    throw new Error(`Missing viewer bundle at ${viewerSource}. Run npm run build first.`);
  }
}

function copyDirectory(srcDir, destDir) {
  fs.mkdirSync(destDir, { recursive: true });
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function rewriteViewerHtml(filePath) {
  const html = fs.readFileSync(filePath, 'utf8');
  const rewritten = html
    .replaceAll('src="/assets/', 'src="./assets/')
    .replaceAll('href="/assets/', 'href="./assets/');

  fs.writeFileSync(filePath, rewritten, 'utf8');
}

function isImageFile(fileName) {
  return imageExtensions.has(path.extname(fileName).toLowerCase());
}

function formatTitle(fileName) {
  return path.basename(fileName, path.extname(fileName));
}

function readManifestFile(manifestPath) {
  if (!fs.existsSync(manifestPath)) {
    return [];
  }

  const rawManifest = fs.readFileSync(manifestPath, 'utf8').trim();
  if (!rawManifest) {
    return [];
  }

  const manifest = JSON.parse(rawManifest);
  if (!Array.isArray(manifest)) {
    throw new Error(`Gallery manifest at ${manifestPath} must be an array.`);
  }

  return manifest;
}

function getManifestEntriesFromFiles(sourceGalleryDir) {
  return fs.readdirSync(sourceGalleryDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && isImageFile(entry.name))
    .map((entry) => ({
      id: formatTitle(entry.name),
      url: `./${entry.name}`,
      title: formatTitle(entry.name),
    }));
}

function generateManifestFromFiles(sourceGalleryDir) {
  const manifestPath = path.join(sourceGalleryDir, 'gallery.json');
  const entries = getManifestEntriesFromFiles(sourceGalleryDir);

  fs.writeFileSync(manifestPath, JSON.stringify(entries, null, 2) + '\n', 'utf8');
  console.log(`Generated ${path.relative(projectRoot, manifestPath)}`);
  return true;
}

function deletePackage(galleryPath) {
  const normalizedGalleryPath = normalizeGalleryPath(galleryPath);
  const packageDir = path.join(distRoot, 'packages', normalizedGalleryPath);

  if (!fs.existsSync(packageDir)) {
    console.log(`No packaged gallery found at ${path.relative(projectRoot, packageDir)}`);
    return;
  }

  fs.rmSync(packageDir, { recursive: true, force: true });
  console.log(`Deleted packaged gallery at ${path.relative(projectRoot, packageDir)}`);
}

function resolveManifestEntries(manifest, baseUrl) {
  return manifest.map((entry) => {
    const fileName = path.basename(entry.url || entry.id || '');
    const hasAbsoluteUrl = /^https?:\/\//i.test(entry.url || '');
    const url = hasAbsoluteUrl
      ? entry.url
      : baseUrl
        ? new URL(fileName, `${baseUrl.replace(/\/$/, '')}/`).toString()
        : `./gallery/${fileName}`;

    return {
      id: entry.id || path.basename(fileName, path.extname(fileName)),
      url,
      title: entry.title || path.basename(fileName, path.extname(fileName)),
    };
  });
}

async function fetchManifest(manifestUrl) {
  const response = await fetch(manifestUrl);
  if (!response.ok) {
    if (response.status === 404 || response.status === 410) {
      console.warn(`Gallery manifest not found at ${manifestUrl}; treating it as an empty gallery.`);
      return [];
    }

    throw new Error(`Failed to download gallery manifest from ${manifestUrl}: ${response.status} ${response.statusText}`);
  }

  const rawManifest = await response.text();
  if (!rawManifest.trim()) {
    return [];
  }

  const manifest = JSON.parse(rawManifest);
  if (!Array.isArray(manifest)) {
    throw new Error(`Gallery manifest from ${manifestUrl} must be an array.`);
  }

  return manifest;
}

async function packageGallery(galleryPath, baseUrl = '', manifestUrl = '', fresh = false) {
  const normalizedGalleryPath = normalizeGalleryPath(galleryPath);
  const packageDir = path.join(distRoot, 'packages', normalizedGalleryPath);
  if (fresh) {
    fs.rmSync(packageDir, { recursive: true, force: true });
  }

  const sourceGalleryDir = path.join(publicRoot, normalizedGalleryPath);
  const localManifestPath = path.join(sourceGalleryDir, 'gallery.json');
  const hasLocalGalleryDir = fs.existsSync(sourceGalleryDir) && fs.statSync(sourceGalleryDir).isDirectory();
  const localImageEntries = hasLocalGalleryDir ? getManifestEntriesFromFiles(sourceGalleryDir) : [];
  const hasLocalImages = localImageEntries.length > 0;

  let manifest = [];
  let shouldCopyLocalImages = false;

  if (manifestUrl) {
    manifest = await fetchManifest(manifestUrl);

    if (Array.isArray(manifest) && manifest.length === 0) {
      if (hasLocalImages) {
        console.warn(`Remote gallery manifest was empty or not found; falling back to local images from ${path.relative(projectRoot, sourceGalleryDir)}.`);
        generateManifestFromFiles(sourceGalleryDir);
        manifest = readManifestFile(localManifestPath);
        shouldCopyLocalImages = true;
      } else {
        console.warn('Remote gallery manifest was empty or not found; packaging an empty gallery.');
      }
    }
  } else {
    if (!hasLocalGalleryDir) {
      throw new Error(`Gallery folder not found: ${sourceGalleryDir}`);
    }

    if (!fs.existsSync(localManifestPath)) {
      generateManifestFromFiles(sourceGalleryDir);
    }

    manifest = readManifestFile(localManifestPath);
    shouldCopyLocalImages = true;
  }

  const packageAssetsDir = path.join(packageDir, 'assets');
  const packageGalleryDir = path.join(packageDir, 'gallery');

  fs.rmSync(packageDir, { recursive: true, force: true });
  fs.mkdirSync(packageAssetsDir, { recursive: true });
  fs.mkdirSync(packageGalleryDir, { recursive: true });

  const distAssetsDir = path.join(distRoot, 'assets');
  if (fs.existsSync(distAssetsDir)) {
    copyDirectory(distAssetsDir, packageAssetsDir);
  }

  const viewerTarget = path.join(packageDir, 'viewer.html');
  fs.copyFileSync(viewerSource, viewerTarget);
  rewriteViewerHtml(viewerTarget);

  const updatedManifest = resolveManifestEntries(manifest, baseUrl);

  fs.writeFileSync(path.join(packageDir, 'gallery.json'), JSON.stringify(updatedManifest, null, 2) + '\n', 'utf8');

  if (shouldCopyLocalImages && hasLocalGalleryDir) {
    for (const entry of fs.readdirSync(sourceGalleryDir, { withFileTypes: true })) {
      if (entry.isFile() && isImageFile(entry.name)) {
        fs.copyFileSync(path.join(sourceGalleryDir, entry.name), path.join(packageGalleryDir, entry.name));
      }
    }
  }

  console.log(`Packaged gallery to ${path.relative(projectRoot, packageDir)}`);
}

async function main() {
  const { gallery, action, baseUrl, manifestUrl, fresh } = parseArgs(process.argv.slice(2));

  if (!gallery) {
    throw new Error('Usage: node scripts/build-gallery-package.js --gallery galleries/wedding [--action add|update|delete]');
  }

  if (action === 'delete') {
    deletePackage(gallery);
    return;
  }

  ensureViewerBundle();
  await packageGallery(gallery, baseUrl, manifestUrl, fresh);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
