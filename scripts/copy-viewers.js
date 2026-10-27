import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();
const distPath = path.join(projectRoot, 'dist');
const viewerSource = path.join(distPath, 'viewer.html');

function ensureViewerExists() {
  if (!fs.existsSync(viewerSource)) {
    throw new Error(`Missing built viewer at ${viewerSource}`);
  }
}

function copyViewerPages() {
  const viewerFolders = ['viewer1', 'viewer2', 'viewer3', 'viewer4'];
  ensureViewerExists();

  viewerFolders.forEach((folderName) => {
    const targetDir = path.join(distPath, folderName);
    fs.mkdirSync(targetDir, { recursive: true });
    fs.copyFileSync(viewerSource, path.join(targetDir, 'viewer.html'));
  });
}

try {
  copyViewerPages();
  console.log('Copied viewer.html into gallery folders.');
} catch (error) {
  console.error(error);
  process.exit(1);
}
