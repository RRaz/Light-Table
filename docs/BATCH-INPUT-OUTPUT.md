# Batch input and output

What `Light-table.bat` does with each shape of folder.

Terms: **a container** is one gallery folder — the thing you upload; **`containers\`**
is the project folder that holds all of them. See [DEPLOY.md](../DEPLOY.md#the-words-used-here). "Origin" is what you give
it; "Destination" is where the result appears.

| # | Input (origin) | Contains | What the batch decides | Destination | What you end up with |
|---|---|---|---|---|---|
| 1 | any folder, `…\<name>\` | images only | build | **new** `containers\<name>\` | `<name>\` with the images plus a generated `gallery.json` (titles from file names), and `light-table\` |
| 2 | any folder, `…\<name>\` | images + `gallery.json` | build | **new** `containers\<name>\` | as above, but titles and order come from your `gallery.json` |
| 3 | any folder, `…\<name>\` | images + `gallery.json` + `viewer\` | build | **new** `containers\<name>\` | as above, with `viewer\` copied in ("old address kept") |
| 4 | a container, `…\<name>\` | `<name>\` images + `viewer\viewer.html` | refresh, migrate | **the same folder** | `light-table\` added, `viewer\viewer.html` replaced by the forward, images and titles kept |
| 5 | a container, `…\<name>\` | `<name>\` images + `light-table\` | refresh | **the same folder** | page and assets refreshed, `gallery.json` reindexed, no `viewer\` added |
| 6 | a container, `…\<name>\` | as 5, plus a `viewer\` forward | refresh | **the same folder** | as 5, `viewer\` left exactly as it was |
| 7 | `…\<name>\` with one image subfolder, no page | `<name>\` images only | refresh, create page | **the same folder** | `light-table\` created beside the images; nothing moved |
| 8 | the image subfolder of a container, `…\<name>\<name>\` | images | refresh (parent) | **`…\<name>\`**, the parent | the container is updated as in 5 or 6 |
| 9 | a working folder, `…\workspace\` | one image subfolder under a different name, plus `light-table\` and/or `viewer\` | build under the gallery's own name | **new** `containers\<image folder name>\` | a proper container (as 3), built from that subfolder |

A folder like case 9 is not a container, because a container's image folder carries
the container's name. The batch therefore builds the gallery under the name of its
image folder — `slide shows\kodachrome\` produces `containers\kodachrome\`, not
`containers\slide shows\` — and copies any `viewer\` forward from the working folder.

## Reading the table

- **Cases 1–3 copy.** The folder you point at is only read; the container is built
  under `containers\`. Your originals stay where they are.
- **Cases 4–8 update in place.** The folder you point at *is* the destination.
- **An image folder always builds to `containers\<name>`**, wherever it sits — including
  when it sits inside `containers\`. The one exception is a folder that *is*
  `containers\<name>`: it is completed in place, because building would delete it
  first. Building directly into the folder you gave is refused with that message.
- **Cases 1–3 replace an existing container.** Building into `containers\<name>` clears
  that folder first, so anything not in the source is lost.
- **A copy outside `containers\` is a separate gallery.** Refreshing it updates only that
  copy; nothing appears in `containers\`, and nothing is kept in step automatically.
- **The container is named after the input folder.** A folder called `colours`
  produces `containers\colours`, replacing any container already there.
- **Images are never altered.** They are copied byte for byte; the only file
  written beside them is `gallery.json`.
- **`dist\` is refused.** `npm run build` empties it, so the batch stops if the
  folder is inside it.
- **Several subfolders and no loose images** is not treated as a container: the
  batch cannot tell which subfolder holds the gallery, so it builds instead and
  finds no images, and says so.

## Output you can check

Build (cases 1–3):

```
Container folder: C:\…\containers\<name>
  images taken from: C:\…\<your folder>
  N images, X MB
  light-table/index.html
  <name>/gallery.json
  viewer/ (old address kept)      <- only when case 3
```

Refresh (cases 4–8):

```
Container: C:\…\<name>
  page:    light-table\index.html (created | updated | migrated)
  old link: viewer/viewer.html now forwards to light-table/   <- migration only
  images:  <name> (N)
  kept:    N
  added:   N
  removed: N
```
