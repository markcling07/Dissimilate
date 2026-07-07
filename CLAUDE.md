# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Dissimilate is a **static website** — a curated journal of essays and Philippine mountain-climbing logs. Plain hand-written **HTML/CSS/vanilla JS**. No build step, no framework, no package manager, no tests. Edit files and open them in a browser (use VS Code Live Server for the JS-driven homepage carousel).

Deployed via **GitHub Pages** at https://markcling07.github.io/Dissimilate/. Pushing to `main` publishes the site.

## Structure

- Root `index.html` + `diss.css` are the homepage. Content cards/carousel render from an **inline `<script>` `articles` array in `index.html`** (starts ~line 684, 18 entries) — to add or relink content, edit that array, not just the markup. Each entry's keys: `id, title, author, category, readTime, path, description, type, badge, isFeaturedHero, img` (card thumbnail), `carouselImg` (wider hero image), `isDraft`. The homepage renders `articles.filter(a => !a.isDraft)` — set `isDraft: true` to stage a piece without deleting or unlinking it. Some entries' `path` points at an author landing page itself (e.g. `Authors/Raul/index.html`, `Authors/Shieka/index.html`) rather than a `<Person>/<Piece>/` folder.
- Each piece of content is a **self-contained folder** holding its own `.html`, `.css`, optional `.js`, and an `IMG/` subfolder. Buckets: `Authors/`, `Essays/`, `Mountains/`. **`Authors/` is the primary bucket** — most live pieces are `Authors/<Person>/<Piece>/`, with a per-author landing page at `Authors/<Person>/index.html`. **Filenames are inconsistent**: some folders use `index.html`, others a slug (`sumagaya.html`, `Ophiorrhiza-Biflora.html`); CSS is sometimes `style.css`, sometimes slugged. Match the folder you're editing — don't assume `index.html`.
- `_card-preview.html` (root) is a standalone author-card design mockup — **not linked from the site**. `Diss-Design.jpg` is a design reference image, and `_refs/` holds gitignored local design references. None of these are live content.

## Tooling

- A PostToolUse hook runs `node .claude/scripts/check-refs.mjs --hook` after every file edit — it validates local href/src paths and `articles` array entries with exact-case matching. If it reports a broken reference, fix it before moving on.
- `/add-content` scaffolds a new piece (folder + HTML/CSS/IMG skeleton + OG meta + articles-array entry); `/check-links` runs the full reference check. Prefer these over doing it by hand.

## Gotchas

- **Paths contain spaces and special characters** (e.g. `Lera & Lara/`, `Star/Kotkot × Bukaw/`, `Order and Chaos/`). GitHub Pages is **case- and character-sensitive**, so links must match the real path exactly. Keep `href`/`src` consistent with the existing files.
- `Authors/Star/Kotkot × Bukaw/` (`×` = U+00D7 multiplication sign) and `Authors/Allison/Kotkot x Bukaw/` (ASCII `x`) are **both live, different authors' pieces** — don't "fix" one into the other.
- **Legacy / non-live folders exist.** Not everything outside the `articles` array is legacy — some folders are finished-but-unregistered work in progress (e.g. `Authors/Gladys/Sumagaya/`). The truly stale/typo paths to avoid: `Essays/Order & Chaos/` (live is `Essays/Order and Chaos/`), `Essays/Psychology/Makima/Pysch/` (misspelled, has a `Psych,css` with a comma), `Essays/Tech.html` (empty stub), `Essays/Mountains/` (stray nested folder ≠ the top-level `Mountains/` bucket), `Authors/Raul/Sumagaya-Before/` (old snapshot), `Authors/Star/Kotkot × Bukaw Redesign/` (unused variant).
- Images are a mix of `.jpg`, `.jpeg`, `.webp`, `.png`, `.jfif` — plus **uppercase `.JPG`/`.PNG`** on disk. Pages is case-sensitive, so use the actual extension and case; don't assume lowercase `.jpg`.
- New content pages should include **Open Graph + Twitter Card `<meta>` tags** (title, description, image, url) like the homepage and recent pieces — and **URL-encode special characters** in those tag values (`%20` for space, `%C3%97` for `×`), since social crawlers don't tolerate raw spaces/symbols. For link previews, add a dedicated **1200×630 OG card** in the piece's `IMG/` and use **`.jpg`** for it (broadest crawler compatibility). OG tags aren't on every page yet — always add them to new pages.
