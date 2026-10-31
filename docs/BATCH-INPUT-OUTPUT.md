# Batch input and output

One rule: **drop an image folder, it is built into `containers\<name>`.**

| Input | What the batch does | Destination |
|---|---|---|
| An image folder, anywhere outside `containers\` | builds a container, copies the new `gallery.json` back into the folder you dropped, and refreshes the outside container's page and forward if there is one around it | `containers\<name>\` |
| An image folder inside `containers\` — e.g. `containers\<name>\<name>\` | rebuilds that container | the same `containers\<name>\` |
| A folder with no images at the top level | stops and explains what is missing | nothing is written |
| A container (`light-table\`, `viewer\` or `<name>\`) | has no images at the top level, so it stops | nothing is written |
| Anything inside `dist\` | refuses, because `npm run build` empties it | nothing is written |

The table is the same rule seen twice:

1. **Inside `containers\`** — the container is rebuilt; extras in it are deleted;
   nothing outside changes.
2. **Outside `containers\`** — the slideshow is built in `containers\<name>`, the
   outside copy keeps its viewer and extra folders, and only `gallery.json` is
   written back to the image folder you dropped.

**Names.** The container takes its name from the image folder. A folder called
`colours` produces `containers\colours`, replacing any container of that name.

**What is written.** Inside the container: `light-table\` and `<name>\` with the
images and a fresh `gallery.json`. Outside it: only `gallery.json`, and only in the
image folder you dropped. Images are copied byte for byte and never altered.

**What is lost.** A rebuild recreates the container folder, so anything else in
`containers\<name>` — a `viewer\` forward, a notes file — is deleted. Keep those in
the copy you archive as your repository, not in the build.

## Output you can check

```
Building the light table...
Building a container from "D:\photos\colours"...

  gallery.json copied to source: D:\photos\colours\gallery.json
Container folder: C:\…\containers\colours
  images taken from: D:\photos\colours
  8 images, 0.1 MB
  light-table/index.html
  colours/gallery.json

Upload that folder as /colours/ and open:
  /colours/light-table/
```

The `gallery.json copied to source` line appears only when the image folder is
outside `containers\`.
