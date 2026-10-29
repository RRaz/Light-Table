# Legacy `viewer/` layout

**Status: temporary compatibility. Remove it once the old addresses are retired.**

The page used to be deployed as `/<name>/viewer/viewer.html`. It now lives at
`/<name>/light-table/`. Three things keep the old address alive:

1. The app accepts either folder name when working out which gallery to load
   (`galleryFromLocation()` in `App.tsx`).
2. Refreshing a container that still has the old layout migrates it and leaves a
   small forwarding page at `viewer/viewer.html`.
3. That forward is relative (`../light-table/`) and carries the `?gallery=`
   parameter, so published links land on the gallery.

## Who this is for

Only Ryan's own galleries published before the rename — `kodachrome`, `shanghai`
and any other folder still carrying `viewer/` in production. **No other user has
this layout**, so this is not a supported alternative: it exists so links already
in the wild keep working.

## When to remove it

Both of these must be true:

- every gallery has been re-uploaded in the new `light-table/` layout;
- no published link points at `.../viewer/viewer.html` any more.

## How to remove it

1. Delete the `viewer/` folder from each container. It holds only the forward
   page, so nothing is lost.
2. Optionally drop `'viewer'` from the two accepted folder names in
   `galleryFromLocation()` in `App.tsx`, so an old layout is refused rather than
   silently served.
3. Rebuild and re-upload those containers.

## Checking both layouts

Both should load the same gallery and show the same photographs:

```
/<name>/light-table/                                  <- current layout
/<name>/viewer/viewer.html?gallery=/<name>            <- old address, forwards
```

The second is the one to test with an existing published link.
