# Workflow

**Status: working draft.** Steps marked **[[ to write ]]** are still to be filled in;
the list at the end collects what is missing.

The idea behind it: one image folder goes in, one container comes out, and the
repository copy becomes the version you keep working from.

## Building a gallery

1. **Put the images in a folder named after the slide show.** The folder name
   becomes the gallery name, the address and the heading above the photographs.
2. **Optional — rename the files to be more informative**, or batch-rename them
   with a sequence number. This is worth doing here: the file name becomes the
   caption, and the numbers decide the order before you ever open the list.
3. **Drop the folder on `Light-table.bat`.**
   The gallery is built in `containers\<name>\`, and `gallery.json` is copied back
   beside your images.
4. **Open `gallery.json` in the image folder** and edit the order and the titles if
   you want. This is where step 2 pays off: sorting and captions are already close.
5. **Save** the file.
6. **Repeat 3 and 4 until you are satisfied.** Each pass rebuilds the gallery and
   copies the list back out, so your edits are what the next build reads.
7. **Copy the container folder from `containers\` into a repository / library.**
   That copy is the one you keep, and it is the one you will work from later.
8. **Add any extras you want** inside the repository copy. A landing page at the
   container root, a note, a redirect — your choice, and nothing is required. They
   live in the repository copy, because a rebuild strips extras from
   `containers\<name>`.
9. **Zip the container and rename the zip with a version number.**
10. **Upload it to your website.**
11. **Unzipping on the server creates the web page.**
12. **Adding and removing photographs** — see below.
13. **Any change uses the active repository version of the image folder** — never
    the original download, never the copy in `containers\`.

## Where the image folder can live

Anywhere. On the desktop, on another drive, inside the project, or inside a
repository container. The batch looks at what is in the folder, not where it is.

The only distinction that matters is what you drop:

| You drop | What happens |
|---|---|
| a folder with images at its top level | it is built into `containers\<name>` |
| a folder whose images are one level down | it has no images at the top level, so nothing is built |

There is no special folder and no special place. The `viewer\` folder is not a
marker of any kind: it is just a folder holding one redirect file, added at the
repository stage when an old web address has to keep working.
## The two copies

The container in `containers\<name>` tracks the working copy — the same
photographs, the same list, the same light table — but it is **stripped of
anything extra** you have added to the repository copy.

| | `containers\<name>` | The repository copy |
|---|---|---|
| Photographs and list | yes, current | yes, current |
| The light table | yes | yes |
| Extras (the `viewer\` forward, notes, anything else) | no - removed on every rebuild | yes, kept |
| Role | the clean gallery | the copy you work from, and upload when extras must go live |

One more thing about the folder around the images: it only counts as a container if
it carries the gallery's name. A folder called `slide shows` holding
`slide shows\kodachrome\` is not one — its light table would look for a gallery that
is not there. In that case the build writes only `gallery.json` and says so, and
leaves whatever else is in that folder alone.
So the extras live in one place only: the repository. If you add a redirect folder
or a notes file, add it there, and upload the repository copy when you need it live.

Extras are not limited to the redirect. A helper page is a good example: an HTML
file that opens in the browser and edits the gallery list for you - adding an entry,
changing a title - could sit in the repository container beside the gallery and be
opened by its own link. It never travels into `containers\<name>`, so a rebuild
cannot break it, and the gallery you upload stays clean.

The simplest extra is a **story page**: a small `index.html` in the repository
container that describes the photographs and links to the gallery at
`/<name>/light-table/`. Visitors arriving at `/<name>/` read the story first, then
step into the light table. It costs nothing, it is the same folder you already keep,
and it survives every rebuild because it lives in the repository rather than in
`containers\<name>`.

A ready-made one is in the project at `examples/story-page.html`: copy it into the gallery folder as `index.html` and change the words.

Where each extra goes, and the address it gets on the site:

| Extra | Put it in | Visitors reach it at |
|---|---|---|
| Story page | the repository container, as `index.html` | `/<name>/` |
| Old-address forward | `viewer\` in the repository container | `/<name>/viewer/viewer.html` |
| Notes or other files | any folder you like in the repository container | the same path under `/<name>/` |
| Gallery itself | the image folder and the light table | `/<name>/light-table/` |

All of it lives in the repository container, and it reaches the site only when you
upload that folder. Nothing in `containers\<name>` carries any of it.

## Adding a photograph

Two ways, and both are legitimate.

**By rebuilding.** Put the file in the repository image folder, drop that folder on
the batch, then upload:

- the new photograph
- `gallery.json`
- `light-table\` if the light table itself changed

The new photograph is added at the end of the order; edit `gallery.json` to move it.

**By hand, without a rebuild.** Copy the last block in `gallery.json`, change
`id`, `url` and `title` to match the new file, and save. Upload the photograph and
`gallery.json`. Nothing else changes.

Rebuilding is the safer choice when you are adding several at once, or when the
file names changed as well.

## Removing a photograph

Delete its block from `gallery.json` and upload the list. The image file can stay
on the server — nothing points at it — or be deleted for tidiness.

If you remove the file but leave its block, the gallery shows a broken picture:
the block names a file that is not there.

**Moving an entry:** take the whole block, from its `{` to its `},`. Every block
except the last ends with a comma; the last has none. A block moved without its
comma - or with one too many - makes the list unreadable, and the light table then
says *Unable to load gallery*.

## The list's shape

The file is one object holding the time it was written and the photographs:

```json
{
  "updated": "2026-10-29T23:12:05.766Z",
  "photos": [ { "id": "01-red", "url": "./01-red.png", "title": "Red" } ]
}
```

Keep the outer braces, the `"photos":` name and the square brackets. Between the
brackets go the photograph blocks, each of which can be changed as follows:

| Part | What it does |
|---|---|
| `title` | the caption under the photograph |
| `url` | which file the entry shows; the file name with `./` in front |
| `id` | the entry's own name; no two entries share one |
| block order | the order the photographs appear in |
| adding or removing a block | adding or removing a photograph |

`updated` is written by the build on every run. Nothing reads it, so leave it as
it is.

The look of the light table is not in this file. It is in `light-table\` and is
replaced, not edited.

## Updating only the gallery list

Retitling, reordering or removing an entry is a list change: edit `gallery.json`,
upload that one file, and hard-refresh the page. The photographs and the light
table are untouched.

This is the only upload needed for:

- a title change
- a different order
- an entry removed

Renaming the photograph itself is not a list change. The entry names a file, so a
renamed file is a file the list does not name: the next rebuild drops the old entry
and adds a new one, captioned with the new file name. Do it in the image folder and
rebuild, or change `url` by hand as well.

## Renaming a gallery

Renaming the image folder inside the container starts a new gallery. The build
makes `containers\<new name>` and leaves `containers\<old name>` as it was. The old
page still looks for the old name, and the folder around it no longer matches, so
the build says *no outside container found* and writes only the list.

To rename one properly: rename the folder, rebuild, delete the old container, and
delete the old copy on the site. Both copies are live until you do.

## The loop, once the gallery is live

1. **Check the site first.** Open `/<name>/light-table/` and
   `/<name>/viewer/viewer.html`. Both must work before anything changes; a change
   made on top of a broken site tells you nothing.
2. **Make the change in the repository copy**, in `Repo\<name>\<name>\`.
3. **Send what changed, and remove what is gone.** Uploading the whole container is
   the simpler route and the default; single files are for a small change. The order
   matters when a photograph leaves:
   - added: upload the photograph, then `gallery.json`
   - removed: remove its entry and upload `gallery.json` **first**, then delete the
     photograph from the site
   - retitled or reordered: `gallery.json` only

   Uploading files never removes anything: a photograph deleted from the repository
   is still on the site until you delete it there.

   The list goes first so that no visitor is shown a frame whose file has already
   gone.
4. **Hard-refresh (Ctrl+F5)** and watch the slide show. If the change appears, the
   site and the repository copy agree, and that state is worth a version zip. Make
   it from the repository copy.

**Updating from a zip instead:**

1. **Keep or drop the zip already on the server.** To keep it, rename it, so the new
   one is not confused with it.
2. **Upload the new zip** to the level **above** the gallery folder. Its name already
   carries the version.
3. **Delete the gallery folder** on the server.
4. **Extract the new zip**, then hard-refresh.
5. **Optional — store or remove the zip according to your own security protocol.**

Upload the zip outside the gallery folder: a zip inside it is deleted along with it in
step 3. Extracting over a folder only merges, so deleting first is what leaves the
site matching the zip.

A change that does not appear is usually the browser cache, not the upload.

After the first build the page stays the same. `light-table\` does not change between
versions, so what a later version holds differently is the image folder — the
photographs and `gallery.json`. A rebuild is only needed when you want the list
regenerated from the files.

## Updating an active gallery

The routine for a gallery that is already live:

1. Work on the **repository** copy, in its image folder.
2. Add, remove or rename photographs, and edit `gallery.json`.
3. Drop that image folder on the batch. It rebuilds `containers\<name>` and copies
   the list back to the folder you dropped. The repository copy also gets its light
   table and `viewer\` forward refreshed, so it still runs.
4. Check it locally if you want — see the preview step in `DEPLOY.md`.
5. Upload what changed, not necessarily the whole container:

   | Changed | Upload |
   |---|---|
   | captions, order, entry removed | `gallery.json` |
   | one photograph added | that photograph, and `gallery.json` |
   | one photograph replaced, same name | that photograph only |
   | several files added or renamed | the whole container |
   | the light table itself | `light-table\`, in every gallery |

6. Hard-refresh the live page (**Ctrl+F5**). A cached list or picture is the usual
   reason a change "did not appear".

Never edit the copy that is on the site as the only change: your repository and
`containers\` would then disagree with it, and the next rebuild would restore the
older list.

## Versions

A zip is a **frozen state of the working version** — a snapshot, the same way you
save a document while you are still writing it. The working copy carries on
changing; the saved copy does not.

That frozen copy can be used three ways, and they do not conflict:

- go back to it if a change goes wrong;
- keep working from it, or hand it to someone else;
- upload it as it stands.

There are three states, and they do not move together:

| State | Where it lives | When it changes |
|---|---|---|
| What you are working on | the active repository, the image folder on your desktop | whenever you edit |
| What the website shows | the server | only when you upload |
| A version | the zip you chose to keep | only when you make one |

The working copy is always ahead of the other two: your latest titles and
photographs are in the repository. The website changes only when you upload the
changed files or a whole container, and a zip changes only when you decide a
version is worth keeping.

**When to make one:** before a significant change, or when a gallery is in a state
you would want back or want to work from. That is a judgement call, not a schedule.

**What to keep:** a dated or numbered name, e.g. `light-table-kodachrome-v3.zip`,
one or two back is usually enough, and keep them off the public web root.

**To update from a zip, or roll back:** delete the gallery folder on the server,
upload the zip, extract it at the level above the gallery folder, and hard-refresh.

Deleting first is what makes the site match the zip. Extracting over a folder only
merges: a photograph added after the zip was made would stay on the site. The
repository working copy is unaffected — roll the desktop copy back the same way if
you want the two to agree again.

### Uploading a version zip

The zip holds one folder, named after the gallery. Extract it at the level **above**
that folder: the result must be `/<name>/light-table/`, not
`/<name>/<name>/light-table/`.

Then deal with the zip as your own security protocol requires. A zip in a published
folder can be downloaded by anyone who knows its name, which hands over every
photograph in the gallery at once.

A zip on the server is a restore point, not a copy of the site. Upload a single
file to the live gallery afterwards and the site is newer than the zip — still a
good restore point, no longer the same thing.
## Hooks still to write

- **The old address** (`/viewer/`): which galleries need the forward and when it
  can be dropped.
- **What to check before uploading**: the local preview, and the two addresses.
- **What goes wrong**, in one table.

## Notes to self

- The container in `containers\` is disposable; the repository copy is the master.
- `gallery.json` is the only thing the light table reads to decide what to show.
- A rebuild recreates the container, so anything not in the image folder is lost
  from `containers\<name>` on every pass.
- Upload only what changed when the change is small; rebuild every time so the
  copies stay in step.
