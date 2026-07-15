import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// The built page is served from a subfolder of a static site, both locally
// (localhost:8899/Authors/Cling/The-Essay/) and on GitHub Pages
// (/Dissimilate/Authors/Cling/The-Essay/). All asset URLs must therefore be
// RELATIVE — publish.mjs rewrites the absolute /_astro/ paths after build.
export default defineConfig({
  integrations: [react()],
  outDir: './dist',
  build: {
    // keep asset filenames stable-ish and grouped
    assets: 'assets',
  },
});
