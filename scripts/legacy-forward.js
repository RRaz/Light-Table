// The page used to live at <container>/viewer/viewer.html. Galleries published
// then keep a small forwarding page there, so links already in the wild still
// arrive at <container>/light-table/.
import fs from 'node:fs';
import path from 'node:path';

export const LEGACY_FORWARD_HTML = `<!DOCTYPE html>
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

// Writes viewer/viewer.html (or viewer.html at the root, for the oldest layout).
export function writeLegacyForward(containerDir, { root = false } = {}) {
  const dir = root ? containerDir : path.join(containerDir, 'viewer');
  fs.mkdirSync(dir, { recursive: true });
  const html = root
    ? LEGACY_FORWARD_HTML.replaceAll('../light-table/', 'light-table/')
    : LEGACY_FORWARD_HTML;
  const target = path.join(dir, 'viewer.html');
  fs.writeFileSync(target, html, 'utf8');
  return target;
}
