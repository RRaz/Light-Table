# Deploying a gallery

For whoever maintains the galleries. Recipients do not need this file; they get
[docs/USER-GUIDE.md](USER-GUIDE.md) with the package.

## Start here

Each gallery is wrapped into a **container** with the same name as the gallery.
The container is one folder holding everything the site needs for that gallery:

```
<name>\
  light-table\        the page: index.html and assets\
  <name>\             the photographs and gallery.json
  viewer\             optional: the forward for the old /viewer/ address
```

The container for a new gallery is created in the containers folder of the
project — `containers\`, wherever you keep the project on your machine:

```
<project>\containers\
```

Its name comes from the folder you build from: a folder called `colours` produces
`containers\colours\`, holding `light-table\`, `colours\` and, if you supplied one,
`viewer\`.

A later rebuild regenerates the container, and **where the updated container lands
depends on how the batch was run**:

| How you run it | Where the updated container is |
|---|---|
| On a plain image folder, anywhere | `containers\<name>\` — a new container, replacing any container of that name |
| On a container folder — anywhere, including `containers\<name>\` itself | That same folder, updated in place |

So the location follows the input, not a fixed rule: a container does not have to
live inside `containers\`, and one that lives elsewhere stays where it is.

Everything below expands those lines: what each folder is called, how to build
one, how to update one, and what to do when a gallery is already live.

## The words used here

Four folders get called a "container" in conversation. Only one of them is the
container you upload.

| Term | Path | What it is |
|---|---|---|
| **`containers\`** (plural) | `light-table\containers\` | The project folder that holds **every** gallery, one subfolder each. Nothing is uploaded from here; it is the shelf, not a gallery. |
| **A container** (singular) | `light-table\containers\colours\` | **One gallery, ready to upload.** This is the folder you zip and put on the site. |
| **A container elsewhere** | `D:\from-server\shanghai\` | The same thing outside the shelf: a download, or a copy kept for reference. Refreshing updates it where it stands; nothing is copied into `containers\`. |
| **Image folder** | `…\colours\colours\` | The photographs and `gallery.json`, inside the container. |
| **Page folder** | `…\colours\light-table\` | `index.html` and `assets\` — the app that reads the gallery. |

```
light-table\                 project
  containers\                holds every gallery - the shelf
    colours\                 <- a container: this is what you upload
      light-table\           page folder
      colours\               image folder
      viewer\                old-address forward
    portraits\               another container, on the same shelf

D:\from-server\shanghai\     also a container, just not on the shelf
  light-table\  shanghai\  viewer\
