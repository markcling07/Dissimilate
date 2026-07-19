---
name: add-essay
description: Publish a Cling essay from raw text into the Astro + React (TS) AEO template at Essays/Cling/ — fill the template, build, verify AI-crawlability, and wire it into the homepage, sitemap, and llms.txt. Triggered by the user with /add-essay.
disable-model-invocation: true
---

# Publish a Cling essay (Astro + React template)

Usage: `/add-essay <title, or paste the essay text>` (in `$ARGUMENTS`). The user may also
supply the text and images across the next few messages — collect everything before building.

Cling's essays are the site's one build-step exception (see CLAUDE.md → Tooling). The Astro
project lives in `Essays/Cling/<Essay>/_src/`; the committed, servable artifact is the built
`index.html` + `assets/` one level up. **Never hand-edit that `index.html`** — edit
`_src/src/` and rebuild.

The reference implementation is `Essays/Cling/The-Essay/` (the template scaffold, homepage
id `cling-essay-wip`). The FIRST run of this skill consumes it: rename that folder to the real
essay's name. Later runs copy it as a starter.

## Gather from the user (ask, don't guess)

1. **Title** and, if not provided, a one-sentence **description** (feeds meta + JSON-LD —
   confirm your draft of it with the user).
2. **The essay text.** Never write or pad the essay yourself; placeholder copy may only be
   replaced by the user's words. If sections don't map cleanly to the AEO shape, ask how they
   want it structured rather than rewriting their prose.
3. **Images** (optional) + which one becomes the OG share card. Captions/alt if they have
   preferences; otherwise write truthful alt text by looking at each image.
4. **Category** for the homepage entry (existing categories: Essays, Mountains) and
   date/read-time.

## Steps

1. **Branch** off `main` if not already on a work branch.
2. **Folder**: rename `Essays/Cling/The-Essay/` (first run) or copy it (later runs) to
   `Essays/Cling/<Title-Slug>/`. Keep the slug filesystem-friendly; the site tolerates
   spaces but doesn't require them.
3. **Fill the template** in `_src/src/pages/index.astro`:
   - `meta` block: title, description, canonicalUrl + ogImage (absolute, percent-encoded,
     ending in the new folder name), dates, category, readTime.
   - Replace every `TODO` placeholder with the user's text. Preserve the AEO shape: TL;DR
     block first, question-shaped H2s answered in their first sentence, lists for enumerable
     claims, one quotable blockquote. `<ExpandableAside>` is available for digressions.
   - Images: files go in the essay folder's `IMG/` (NOT in `_src/`), referenced as
     `IMG/<file>` inside `<figure>` + `<figcaption>`, with `loading="lazy" decoding="async"`
     and real alt text.
4. **OG card**: 1200×630 `IMG/OG.jpg` from the user's chosen image. On macOS:
   `sips -s format jpeg <src> --out IMG/OG.jpg && sips --resampleWidth 1200 IMG/OG.jpg &&
   sips --cropToHeightWidth 630 1200 IMG/OG.jpg`. On other platforms use ImageMagick
   (`magick <src> -resize 1200x -gravity center -extent 1200x630 IMG/OG.jpg`).
5. **Build**: `cd _src && npm install && npm run build`. This runs Astro, then `publish.mjs`
   copies the output up, relativizes asset paths, and removes `dist/`.
6. **Wire in**:
   - Homepage `articles` array: update the essay's entry (or the `cling-essay-wip` one on
     first run) — title, description, path, img/carouselImg, and `isDraft: false` when the
     user says it's ready to publish (keep `true` to stage).
   - When undrafted: add the URL to `sitemap.xml` and a line to `llms.txt` (both
     hand-maintained; percent-encode per CLAUDE.md).
7. **Verify** (all must pass):
   - Crawler view: `curl -s <local url> | grep` for the title and a distinctive body phrase —
     curl runs no JS; if the text is there, AI crawlers see it. Confirm no `TODO`/placeholder
     text survives.
   - JSON-LD parses (`python3 -c "import re,json; ..."` on the built index.html).
   - `node .claude/scripts/check-refs.mjs` — no new unresolved refs.
   - Serve from repo root and screenshot desktop + ~390px mobile.
   - Homepage feed shows/hides the entry per its isDraft state.
8. **Commit** on the branch and show the user the result. Push/merge only when asked —
   note: this machine's git credentials sometimes revert to the wrong GitHub account; if a
   push 403s, `gh auth switch --user markcling07` and retry.
