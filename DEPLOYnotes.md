# Deployment Guide

This project is designed to deploy as a static web site. The built `dist/` folder contains everything needed for production.

## Build the Project
## Note you may want to remove the old dist folder to rebuild

##### Work around for deployment error

This requires a single gallery build with gallery <name> the only gallery under gallery folder in public all gallery <name> images must be available

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

###repackage dist under the following structure you can delete the dist folder afterwards

<name> 					folder named after gallery <name> (must create)
	viewer				folder 	(must create)
		viewer.html			(from dist)
		server.js		optional file	(from dist)
		assets			folder		(from dist)
		<name>			folder containing (under gallery folder in dist)
			images 		all image files 
			gallery.json	(under gallery folder in dist)

##	Move to server i usually zip it and unzip on server

##Example calls

https://www.rraz.ca/catalog/viewer/viewer.html?gallery=/catalog

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


## Local Preview

If you want to preview locally  you can use a simple web server such as:

```bash
cd <name>
python -m http.server 8080
```

Then visit `http://localhost:8080/<name>/viewer/viewer.html?gallery=galleries/<name>`.
