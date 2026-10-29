# Deploying a gallery

For whoever maintains the galleries. Recipients do not need this file; they get
[docs/USER-GUIDE.md](USER-GUIDE.md) with the package.

## Preferred: put the images in the container folder first, then run

This is the way to work, because everything happens in the folder you are already
looking at — there is no second copy to go and find.

1. Create the container folder if it does not exist yet:

   ```
   containers\<name>\
     <name>\          <- the images go in here
   ```

   The inner folder has the same name as the outer one. `viewer\` is not needed
   yet; the batch creates it.

2. Copy or move the new photographs into `containers\<name>\<name>\`.

3. Run the batch on the **outer** folder — drag it onto `Light-table.bat`, or pass
   the path:

   ```bat
   Light-table.bat "containers\lake-simcoe"
   ```

4. The batch builds the viewer, copies `viewer.html` and `assets\` into
   `containers\<name>\viewer\`, and writes `gallery.json` beside the images.

5. Upload the outer folder as `/<name>/` and open `/<name>/viewer/viewer.html`.

Nothing is moved to another location, and the printed `Container folder:` line is
the folder to upload.

## What the batch decides, by what you give it

| You give it | What happens |
|---|---|
| A folder with images at the top level | Builds a **new** container at `containers\<name>`, copying the images. The original folder is not changed. |
| A container-shaped folder with no `viewer\` | Adds the viewer and `gallery.json` in place, in the folder you gave it |
| An existing container, with `viewer\viewer.html` | Updates the viewer and reindexes `gallery.json`; image order and existing titles are kept |
| The image subfolder of a container | The parent container is updated instead |
| Anything inside `dist\` | Refused — `npm run build` empties `dist\` |

A folder with several subfolders is not treated as a container: the batch cannot
tell which one holds the gallery, and says so rather than guessing.

## Updating a gallery that is already live

1. Work on the copy in `containers\<name>\`, not on the live site.
2. Add, remove or rename images in the inner folder.
3. Run the batch on the outer folder.
4. Upload the outer folder again, replacing the old one.
5. Hard-refresh the page (**Ctrl+F5**) — `gallery.json` is cached by the browser.

Titles come from file names, so renaming a file renames the caption. Titles that
were set by hand in `gallery.json` are kept only while the file name stays the
same.

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
  viewer\viewer.html
  viewer\assets\
  <name>\gallery.json
  <name>\images...
```

Upload `containers\<name>` so that it lands as `/<name>/` on the server. Zipping
it first and extracting on the host is usually quicker than copying hundreds of
files.

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

Then open `http://localhost:8000/<name>/viewer/viewer.html`. See
[LocalSERVER.txt](LocalSERVER.txt) for the same instructions in short form.

## Notes

- `npm run build` empties `dist\`, so never keep working galleries there.
- `containers\` is git-ignored: the images are yours and stay off the repository.
- The sample gallery in `public\galleries\colours` exists to test the viewer. It is
  not one of your galleries.
