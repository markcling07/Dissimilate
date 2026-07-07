#!/usr/bin/env node
// Dissimilate local-reference checker.
// Verifies that every relative href/src (and each `path:` in index.html's
// `articles` array) resolves to a real file ON DISK, using EXACT-CASE matching
// so it catches the GitHub Pages case-sensitivity trap that a plain existence
// check misses on Windows' case-insensitive filesystem.
//
// Usage:
//   node check-refs.mjs [file.html ...]   # check given files, or all *.html if none
//   node check-refs.mjs --hook            # read PostToolUse JSON from stdin, check the edited .html
//
// Exit 0 = clean, 2 = problems found (surfaces stderr back to Claude in a hook).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..'); // .claude/scripts -> repo root

const SKIP_DIRS = new Set(['.git', '.claude', 'node_modules']);
const SKIP_REF = /^(https?:|\/\/|mailto:|tel:|data:|javascript:|#)/i;

// Walk a relative path from `baseAbs` one segment at a time, requiring an
// EXACT-case directory entry at each level. Returns {ok} or {ok:false, ci}
// where `ci` is a case-insensitive near-match ("did you mean...").
function resolveExact(baseAbs, rel) {
  const segs = rel.split('/').filter((s) => s.length && s !== '.');
  let cur = baseAbs;
  for (const seg of segs) {
    if (seg === '..') { cur = path.dirname(cur); continue; }
    let entries;
    try { entries = fs.readdirSync(cur); } catch { return { ok: false, ci: null }; }
    if (entries.includes(seg)) { cur = path.join(cur, seg); continue; }
    const ci = entries.find((e) => e.toLowerCase() === seg.toLowerCase());
    return { ok: false, ci: ci ?? null };
  }
  return { ok: true };
}

const NAMED_ENTITIES = { amp: '&', times: '×', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: ' ' };

function decodeEntities(s) {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&([a-z]+);/gi, (m, name) => NAMED_ENTITIES[name.toLowerCase()] ?? m);
}

function cleanRef(raw) {
  // Template placeholders like `${art.path}` are render-time, not real refs.
  if (raw.includes('${')) return null;
  let ref = decodeEntities(raw).split('#')[0].split('?')[0].trim();
  if (!ref) return null;
  try { ref = decodeURIComponent(ref); } catch { /* keep raw */ }
  return ref;
}

function collectHtml(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) collectHtml(path.join(dir, entry.name), out);
    } else if (entry.name.toLowerCase().endsWith('.html')) {
      out.push(path.join(dir, entry.name));
    }
  }
  return out;
}

// Returns array of {line, ref, ci} problems for one HTML file.
function checkFile(absFile) {
  const problems = [];
  let text;
  try { text = fs.readFileSync(absFile, 'utf8'); } catch { return problems; }
  const dir = path.dirname(absFile);
  const lines = text.split(/\r?\n/);
  const isIndex = path.basename(absFile).toLowerCase() === 'index.html' && dir === ROOT;

  lines.forEach((line, i) => {
    const patterns = [/(?:href|src)\s*=\s*["']([^"']+)["']/gi];
    // In the root homepage, the `articles` array registers content via `path:`.
    if (isIndex) patterns.push(/\bpath\s*:\s*["']([^"']+)["']/gi);
    for (const re of patterns) {
      let m;
      while ((m = re.exec(line)) !== null) {
        const raw = m[1];
        if (SKIP_REF.test(raw)) continue;
        const ref = cleanRef(raw);
        if (!ref) continue;
        // Resolve `path:` entries from repo root; href/src from the file's dir.
        const base = re.source.includes('path') ? ROOT : dir;
        const res = resolveExact(base, ref);
        if (!res.ok) problems.push({ line: i + 1, ref: raw, ci: res.ci });
      }
    }
  });
  return problems;
}

function report(files, quiet = false) {
  let total = 0;
  for (const f of files) {
    const problems = checkFile(f);
    if (!problems.length) continue;
    total += problems.length;
    const rel = path.relative(ROOT, f) || path.basename(f);
    for (const p of problems) {
      const hint = p.ci ? `  (did you mean "${p.ci}"? — case/char mismatch)` : '  (not found on disk)';
      process.stderr.write(`${rel}:${p.line}  ${p.ref}${hint}\n`);
    }
  }
  if (total) {
    process.stderr.write(`\n${total} unresolved reference(s). GitHub Pages is case- & character-sensitive; fix these before pushing.\n`);
    process.exit(2);
  }
  // In hook mode, stay silent on success to avoid transcript noise on every edit.
  if (!quiet) {
    process.stdout.write(`OK — all local references resolve (checked ${files.length} file${files.length === 1 ? '' : 's'}).\n`);
  }
}

async function readStdin() {
  const chunks = [];
  for await (const c of process.stdin) chunks.push(c);
  return Buffer.concat(chunks).toString('utf8');
}

const args = process.argv.slice(2);
if (args.includes('--hook')) {
  const raw = await readStdin();
  let filePath = '';
  try { filePath = JSON.parse(raw)?.tool_input?.file_path ?? ''; } catch { /* ignore */ }
  if (!filePath || !filePath.toLowerCase().endsWith('.html')) process.exit(0);
  if (!fs.existsSync(filePath)) process.exit(0);
  report([path.resolve(filePath)], true);
} else {
  const files = args.length ? args.map((a) => path.resolve(a)) : collectHtml(ROOT, []);
  report(files);
}
