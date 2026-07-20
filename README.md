<div align="center">

# WebP Converter

**Free, unlimited, private image → WebP converter that runs entirely in your browser.**

No uploads · No registration · No watermarks · Open source (MIT)

[Live demo](https://YOURDOMAIN.com) · [Report a bug](https://github.com/YOUR-USERNAME/webp-converter/issues) · [Contribute](CONTRIBUTING.md)

![License](https://img.shields.io/badge/license-MIT-blue) ![Status](https://img.shields.io/badge/status-production-green) ![PRs](https://img.shields.io/badge/PRs-welcome-brightgreen)

</div>

## Why

Most online converters upload your images to a server, throttle you, or paywall the good
parts. This one does conversion **locally in your browser** with the Canvas API, so your
files never leave your device — and there are no limits.

## Features

- Convert **JPG, PNG, GIF, BMP, SVG, AVIF** to WebP natively
- **HEIC/HEIF** (iPhone) and **TIFF** via decoders loaded on demand
- Reverse: **WebP → PNG / JPG**
- Batch upload + **Download All as ZIP**
- Quality slider, live size-savings feedback
- Fully accessible (WCAG AA), mobile-first, dark-mode aware
- SEO landing pages + blog, generated from data

## Quick start

It's a static site — no backend, no build required to run.

```bash
# Clone
git clone https://github.com/YOUR-USERNAME/webp-converter.git
cd webp-converter

# Serve locally (any static server works)
npx serve .
# open http://localhost:3000
```

## Build (generate SEO pages + sitemap)

```bash
npm install        # dev deps: html-validate, serve
npm run build      # regenerates /convert/*/ pages and sitemap.xml from scripts/data/pages.json
npm run lint:html  # validate HTML
```

To add a new conversion page, edit `scripts/data/pages.json` and run `npm run build`.

## Project structure

```
.
├── index.html               # Landing page + converter
├── assets/
│   ├── css/style.css         # Design system
│   ├── js/app.js             # Conversion engine
│   └── img/favicon.svg
├── convert/<slug>/index.html # Generated landing pages (do not edit by hand)
├── blog/                     # Blog index + articles
├── scripts/
│   ├── generate.mjs          # Programmatic page + sitemap generator
│   └── data/pages.json       # Source of truth for conversion pages
├── sitemap.xml  robots.txt  site.webmanifest  _headers  404.html
├── netlify.toml  vercel.json  Dockerfile  nginx.conf
└── .github/                  # CI, deploy, issue/PR templates
```

## Deploy

Works on any static host. See [`DEPLOYMENT`](#deployment) below or the configs in the repo:
GitHub Pages (`.github/workflows/deploy-pages.yml`), Netlify (`netlify.toml`),
Vercel (`vercel.json`), Cloudflare Pages, Docker (`Dockerfile` + `nginx.conf`).

### Before you go live — replace placeholders

Search-and-replace across the repo:

| Placeholder | Replace with |
|---|---|
| `YOURDOMAIN.com` | your real domain |
| `YOUR-USERNAME` | your GitHub username |
| `G-XXXXXXXXXX` | your Google Analytics 4 ID (in `index.html`) |
| `ca-pub-XXXXXXXXXXXXXXXX` | your AdSense publisher ID |

⚠️ **Remove or replace the placeholder `aggregateRating` in the JSON-LD** before launch —
fabricated review schema violates Google's guidelines. See `AUDIT.md`.

## Deployment

```bash
# GitHub Pages — push to main; the Action publishes automatically.
# Netlify    — connect repo; netlify.toml handles headers + build.
# Vercel     — import repo; vercel.json sets headers.
# Docker
docker build -t webp-converter .
docker run -p 8080:80 webp-converter   # http://localhost:8080
```

## Contributing

PRs welcome — see [CONTRIBUTING.md](CONTRIBUTING.md) and the
[Code of Conduct](CODE_OF_CONDUCT.md). Security issues: [SECURITY.md](SECURITY.md).

## Roadmap

Animated WebP · AVIF output · resize/crop · folder upload · public API (free core stays free)
· browser extension · WordPress plugin. Full plan in `AUDIT.md` and `CONTENT-PLAN.md`.

## License

[MIT](LICENSE) — free to use, modify, self-host and redistribute.
