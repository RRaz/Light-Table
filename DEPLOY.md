# Looking after the galleries

Notes for whoever maintains them. Nothing here needs programming: it is about
folders, and about which ones to copy where.

For the whole routine start to finish, including the steps that come after a gallery is live, see [docs/WORKFLOW.md](docs/WORKFLOW.md) (working draft).

## The pieces

| Piece | Where | What it is |
|---|---|---|
| **A container** | `containers\<name>\` | One gallery, ready to upload. Named after the gallery. |
| **`containers\`** | in the project | Where every gallery is built, one folder each. Never uploaded from here. |
| **The image folder** | inside a container | The photographs, plus `gallery.json`, the list that says what appears and in what order. |
| **Your repository** | wherever you keep it | Your master copy of a container. It can also hold the old-address forward and any notes. |

```
<name>\
  light-table\      what visitors see: the light table itself
  <name>\           the photographs and gallery.json
  viewer\           optional: keeps an old web address working
```

## Building a gallery

Drop an **image folder** — a folder with photographs in it — on
`Light-table.bat`. That is the only thing the batch accepts.

- It always builds the gallery in `containers\<name>`, replacing whatever was there.
- If the image folder is outside `containers\`, `gallery.json` is copied back into
  it, so the list stays with your photographs.
- Drop a container by mistake and it stops, telling you which image folder to use.

## Two ways to rebuild

**1. From inside `containers\`** — for one gallery, on its own.
Drop `containers\<name>\<name>\`. The container is rebuilt, and anything else you
had put in `containers\<name>` is gone. Nothing outside `containers\` changes.

**2. From an image folder outside `containers\`** — when you keep a copy elsewhere.
Drop the image folder of your repository copy. The gallery is built in
`containers\<name>`, the list is copied back, and if that copy is a proper container
its light table and old-address forward are updated too, so it still works.

## Why the outside `gallery.json` matters

The `gallery.json` beside your photographs is where a gallery is arranged: which
photographs, their order, their captions. You can spend days on it. The next build
reads it and carries those choices into the container.

So the usual rhythm is: build once to get a working gallery, arrange the list at
your leisure, build again when you are ready, and copy the container out only when
you need it.

## What a rebuild keeps, and what it removes

A rebuild recreates the container from scratch:

- the light table itself
- the image folder
- the list

Anything else in `containers\<name>` goes. That is on purpose: the container is the
copy you upload, not the place to keep notes. Keep extras in your repository copy.

## Uploading

Upload the container folder, so it lands on the site as `/<name>/`. Visitors open
`/<name>/light-table/`.

For a small change you do not need to send everything again:

| You changed | Upload |
|---|---|
| A caption, the order, or removed a photograph | `gallery.json` |
| Added a photograph | that photograph, and `gallery.json` |
| Replaced a photograph, same name | that photograph |
| Moved, renamed or added several photographs | rebuild first, then upload the container |

Then hard-refresh the gallery in the browser. Do not edit the copy that is on the
site on its own: your local copy and your repository would then disagree with it,
and the next rebuild would quietly restore the older list.

## After it is live

- Adding, removing or renaming photographs means rebuilding, then uploading the
  changed files.
- Replacing a photograph with one of the same name needs no rebuild: upload the new
  file over the old, then hard-refresh. Browsers can hold on to the old picture
  because its address has not changed.
- The light table reads `gallery.json` every time it loads. It does not go looking
  in the folder, so a photograph with no entry never appears.

Backups are simple dated zips of the container you uploaded. One step back is
usually enough; rolling back means replacing the live folder with that zip.

## Old web addresses

Galleries published before the rename are still reached at
`/<name>/viewer/viewer.html`. Their `viewer\` folder, kept in your repository copy,
sends visitors on to the new address. Keep it when you upload. New galleries need
nothing of the sort.

## A quick look before uploading

```sh
cd containers
python -m http.server 8000
```

Open `http://localhost:8000/<name>/light-table/`. What you see here is what the site
will show.

## If something is wrong

| What you see | What it usually means |
|---|---|
| "Not an image folder" | you dropped a container; drop the image folder inside it |
| "Unable to load gallery" | `gallery.json` is missing or has a typo in it |
| A broken picture | the list names a file that is not there, or the name differs in capital letters |
| An old picture or caption | the browser is showing a cached copy; hard-refresh |
| Nothing changed | the files were uploaded, but the list was not |

## Repair commands

Only needed when something went wrong; the batch covers the normal work.

| Command | Purpose |
|---|---|
| `npm run refresh -- --container "<folder>"` | rewrite the light table and reindex the list in a container, leaving everything else alone |
| `npm run forward -- --container "<folder>"` | put the old-address forward back into a container |
