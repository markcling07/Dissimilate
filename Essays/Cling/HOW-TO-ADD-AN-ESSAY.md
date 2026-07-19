# How to Add a New Cling Essay

Cling's essays are the **one part of Dissimilate that uses a build step** (the Astro
template). Everything else on the site is hand-written HTML — but Cling's essays are
generated from a source folder so they stay consistent and search/AI-friendly. This guide
explains how to publish a new one.

You do **not** need to know how to code. Your job is to bring the **words and pictures** —
the tooling handles the rest.

---

## The easy way (recommended)

In Claude Code, type:

```
/add-essay
```

…and then give Claude the essay. Claude will fill the template, build the page, check that
Google and AI crawlers can read it, and add it to the homepage. You can also just say
*"add a new Cling essay"* in plain words.

### What Claude will ask you for

1. **Title** — the essay's headline.
2. **A one-sentence description** — a short summary (Claude can draft this; you approve it).
   This is what shows on the homepage card and in Google/AI results.
3. **The essay text** — your actual words. (Claude will never write the essay for you — it
   only places *your* text.)
4. **Images** (optional) — and which one should be the **share card** (the picture that
   appears when the link is posted to Facebook, etc.).
5. **Category, date, and read time** — e.g. "Essays", "July 2026", "5 min read".

That's everything. Hand those over and the essay goes from raw text to a finished, live page.

---

## How to write it so Google + AI love it

The *structure* of the writing matters as much as the tool. Write each essay like this and it
becomes easy for search engines and AI assistants to quote:

- **Start with a short TL;DR** — a 2–4 sentence summary at the very top that answers the
  main question.
- **Use headings that are questions**, and answer each one in its **first sentence**.
- **Use bullet lists** for anything you're counting or listing (jobs lost, places affected…).
- **Include one strong, quotable line** (it becomes a pull-quote).
- Keep the **full text as real words on the page** — never hide content behind a button or a
  "load more". AI crawlers don't click; they only read what's already there.

Your existing essay already follows this shape — it's a good model to copy.

---

## What happens behind the scenes (just so you know)

You don't have to do these, but here's what "publishing" actually involves:

1. A new folder is created at `Essays/Cling/<Essay-Name>/`, copied from the template.
2. Your words go into the source file `_src/src/pages/index.astro`.
3. Your images go into that essay's `IMG/` folder.
4. A **1200×630 share card** (`IMG/OG.jpg`) is made from your chosen image.
5. The page is **built**: `npm run build` turns the source into the real `index.html`.
6. The essay is added to the homepage list, and its web address is added to `sitemap.xml`
   and `llms.txt` (the files that tell Google and AI crawlers the page exists).
7. Everything is checked, then committed and pushed to make it live.

---

## Editing an essay *after* it's published

⚠️ **Important:** don't hand-edit the essay's `index.html` — it's a generated file, so any
change there gets erased the next time it's rebuilt.

To change a published essay, edit the **source** (`_src/src/…`) and rebuild — or simply ask
Claude to make the change. Claude always edits the source and rebuilds for you.

The build command (if you ever run it yourself), from inside the essay's `_src` folder:

```
npm install      # only needed the very first time
npm run build
```

---

## Draft vs. live

Each essay has an on/off switch on the homepage called `isDraft`:

- `isDraft: true` → **staged** — the essay exists but is hidden from the homepage.
- `isDraft: false` → **live** — the card shows on the homepage.

Publishing to the live website happens when the changes are **pushed** to `main` (that's what
deploys the site). Until then, changes only exist on your computer.

---

## Quick checklist for a new essay

- [ ] Title + one-sentence description
- [ ] The full essay text (your words), written answer-first
- [ ] Image(s), and which one is the share card
- [ ] Category, date, read time
- [ ] Hand it to `/add-essay` (or ask Claude)
- [ ] Review the built page
- [ ] Flip to `isDraft: false` and push when you're ready to go live
