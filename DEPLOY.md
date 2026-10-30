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

## One rule

**Drop an image folder; it is built into `containers\<name>`, always.**

- The image folder can be anywhere: in the project, on another drive, on the
  Desktop.
- An existing `containers\<name>` is replaced by the new build.
- A container is **not** an input. Drop a container and the batch stops and tells
  you which image folder to use instead.

When the image folder is **outside** `containers\`, the new `gallery.json` is
copied back into it. That is the only thing outside `containers\` that changes:
titles and order stay with your source images. Nothing else is written there — no
page, no viewer.

## A workflow that uses both places

1. **First build.** Start with an image folder, anywhere. Drop it on
   `Light-table.bat`. The result is `containers\<name>\`, and that first build is
   the one to keep.
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
