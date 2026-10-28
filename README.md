# Lumina Light Table

High Resolution image light table and slide show.

User guide for people receiving a gallery: [docs/USER-GUIDE.md](docs/USER-GUIDE.md).

A static photo viewer app with independent viewer installations. Each viewer directory contains a complete light-table app instance, and the displayed gallery is loaded from the required `?gallery=` URL parameter.

## Features

- Four independent viewer installs: `viewer1`, `viewer2`, `viewer3`, `viewer4`
- Each viewer loads a gallery from any public directory via `?gallery=path/to/gallery`
- Required gallery parameter: no default gallery is loaded
- Error display if the gallery parameter is missing or invalid
- Includes sample galleries:
  - `galleries/wedding`
  - `galleries/portrait`

## Usage

### Local build

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the project:
   ```bash
   npm run build
   ```

   This generates the static output in `dist/` and copies `viewer.html` into:
   - `dist/viewer1/viewer.html`
   - `dist/viewer2/viewer.html`
   - `dist/viewer3/viewer.html`
   - `dist/viewer4/viewer.html`

### Test URLs

Open one of the viewer pages with a gallery parameter:

- `viewer1/viewer.html?gallery=galleries/wedding`
- `viewer1/viewer.html?gallery=galleries/portrait`
- `viewer2/viewer.html?gallery=galleries/elgin`
- `viewer3/viewer.html?gallery=galleries/portrait`

### Add a new gallery

1. Create a new folder under `public/`, for example `public/galleries/newgallery/`
2. Add image files to that folder
3. If `gallery.json` does not exist, the build will auto-generate it from the image file names
4. Use the gallery URL like:
   `viewer1/viewer.html?gallery=galleries/newgallery`

`gallery.json` should be an array of photo objects with these fields:

```json
[
  {
    "id": "photo-1",
    "url": "/galleries/newgallery/image1.jpg",
    "title": "Example Photo"
  }
]
```

## Deployment

Upload the contents of `dist/` to your static webserver. The viewer apps do not require a backend server for gallery loading.

### Build 1: viewer shell

Use `npm run build` to regenerate the standard viewer shell and the four viewer copies in `dist/`.

### Build 2: one gallery package

Use `npm run build:gallery -- --gallery galleries/wedding --action update --fresh` to create or refresh one packaged gallery in `dist/packages/`.

Use `--base-url https://your-site.example/files` when the deployed gallery images are hosted remotely.
Use `--manifest-url https://your-site.example/galleries/wedding/gallery.json` when you want Build 2 to download `gallery.json` from the server instead of reading from local `public/`.

Build 2 preserves existing manifest titles and only refreshes the packaged output for that one gallery.

## Development

Run the dev server with:

```bash
npm run dev
```

This starts the local development server using `tsx server.ts`.
