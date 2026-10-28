# Light Table — user guide

> **Draft.** The introduction, feature list, screen capture and the example link
> are marked below and still to be supplied.

## 1. What Light Table is

[[ INTRODUCTION — to be written ]]

## 2. What it does

[[ FEATURES — to be written ]]

## 3. See it running

[[ EXAMPLE LINK — address of the live example on rraz.ca ]]

[[ SCREEN CAPTURE — image or short recording ]]

## 4. What you receive

One zip containing a single folder, named after the gallery:

```
catalog/
  viewer/
    viewer.html
    assets/
  catalog/
    gallery.json
    01-first-photo.jpg
    02-second-photo.jpg
```

- `viewer/` is the app. It is the same in every gallery and is not edited.
- the inner folder, with the same name, holds your images and `gallery.json`.
- nothing else is required: no database, no server code, no install step.

The two folders must keep those names and that relationship. `viewer/` looks for
the gallery beside it.

## 5. Where it goes on your website

Upload the folder to the top level of the site, so the page ends up at:

```
https://yoursite.com/catalog/viewer/viewer.html
```

The folder name is also the heading shown above the photos. Hyphens become
spaces: `lake-simcoe` is shown as **Lake Simcoe**.

This needs ordinary static file hosting — FTP, a control-panel File Manager, or
any host that lets you upload folders. A page builder that only accepts images
and text (Squarespace, Wix, a hosted WordPress blog) cannot host it, because
there is nowhere to put `viewer.html` and `assets/`.

## 6. Installing

**Option A — zip (recommended).** Upload `catalog.zip` with the File Manager or
FTP, then use the host's **Extract** command. Check that the extracted folder has
`viewer/` and `catalog/` side by side inside it, then delete the zip.

**Option B — file by file.** Create the folder, then upload the contents so the
structure in section 4 is reproduced exactly. Uploading `viewer.html` without its
`assets/` folder gives a blank frame.

**Check it:** open the address from section 5. If the photos appear, it is
installed.

**When it is not at the top level**, for example
`https://yoursite.com/photo/catalog/`, it still works; only the address changes.

## 7. Opening it

```
https://yoursite.com/catalog/viewer/viewer.html
https://yoursite.com/catalog/viewer/viewer.html?gallery=/catalog
```

Both open the same gallery. The `?gallery=` form is the explicit one and is the
safer choice when the viewer is embedded in another page or loaded from a
different folder; without it the viewer works out the gallery from its own
address.

## 8. Changing the gallery

There are two routes: send the folder back to be rebuilt, or edit it on the
server without any tools. Both touch the same two things:

- the images, in `catalog/catalog/`
- the list, `catalog/catalog/gallery.json`

A `gallery.json` entry looks like this:

```json
{
  "id": "01-first-photo",
  "url": "./01-first-photo.jpg",
  "title": "First photo"
}
```

`url` is the file name with `./` in front. `title` is what appears under the
photo.

### 8.1 Titles come from the file name

The simplest way to change a caption is to rename the file. `01-dawn.jpg` becomes
**01 dawn**; rename it to `Dawn over the lake.jpg` and the caption becomes
**Dawn over the lake**. Spaces, capitals and punctuation in the file name are
kept as typed.

If the title was set by hand in `gallery.json`, the file name must still match
`url`. Renaming the file breaks that link, and the entry is dropped on the next
rebuild.

### 8.2 Order

The order of the blocks in `gallery.json` is the order shown, so there are two
ways to arrange a gallery:

- **By rebuilding:** number the files `01-`, `02-`, `03-` and rebuild. Sorting is
  natural, so `2-` comes before `10-`.
- **By hand:** move the blocks in `gallery.json` into the order you want. The file
  names do not matter for this.

One trap: renaming a single file makes it a new entry, and a rebuild appends new
entries at the end. Rename all of them, or fix the order by hand afterwards.

### 8.3 Adding a photo

- **Rebuilding:** drop the file into the image folder and rebuild. It is added at
  the end, then can be moved.
- **By hand:** copy the last block in `gallery.json`, change `id`, `url` and
  `title` to the new file, and move the block to where it should appear. Upload
  the image as well.

### 8.4 Deleting a photo

Delete its block from `gallery.json` and delete the image. Do both: an entry
pointing at a missing file shows a broken photo, and an image with no entry never
appears.

### 8.5 More than one gallery

Each gallery is a self-contained folder with its own `viewer/`. They are updated
independently, and one gallery can be replaced without touching another.

## 9. Updating a live gallery

1. Keep a copy of the current folder before changing anything.
2. Replace the images and `gallery.json` (or replace the whole folder).
3. Open the page and hard-refresh (**Ctrl+F5**). Browsers cache `gallery.json`,
   so an old list can survive a normal reload.
4. If an image still shows the old version, its file name is the cache key —
   renaming the file forces the new one to load.

## 10. Versions and rollback

Name each build with a date, for example:

```
light-table-catalog-v2026-10-28.zip
```

- Keep the current zip and the one before it.
- To roll back: delete the gallery folder on the server, upload the previous zip
  and extract it.
- Keep zips out of the public web root, or delete them after extracting. A zip
  sitting on the server can be downloaded by anyone who guesses the name, and it
  contains the whole gallery.

## 11. If something is wrong

| What you see | What it usually means |
|---|---|
| "Unable to load gallery" | `gallery.json` is not where the viewer expects it; check the two folder names |
| A blank frame | `assets/` was not uploaded beside `viewer.html` |
| Some photos missing | They are not listed in `gallery.json`, or the file name case differs from the entry |
| An old photo, or an old title | Browser cache — hard-refresh, or rename the file |
| Works on your computer, not online | Paths are relative; check that the inner folder was uploaded too |

## 12. Still to decide

- **How does the recipient update their site?** FTP, control panel, or a builder
  that cannot host files at all. The answer changes section 6.
- **Who rebuilds after new photos**: the recipient, or you on their behalf. If it
  is you, sections 8.2 to 8.4 can shrink to "send the folder back".
- **One zip per gallery, or one app plus their images.** Per gallery is simpler
  for the recipient; one app means a bug fix is uploaded many times.
