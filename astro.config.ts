import { defineConfig } from 'astro/config';

import { cspHashes } from './src/integrations/csp';

export default defineConfig({
  site: 'https://bautask.yinside.de',
  output: 'static',
  trailingSlash: 'always',
  integrations: [
    // The CSP allows the inlined stylesheets by their hashes, written into dist/.htaccess after the build.
    cspHashes(),
  ],
  build: {
    // The stylesheet is inlined, so the first paint waits for no request; the CSP allows it by hash, not 'unsafe-inline'.
    inlineStylesheets: 'always',
  },
  vite: {
    // Scripts and fonts stay files: Vite would inline small modules as data URIs, which script-src 'self' refuses.
    build: { assetsInlineLimit: 0 },
  },
});
