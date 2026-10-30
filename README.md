# Image Light Table

by Ryan Raz

High Resolution image light table and slide show.

**[Read the user guide](docs/USER-GUIDE.md)** — installing a gallery on your site,
changing photos and titles, updating a live gallery.

## What it is

A static photo light table with no server side: HTML, CSS and JavaScript, plus a
`gallery.json` listing the photographs. Each gallery is a self-contained folder,
so one gallery can be replaced without touching another.

```
<name>/
  light-table/
    index.html
    assets/
  <name>/
    gallery.json
    01-first-photo.jpg
```

The light table sits in `light-table/` and loads the gallery beside it. Open
`/<name>/light-table/`.

## Day to day

1. Put the photographs in `containers\<name>\<name>\`.
2. Run `Light-table.bat` on `containers\<name>`, or drag the folder onto it.
3. Upload `containers\<name>` to the site as `/<name>/`.

Full instructions, including what the batch does in each situation, are in
[DEPLOY.md](DEPLOY.md).

## Commands

| Command | Purpose |
|---|---|
| `npm install` | once, to get the build tools |
| `npm run build` | rebuild the light table into `dist\` |
| `npm run container -- --images "<folder>" [--name <name>]` | package a folder of images as a new container |
| `npm run refresh -- --container "<folder>"` | update a container in place, keeping order and titles |
| `npm run forward -- --container "<folder>"` | add the old-address forwarding page after a rebuild |
| `npm run dev` | development server on `server.ts` |

`Light-table.bat` runs the right one for you.

## Documentation

- [Workflow (working draft)](docs/WORKFLOW.md) - the steps end to end, being written now
- [docs/USER-GUIDE.md](docs/USER-GUIDE.md) — for the person receiving a gallery
- [DEPLOY.md](DEPLOY.md) — for whoever builds and uploads
- [LocalSERVER.txt](LocalSERVER.txt) — previewing a container locally
- [docs/BATCH-INPUT-OUTPUT.md](docs/BATCH-INPUT-OUTPUT.md) - what the batch does with each folder shape
- [docs/LEGACY-LAYOUT.md](docs/LEGACY-LAYOUT.md) — the old `viewer/` address, why it still works, when to remove it
- [releases](https://github.com/RRaz/Light-Table/releases) — the packaged sample

## Licence

MIT — see [LICENSE](LICENSE). Use it, change it, ship it, sell it; keep the
copyright notice with the source.

The photographs and galleries you add remain yours. The sample colour slides in
`public/galleries/colours` are included only so the light table can be tested.
