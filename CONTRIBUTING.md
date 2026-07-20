# Contributing

Thanks for helping improve WebP Converter! This is a static, dependency-light project, so
getting started is quick.

## Ground rules

- Be respectful — see [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
- Keep it framework-free and zero-backend. The core converter must always run fully in the
  browser, stay free, and require no registration.
- No feature should gate core conversion behind a paywall or upload.

## Local setup

```bash
git clone https://github.com/YOUR-USERNAME/webp-converter.git
cd webp-converter
npm install
npm run build      # regenerate /convert pages + sitemap
npx serve .        # preview at http://localhost:3000
```

## Making changes

- **UI / engine:** edit `assets/css/style.css` and `assets/js/app.js`.
- **Conversion landing pages:** edit `scripts/data/pages.json`, then `npm run build`.
  Do **not** hand-edit files under `convert/` — they are generated.
- **Blog posts:** add a folder under `blog/<slug>/index.html` and register the slug in
  `BLOG_POSTS` in `scripts/generate.mjs` so it enters the sitemap.

## Before opening a PR

1. `npm run build` succeeds and you committed the regenerated output.
2. `npm run lint:html` passes.
3. Test in at least one Chromium and one non-Chromium browser.
4. Keep PRs focused; describe the change and link any related issue.

## Commit style

Conventional commits are appreciated but not required: `feat:`, `fix:`, `docs:`, `chore:`.

## Reporting bugs / requesting features

Use the issue templates. Include browser + OS, steps to reproduce, and a sample file when
relevant (never upload anything sensitive).
