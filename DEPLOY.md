# Deployment Guide

This project is designed to deploy as a static web site. The built `dist/` folder contains everything needed for production.

## Build the Project
## Note you may want to remove the old dist folder to rebuild

From the project root:

```bash
npm install
npm run build
```

The build will:

- produce optimized static files in `dist/`
- copy `viewer.html` into `dist/viewer1/`, `dist/viewer2/`, `dist/viewer3/`, and `dist/viewer4/`
- bundle `server.ts` into `dist/server.js` for optional local preview

If you only need the static viewer output without server bundling, run:

```bash
npm run build:static
```

## What to Upload

### Build 1 (viewer shell)

If you are embedding or calling the viewer from elsewhere, upload the viewer entry points and the shared assets they depend on:

- `dist/viewer1/viewer.html`
- `dist/viewer2/viewer.html`
- `dist/viewer3/viewer.html`
- `dist/viewer4/viewer.html`
- `dist/assets/`
- `dist/galleries/` (only the galleries you actually want to expose; omit sample galleries if you do not want them)
- `dist/server.js` (optional)

If you are not using the top-level home page at all, `dist/index.html` is not required for the viewer-integration path.

### Build 2 (one-gallery package)
###### Work around for error in script: download local gallery <name> folder to the location that they are stored locally, do build 1, upload gallery.json to server's gallery <name> folder, build 2 will now work, if you need build 1 delete local gallery <name> folder and rebuild build 1 
This bypasses the code error because gallery.json is already present on the server

For a packaged one-gallery deployment, upload only the package folder for that gallery:

- `dist/packages/<gallery>/viewer.html`
- `dist/packages/<gallery>/assets/`
- `dist/packages/<gallery>/gallery.json`

If the gallery images are already hosted remotely, do not upload `dist/packages/<gallery>/gallery/`.
If the gallery images are not remote, include `dist/packages/<gallery>/gallery/` as well.

## Build 1 and Build 2

### Build 1

- Command: `npm run build`
- Rebuilds the main viewer shell and the copied viewer entry points in `dist/`.
- If you are using the viewer from elsewhere, you can upload only the viewer copies, shared assets, and the gallery folders you actually want.

###### *****Build 1 error assets folder now has to be moved to each viewer folder

###### ***** gallery.json  from build 1 has to be moved to each corresponding gallery <name> image folder on server or first time build 2 will fail

### Build 2

- Command: `npm run build:gallery -- --gallery galleries/wedding --action update --fresh`
- Creates a clean package for one gallery under `dist/packages/`.
- In PowerShell, keep the double hyphen form (`--gallery`, `--action`, `--fresh`). That is required for this script.
- For remote image hosting, use:

  ```powershell
  node scripts/build-gallery-package.js --gallery galleries/wedding --action update --fresh --manifest-url https://your-site.example/galleries/wedding/gallery.json --base-url https://your-site.example/galleries/wedding
  ```

- This package is designed for deployment where the image files already live on your web server.

## Build 2 Gallery Lifecycle

### Create the first packaged gallery

1. If you are using remote image hosting, make sure the gallery files already exist at the remote URL you point to with `--manifest-url` and `--base-url`.
   - If `gallery.json` is missing there, the package step should generate it from the file names in the local gallery folder you are packaging from.
   - If you are packaging from a local gallery folder, the script uses that local source and copies the files into the package.
2. Run:

   ```powershell
   node scripts/build-gallery-package.js --gallery photo/black-and-white --action update --fresh --manifest-url https://mydomain.com/photo/black-and-white/gallery.json --base-url https://mydomain.com/photo/black-and-white
   ```
###real example if gallery.json is created and uploaded with the work around for script error
node scripts/build-gallery-package.js --gallery ex/catalog/Catalog/images --action update --fresh --manifest-url https://rraz.ca/ex/catalog/Catalog/images/gallery.json --base-url https://rraz.ca/ex/catalog/Catalog/images

###html link for real example
https://www.rraz.ca/ex/catalog/Catalog/images/viewer.html?gallery=images

3. Upload only:
   - `dist/packages/photo/black-and-white/viewer.html`
   - `dist/packages/photo/black-and-white/assets/`
   - `dist/packages/photo/black-and-white/gallery.json`

### Add a second packaged gallery

1. Create the second gallery folder and `gallery.json` on your server.
2. Run:

   ```powershell
   node scripts/build-gallery-package.js --gallery trips/paris-night --action update --fresh --manifest-url https://mydomain.com/trips/paris-night/gallery.json --base-url https://mydomain.com/trips/paris-night
   ```

3. Upload only:
   - `dist/packages/trips/paris-night/viewer.html`
   - `dist/packages/trips/paris-night/assets/`
   - `dist/packages/trips/paris-night/gallery.json`

### Update the first gallery later

If you change the image files at the first remote URL, rebuild the package with the same command and upload the same three files again.

### Remove the second gallery without deleting the images

To remove the second packaged slideshow from the deployment, run:

```powershell
node scripts/build-gallery-package.js --gallery trips/paris-night --action delete
```

Then remove the uploaded package folder from the host, but do not delete the image files themselves.

## Example Deployment URLs

After deployment, you can test the viewers with:

- `https://your-site.com/viewer1/viewer.html?gallery=galleries/wedding`
- `https://your-site.com/viewer1/viewer.html?gallery=galleries/portrait`
- `https://your-site.com/viewer2/viewer.html?gallery=galleries/wedding`

## Adding New Galleries

To add a new gallery:

1. Create a new folder under `public/`, for example `public/galleries/newgallery/`
2. Add your image files to that folder
3. If `gallery.json` does not already exist, the build will auto-generate it from the image file names
4. Use the gallery URL:
   `viewer1/viewer.html?gallery=galleries/newgallery`

### `gallery.json` format

```json
[
  {
    "id": "photo-1",
    "url": "/galleries/newgallery/image1.jpg",
    "title": "Example Photo"
  }
]
```

## Notes

- The viewer requires the `gallery` query string parameter.
- If `?gallery=` is missing or invalid, the app shows an error message.
- The viewer app is independent of the gallery location, so the same viewer URL can load any gallery path in `public/`.

## Local Preview

If you want to preview locally from `dist/`, you can use a simple web server such as:

```bash
cd dist
python -m http.server 8080
```

Then visit `http://localhost:8080/viewer1/viewer.html?gallery=galleries/wedding`.
