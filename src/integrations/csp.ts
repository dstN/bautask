// Astro integration: the stylesheet of each page is inlined (astro.config.ts, inlineStylesheets: 'always'), so the
// first paint waits for no request (issue #5). The CSP of public/.htaccess has no 'unsafe-inline'; after the build
// this hook hashes every <style> element of every page and writes the hashes into style-src of dist/.htaccess, so
// exactly these styles run and nothing else. It also refuses a build that carries an inline script other than
// JSON-LD, or a style attribute, which the CSP would refuse in the browser.
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { AstroIntegration } from 'astro';

/** The text of every <style> element in a page. */
export function inlineStyles(html: string): string[] {
  return [...html.matchAll(/<style(?:\s[^>]*)?>([\s\S]*?)<\/style>/g)].map((m) => m[1] ?? '');
}

/** The CSP source for a text, as the browser computes it: sha256 over the UTF-8 bytes, in base64. */
export function hashSource(text: string): string {
  return `'sha256-${createHash('sha256').update(text, 'utf8').digest('base64')}'`;
}

/** The CSP line of an .htaccess with the hashes added to style-src. */
export function withStyleHashes(htaccess: string, hashes: readonly string[]): string {
  const csp = /(Header always set Content-Security-Policy ")([^"]+)(")/;
  const m = csp.exec(htaccess);
  if (!m?.[2]?.includes("style-src 'self'")) throw new Error(".htaccess has no Content-Security-Policy with style-src 'self'; add it before building.");
  const policy = m[2].replace(/style-src 'self'[^;]*/, `style-src 'self'${hashes.map((h) => ` ${h}`).join('')}`);
  return htaccess.replace(csp, `$1${policy}$3`);
}

function htmlFiles(dir: string): string[] {
  return readdirSync(dir, { recursive: true, encoding: 'utf8' })
    .filter((f) => f.endsWith('.html'))
    .map((f) => join(dir, f));
}

export function cspHashes(): AstroIntegration {
  return {
    name: 'csp-hashes',
    hooks: {
      'astro:build:done': ({ dir, logger }) => {
        const out = fileURLToPath(dir);
        const hashes = new Set<string>();
        for (const file of htmlFiles(out)) {
          const html = readFileSync(file, 'utf8');
          for (const css of inlineStyles(html)) hashes.add(hashSource(css));
          const scripts = [...html.matchAll(/<script\b([^>]*)>/g)].map((s) => s[1] ?? '');
          const inline = scripts.filter((attrs) => !/\ssrc=/.test(attrs) && !/type="application\/ld\+json"/.test(attrs));
          if (inline.length) throw new Error(`${file} has an inline script; the CSP allows only scripts from files (and JSON-LD).`);
          if (/<[a-z][^>]*\sstyle="/i.test(html)) throw new Error(`${file} has a style attribute; the CSP refuses it. Use a class or set the value from a script.`);
        }
        const htaccess = join(out, '.htaccess');
        writeFileSync(htaccess, withStyleHashes(readFileSync(htaccess, 'utf8'), [...hashes].sort()));
        logger.info(`${hashes.size} inline stylesheet(s) allowed by hash in dist/.htaccess`);
      },
    },
  };
}