```

A container is defined by what is inside it, not by where it is. The shelf is
convenient, not compulsory.

So "a container" is one gallery; "`containers\`" is where all of them live. A
sentence like *"delete the containers folder"* would remove every gallery, while
*"delete the container"* removes one.

## Preferred: put the images in the container folder first, then run

This is the way to work, because everything happens in the folder you are already
looking at — there is no second copy to go and find.

1. Create the container folder if it does not exist yet:

   ```
   containers\<name>\
     <name>\          <- the images go in here
   ```

   The inner folder has the same name as the outer one. `light-table\` is not needed
   yet; the batch creates it.

2. Copy or move the new photographs into `containers\<name>\<name>\`.

3. Run the batch on the **outer** folder — drag it onto `Light-table.bat`, or pass
   the path:

   ```bat
   Light-table.bat "containers\lake-simcoe"
   ```

4. The batch builds the light table, copies `index.html` and `assets\` into
   `containers\<name>\light-table\`, and writes `gallery.json` beside the images.

5. Upload the outer folder as `/<name>/` and open `/<name>/light-table/`.

Nothing is moved to another location, and the printed `Container folder:` line is
the folder to upload.

## Important considerations

These hold over the life of a gallery, whatever procedure you follow for a
particular site:

- **The container is the working copy.** `containers\<name>\` holds the result of
  the most recent run — page, images and `gallery.json` together. Each run replaces
  it; builds do not accumulate.
- **An image folder always builds to `containers\<name>`**, wherever it sits. The
  exception is a folder that *is* `containers\<name>`: it is completed in place,
  because a build would delete it before copying.
- **Building from a plain image folder replaces `containers\<name>` entirely.**
  Anything in the container that is not in the folder you build from is gone
  afterwards.
- **A copy outside `containers\` is a separate gallery.** Refreshing it updates only
  that copy; `containers\<name>` is not touched, and nothing keeps the two in step.
- **Editing means rebuilding and re-uploading.** Adding, deleting or renaming
  photographs reaches the live site only after the batch runs again and the folder
  is uploaded; the page reads `gallery.json`, not the folder.
- **Image files are never altered.** They are copied byte for byte; the only file
  written beside them is `gallery.json`.
- **Captions follow file names.** A renamed file counts as a new photograph, and a
  title set by hand survives only while its file name does.
- **Nothing is pruned automatically.** Containers and zips stay until you delete
  them.

## What the batch decides, by what you give it

| You give it | What happens |
|---|---|
| A folder with images at the top level | Builds a **new** container at `containers\<name>`, copying the images. The original folder is not changed. |
| A container-shaped folder with no `light-table\` | Adds the light table and `gallery.json` in place, in the folder you gave it |
| An existing container, with `light-table\index.html` | Updates the light table and reindexes `gallery.json`; image order and existing titles are kept |
| The image subfolder of a container | The parent container is updated instead |
| A working folder holding one gallery under another name, with a page or forward beside it | That gallery is built under its **own** name in `containers\`, and the forward is carried across |
| Anything inside `dist\` | Refused — `npm run build` empties `dist\` |

Every shape of folder, with its destination, is listed in
[docs/BATCH-INPUT-OUTPUT.md](docs/BATCH-INPUT-OUTPUT.md).

A folder with several subfolders is not treated as a container: the batch cannot
tell which one holds the gallery, and says so rather than guessing.

## Building several galleries at once

The plain-image-folder route is the one to use when you have several shoots to
prepare. Each folder becomes its own container under `containers\`, the originals
are left untouched, and you upload them one at a time when you are ready.

```bat
for /d %D in ("D:\shoots\*") do Light-table.bat "%D"
```

(The same line in a `.bat` file needs `%%D` instead of `%D`.)

Two things to know when doing this:

- **Names must differ.** The container is named after the folder, so two folders
  both called `selects` would collide — the second replaces the first in
  `containers\`. Rename one, or pass a name to the container command directly.
- **The light table is rebuilt for every folder.** That is a few seconds each; it does
  no harm, it is just repeated work.

Preview them all at once with the local server in
[LocalSERVER.txt](LocalSERVER.txt): open `http://localhost:8000/<name>/light-table/`
for each one.

## Updating a gallery that is already live

