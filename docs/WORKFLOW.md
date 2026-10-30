# Workflow

**Status: working draft.** This is being written; it is not linked from the README
yet. Steps marked **[[ to write ]]** are still to be filled in, and the list at the
end collects everything still missing.

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
12. **See the section on adding images.** **[[ to write ]]**
13. **Any change uses the active repository version of the image folder** — never
    the original download, never the copy in `containers\`.

## Hooks still to write

These are the places where the workflow needs detail before it is published:

- **Updating an active gallery** — the full procedure: which files are replaced,
  when the page needs refreshing, how to check it before uploading. **[[ to write ]]**
- **Adding photographs** (step 12): upload the file with its entry, or rebuild.
- **Removing photographs**: the entry goes, the file can stay.
- **Changing titles or order** without a rebuild, and when a rebuild is better.
- **Versions and rollback**: which zip to keep, how far back, how to restore.
- **The old address** (`/viewer/`): which galleries need the forward and when it
  can be dropped.
- **What to check before uploading**: the local preview, and the two addresses.
- **What goes wrong**, in one table: no images, wrong name, cached picture, broken
  entry.

## Notes to self

- The container in `containers\` is disposable; the repository copy is the master.
- `gallery.json` is the only thing the light table reads to decide what to show.
- A rebuild recreates the container, so anything not in the image folder is lost
  from `containers\<name>` on every pass.
- Upload only what changed when the change is small; rebuild every time so the
  copies stay in step.
