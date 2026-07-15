# WebP Converter

Private, browser-based image to WebP converter. All conversion happens locally
in the visitor's browser via the Canvas API — no uploads, no accounts, no limits.

**Live site:** https://webp-converter.jainavik2000.workers.dev

## Development

Static site, no build step.

- `npm run lint` — syntax-check the JS
- `npm test` — validate required files and SEO metadata
- Deploy: push to `main` (Cloudflare Workers auto-deploys via `wrangler.jsonc`)

**Important:** when changing anything in `assets/`, bump the `?v=N` query string
on the asset references in every HTML file (assets are cached immutable for 1 year).

See `SESSION-LOG.md` (untracked) for project state and roadmap.

## License

Proprietary — all rights reserved. See `LICENSE`.