1. Work on the copy in `containers\<name>\`, not on the live site.
2. Add, remove or rename images in the inner folder.
3. Run the batch on the outer folder.
4. Upload the outer folder again, replacing the old one.
5. Hard-refresh the page (**Ctrl+F5**) — `gallery.json` is cached by the browser.

Titles come from file names, so renaming a file renames the caption. Titles that
were set by hand in `gallery.json` are kept only while the file name stays the
same.

## Converting a gallery downloaded from the server

A gallery taken off the server is usually a flat folder: the images and
`gallery.json`, with no `light-table/`. Three steps turn it into the current
structure.

1. Drag the folder onto `Light-table.bat`, or run it with the path:

   ```bat
   Light-table.bat "D:\from-server\colours"
   ```

   The result is `containers\<name>\` containing `light-table\`, `<name>\` with the
   images and `gallery.json`, and nothing loose at the top.

2. If this gallery was ever published at `/<name>/viewer/viewer.html`, drop a
   `viewer\` folder (with the forwarding `viewer.html`) in beside the images before
   running the batch. It is copied into the container, and the output says
   `viewer/ (old address kept)`. Without it the gallery simply has no old address.

   If you forget, add it afterwards with:

   ```bat
   npm run forward -- --container "containers\colours"
   ```

3. Done. The container is the folder to keep and upload.

Titles and order survive the conversion: the flat folder's `gallery.json` is read
for both before the new one is written.

Two things to know:

- The container is named after the folder you drag in. A flat folder called
  `colours` therefore replaces `containers\colours` — which is what you want
  when converting that gallery, but check the name before dropping it on the batch.
- Only image files, `gallery.json` and a `viewer\` folder are taken from the
  source. A stray `light-table\` folder in the download is ignored and rebuilt.

## Old links keep working

Galleries published before the rename are addressed as
`/<name>/viewer/viewer.html`. When such a container is refreshed, a small
forwarding page is left at that address, so the old link lands on
`/<name>/light-table/` with its `?gallery=` parameter intact. Nothing else is
needed.

If the gallery is already on the site and you have no local copy to refresh,
create `viewer/viewer.html` by hand with this content:

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Image Light Table</title>
<meta http-equiv="refresh" content="0; url=../light-table/">
<script>location.replace('../light-table/' + location.search + location.hash);</script>
</head>
<body>
<p><a href="../light-table/">Open the gallery</a></p>
</body>
</html>
```

This forward is permanent for galleries already published: those links live on
other people's pages and cannot be retired. New galleries need no forward, because
nothing was ever published at the old address. See
[docs/LEGACY-LAYOUT.md](docs/LEGACY-LAYOUT.md) for the detail.

The forward is relative, so it works in a subfolder or at the top level. Keep it
in the container and in the local copy, so a rebuild does not drop it.

## Order of the photographs

- The order of blocks in `gallery.json` is the order on screen.
- Numbering files `01-`, `02-` and so on gives that order when the list is built
  from scratch. Sorting is natural: `2-` before `10-`.
- A renamed file counts as a new photograph and is appended at the end, so rename
  all of them or rearrange `gallery.json` afterwards.

## Uploading

The container folder is the whole site content for that gallery:

```
containers\<name>\
  light-table\index.html
  light-table\assets\
  <name>\gallery.json
  <name>\images...
```

Upload `containers\<name>` so that it lands as `/<name>/` on the server. Zipping
it first and extracting on the host is usually quicker than copying hundreds of
files.

## Space: the container is a working copy

`containers\<name>\` always holds the result of the most recent run — the page,
images and `gallery.json` together. Running the batch again replaces or refreshes
that folder, so it does not accumulate old builds.

The image files themselves are never altered: they are copied byte for byte, and
the only file written beside them is `gallery.json`. A source folder outside the
project is not touched at all.

Once a gallery is uploaded and working, you can delete the container folder to
reclaim the space. The live site keeps its own copy.

Two things to keep in mind before deleting:

- If you placed the images **directly** into `containers\<name>\<name>\` and they
  exist nowhere else, that folder is your only local copy besides the server.
  Keep the shoot in your photo library.
- If the container was built from a plain image folder, the originals were only
  copied, so deleting the container loses nothing.

Containers are not pruned automatically: each one stays until you remove it.

## Versions

Keep dated zips of what was uploaded:

```
light-table-<name>-v2026-10-28.zip
```

Rollback means deleting the live folder, uploading the previous zip and extracting
it. Keep zips out of the public web root — a zip on the server is a downloadable
copy of the whole gallery.

## Local preview

```sh
cd containers
python -m http.server 8000
```

Then open `http://localhost:8000/<name>/light-table/`. See
[LocalSERVER.txt](LocalSERVER.txt) for the same instructions in short form.

## Notes

- `npm run build` empties `dist\`, so never keep working galleries there.
- `containers\` is git-ignored: the images are yours and stay off the repository.
- The sample gallery in `public\galleries\colours` exists to test the light table. It is
  not one of your galleries.
