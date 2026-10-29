# Legacy `viewer/` layout

**Status: kept for galleries already published. New galleries use `light-table/`
only.**

The page used to be deployed as `/<name>/viewer/viewer.html`. It now lives at
`/<name>/light-table/`. Three things keep the old address alive:

1. The app accepts either folder name when working out which gallery to load
   (`galleryFromLocation()` in `App.tsx`).
2. Refreshing a container that still has the old layout migrates it and leaves a
   small forwarding page at `viewer/viewer.html`.
3. That forward is relative (`../light-table/`) and carries the `?gallery=`
   parameter, so published links land on the gallery.

## Why it stays

Links to the old addresses are published on other people's pages, forums and
bookmarks. Those are outside our control: they cannot be edited, counted or
retired. A 375-byte forwarding page is the only way to keep them working, so it
stays for every gallery that was published before the rename.

This applies to Ryan's own galleries — `kodachrome`, `shanghai` and any other
folder still carrying `viewer/` in production. No other user has the old layout.

## New galleries

New galleries are published as `/<name>/light-table/` only. No `viewer/` folder,
no forward. There is nothing to keep compatible because nothing was published
under the old address.

## Do not remove the forward

The earlier plan was to delete these once links were retired. They will not be
retired — the links belong to other people. Treat the forward page as part of the
published gallery from now on:

- keep `viewer/viewer.html` in the container you upload;
- keep it in the local copy too, so a future rebuild does not drop it;
- leave `'viewer'` accepted in `galleryFromLocation()`, so a container that has
  not been migrated yet still opens.

## Checking both layouts

Both should load the same gallery and show the same photographs:

```
/<name>/light-table/                                  <- current layout
/<name>/viewer/viewer.html?gallery=/<name>            <- old address, forwards
```

The second is the one to test with an existing published link.
