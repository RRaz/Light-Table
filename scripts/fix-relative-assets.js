import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();
const distRoot = path.join(projectRoot, 'dist');

function rewriteHtml(filePath) {
  const html = fs.readFileSync(filePath, 'utf8');
  const rewritten = html
    .replaceAll('src="/assets/', 'src="./assets/')
    .replaceAll('href="/assets/', 'href="./assets/');

  if (rewritten !== html) {
    fs.writeFileSync(filePath, rewritten, 'utf8');
    console.log(`Rewrote asset paths in ${path.relative(projectRoot, filePath)}`);
  }
}

function main() {
  if (!fs.existsSync(distRoot)) {
    throw new Error(`Missing dist folder at ${distRoot}`);
  }

  for (const fileName of ['light-table.html', 'index.html']) {
    const filePath = path.join(distRoot, fileName);
    if (fs.existsSync(filePath)) {
      rewriteHtml(filePath);
    }
  }
}

main();
