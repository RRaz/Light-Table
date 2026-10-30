# Working in this repository

Documentation follows **Ryan packaging standards**:
<https://github.com/RRaz/Playbook/blob/main/installers/ryan-packaging-standards.md>

Section 8 (language and documentation) governs every file in `docs/` and both
README-level documents. Read it before writing or rewriting user-facing text.

## The two audiences

| File | Reader | Rules |
|---|---|---|
| `docs/USER-GUIDE.md` | the person who receives a gallery | plain words; no programming terms; no `npm`, no JSON, no build talk |
| `DEPLOY.md` | whoever looks after the galleries | folders and files, not build internals |
| `docs/LEGACY-LAYOUT.md`, `docs/BATCH-INPUT-OUTPUT.md` | maintainer reference | may name scripts, but keep the reason in plain language |
| `README.md` | anyone landing on the repository | short; points at the guide |

## House rules that come up here

- Name the exact thing: `gallery.json`, `containers\<name>`, `light-table\`. One
  term per thing, used the same way everywhere.
- Say what the reader sees and does, not what the code does. "Change how the light
  table looks or what it says", not "edit the page".
- Requirements before steps; consequences next to the rule they affect.
- No "simply", "just", "obviously".
- No confusing or double negatives, and no yes/no where a named choice is clearer:
  **[Save this file]** / **[Delete this file]**, not "Do you want to delete this?
  Yes / No".
- Labels: name what the person controls, positive phrasing, two to four words,
  outcome rather than mechanism (`Autoplay`, not `Enable autoplay`). A label that
  needs a sentence is the wrong label.
- The visual interface follows the same rules: a cue informs, it does not nag. No pulsing or looping animation to state something already visible.
- No superfluous files, links or downloads.
- Explain jargon the first time: `gallery.json` is *the list that says which
  photographs appear, in what order, with what captions*.

## Code conventions

- The batch accepts image folders only. Anything else stops with a message.
- Everything is built in `containers\<name>`; nothing else outside is written
  except `gallery.json` beside a source image folder.
- A rebuild replaces the container, so keep extras in the repository copy.
