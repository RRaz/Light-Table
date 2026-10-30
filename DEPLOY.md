# Deploying a gallery

For whoever maintains the galleries. Recipients do not need this file; they get
[docs/USER-GUIDE.md](USER-GUIDE.md) with the package.

## The words used here

| Term | Example | What it is |
|---|---|---|
| **`containers\`** (plural) | `light-table\containers\` | The project folder where every gallery is built, one subfolder each. Never uploaded from directly. |
| **A container** (singular) | `containers\colours\` | One gallery, ready to upload: `light-table\`, `<name>\`, and whatever else you keep there. |
| **Image folder** | `D:\photos\colours\` | A folder of images at its top level, optionally with a `gallery.json`. This is the only thing the batch accepts. |

Inside a container:

```
<name>\
  light-table\        the page: index.html and assets\
  <name>\             the photographs and gallery.json
  viewer\             optional: forward for the old /viewer/ address
```

A container is defined by what is inside it, not by where it is.

## Two ways to rebuild

Both build the slideshow in `containers\<name>`. They differ in what is touched.

**1. From inside `containers\` — the slideshow only**

Drop the image folder of a container, for example
`containers\kodachrome\kodachrome`.

- `containers\kodachrome\` is rebuilt: `light-table\` and `kodachrome\`.
- Anything else in it — the `viewer\` forward, a notes file — is deleted.
- Nothing outside `containers\` changes.

**2. From an image folder outside `containers\` — an outside container you keep**

Drop the image folder of the copy you keep elsewhere, for example
`D:\repository\kodachrome\kodachrome`.

- The slideshow is built in `containers\kodachrome\`.
- The outside container is updated too: its `light-table\` page and its `viewer\`
  forward are replaced, and `gallery.json` is written into the image folder you
  dropped. Page and gallery must match, or the copy outside does not run.
- Its other folders and files are left alone, so extras you keep there survive.

A container itself is **not** an input. Drop one and the batch stops and names the
image folder to use instead.

## Why the outside gallery.json matters

The `gallery.json` written back beside the source images is the place to curate a
gallery: add entries, set titles, put the photographs in the order you want, all
without a container to run.

The next build reads that file and carries the titles and order into the
container, so the sequence can be spread over days:

1. drop the image folder once — a working container appears, and `gallery.json`
   comes back beside your images;
2. edit titles and order in that `gallery.json` at your leisure;
3. drop the folder again when you are ready — the container takes on the order and
   titles you set;
4. copy the container out only when you actually need a runnable copy.

Edits flow one way: outside to inside. Changing `gallery.json` in the container
does not write back out, so keep curating in the copy beside your images.



## A workflow that uses both places

1. **First build.** Start with an image folder, anywhere. Drop it on
   `Light-table.bat`. The result is `containers\<name>\`, and that first build is
   the one to keep. If there is no container outside yet, the build says so and
   names the folder to copy: it writes only `gallery.json` out there, never a
   page. If the gallery was published at the old `/viewer/` address, add the
   forward once with `npm run forward -- --container "<outside container>"`.
2. **Copy it to your repository.** Move or copy `containers\<name>` to wherever you
   keep the master copy — your repository. That copy can hold extras such as the
   `viewer\` forward or a notes file, which never belong in the build.
3. **The original image folder becomes the backup, or is deleted.** Its
   `gallery.json` has been updated, so it is in step with the build.
4. **Later updates.** Copy the repository's image folder into `containers\<name>\`,
   or drop the repository's image folder on the batch: it rebuilds
   `containers\<name>`, and its `gallery.json` is copied back to the folder you
   dropped. Upload the rebuilt container, then copy it back to the repository if
   you want the master to carry the new page.

## What a rebuild does to what is already there

A build recreates the container folder. Only these are written:

- `light-table\` — the page
- `<name>\` — the images and `gallery.json`

**Anything else in `containers\<name>` is deleted.** That is deliberate: the build
is the delivery copy, stripped of extras. Keep the `viewer\` forward, notes and
anything else in your repository copy, not in the build.

## Editing the manifest by hand

A rebuild is not the only way. The page reads `gallery.json`, so adding or removing
an entry is enough:

- **Add:** copy the last block, change `id`, `url` and `title` to the new file, and
  upload the image.
- **Remove:** delete the block. The image file can stay; nothing references it.
- **Retitle or reorder:** edit `title`, or move blocks.

Use a rebuild when the files themselves change — many additions, or renames — because
it derives the entries from what is on disk. Hand-editing is quicker for one or two
changes, with two traps: `url` must match the file name exactly, including case on
Linux hosts, and `id` must be unique. A wrong `url` shows a broken image rather than
an error.
## Uploading a small change

Rebuild as usual — that keeps `containers\`, your repository copy and the live site
in step. What you can skip is the full upload: the whole container with all its
images does not need sending again.

| Change | Upload |
|---|---|
| Title, order, or an entry removed | `gallery.json` |
| One photograph added | that image, and `gallery.json` |
| One photograph replaced | that image only |
| Change to the viewer itself — layout, styles, labels, help text, branding | `light-table\`, in every container |

The last row is the odd one: it is a change to the project's code, not to a gallery.
`light-table\` holds the page — its markup, styles and script, and every word shown
inside it, from the help panel to the header. Each container carries its own copy,
so a wording change is applied by rebuilding each gallery and uploading its
`light-table\`.
Then hard-refresh the page. Editing the live `gallery.json` alone is the one route
to avoid: the server then holds a list that neither `containers\` nor your
repository knows about, and the next rebuild silently restores the older one.

## Building several galleries

Drop each image folder in turn. Each becomes `containers\<name>`; names must
differ, because a second folder of the same name replaces the first.

```bat
for /d %D in ("D:\shoots\*") do Light-table.bat "%D"
```

(The same line in a `.bat` file needs `%%D`.)

## Order and titles

- The order of blocks in `gallery.json` is the order shown.
- Numbering files `01-`, `02-` gives that order when the list is built from
  scratch. Sorting is natural, so `2-` before `10-`.
- A renamed file counts as a new photograph and is appended at the end.
- A caption comes from the file name. A title set by hand in `gallery.json`
  survives only while its file name does.

## Old links

Galleries published before the rename are addressed as
`/<name>/viewer/viewer.html`. Their `viewer\` forward lives in the repository copy
of the container, so it survives a rebuild elsewhere. When you upload, include it.

New galleries need no forward: nothing was ever published at the old address.

## After it is live

Once a gallery is deployed, the same method carries on: curate outside, rebuild in
`containers\`, deploy from there. What an update actually touches:

| Change | What changes in the container |
|---|---|
| Titles or order | `gallery.json` only |
| A photograph added or removed | `gallery.json`, plus that file in the image folder; the other images are untouched |
| A photograph replaced, same file name | that image file only; `gallery.json` and the page stay as they are |
| Page or wording change | `light-table\` — the same folder in every container |

A replaced photograph needs no rebuild at all: upload the new file over the old one.
The browser may keep showing the previous version because the address has not
changed — a hard refresh usually settles it, and renaming the file settles it for
good at the cost of a new `gallery.json` entry.
The page fetches `gallery.json` each time it loads, but it does not look at the
folder: an image file with no entry never appears. Adding a photograph therefore
means rebuilding, or adding its entry to `gallery.json`. A cached manifest can
also hide a change, which is why a hard refresh is part of checking an update.
Images are copied byte for byte and never rewritten, so re-uploading a whole
container is safe; uploading just `light-table\` and `gallery.json` is quicker when
nothing else moved.

Backups work the same way throughout: keep a dated zip of the deployed container
(see **Versions**), one step back is usually enough, and rolling back means
replacing the live folder with the previous zip.

## Space

`containers\<name>` holds the result of the most recent build and nothing older.
Delete a container once it is uploaded and copied to the repository; the images
themselves are never altered, only copied, and the only file written beside them
is `gallery.json`.

## Versions

Keep dated zips of what was uploaded:

```
light-table-<name>-v2026-10-30.zip
```

Rollback means deleting the live folder, uploading the previous zip and extracting
it. Keep zips out of the public web root.

## Local preview

```sh
cd containers
python -m http.server 8000
```

Then open `http://localhost:8000/<name>/light-table/`. See
[LocalSERVER.txt](LocalSERVER.txt).

## Manual commands

The batch covers the normal path. These do one job each when needed:

| Command | Purpose |
|---|---|
| `npm run refresh -- --container "<folder>"` | rewrite `light-table\` and reindex `gallery.json` in an existing container, leaving everything else alone |
| `npm run forward -- --container "<folder>"` | write the old-address forwarding page into a container |

## Notes

- `npm run build` empties `dist\`, so never work inside it — the batch refuses.
- Only images, `gallery.json` and (if you use the manual command) the forward are
  ever written by the build.
- The sample gallery in `public\galleries\colours` exists to test the light table.
