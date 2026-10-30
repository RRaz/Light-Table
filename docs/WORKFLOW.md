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
8. **Experts only — add extra folders inside the container** if your workflow needs
   them. (I add a redirect folder.)
   Note: the redirect is the `viewer\` forward. It belongs in the **repository**
   copy, because a rebuild strips extras from `containers\<name>`.
9. **Zip the container and rename the zip with a version number.**
10. **Upload it to your website.**
11. **Unzipping on the server creates the web page.**
12. **Adding and removing photographs** — see below.
13. **Any change uses the active repository version of the image folder** — never
    the original download, never the copy in `containers\`.

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

## Updating only the gallery list

Renaming, reordering or retitling is a list change: edit `gallery.json`, upload
that one file, and hard-refresh the page. The photographs and the light table are
untouched.

This is the only upload needed for:

- a title change
- a different order
- an entry removed

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

## Hooks still to write

- **Versions and rollback**: which zip to keep, how far back, how to restore.
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
