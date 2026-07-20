# Phase 1 — Project Audit & Improvement Roadmap

Audit of the original single-file app (`webp-converter.html`, 573 lines) and the roadmap
that this transformation follows.

## Starting point

A single dark-themed HTML file with inline CSS/JS. One screen: drag-drop, quality slider,
per-file and batch convert, ZIP download via lazily-loaded JSZip. Conversion is 100%
client-side via `<img>` + `canvas.toBlob('image/webp')`. No build, no docs, no SEO, no
routing, no monetization.

The client-side, zero-backend design is the project's biggest asset — it already satisfies
*unlimited / free / no-registration / no-paid-infra*. The transformation preserves it.

## 1. Architecture review

| Observation | Severity | Action |
|---|---|---|
| Single file, no separation of concerns | Med | Split into `assets/css`, `assets/js`, multi-page structure |
| No routing / only one URL | High (SEO) | Add `/convert/*` landing pages + `/blog/*` |
| No build step → can't scale content | Med | Add `scripts/generate.mjs` programmatic generator |
| Inline `onclick` handlers | Low | Replaced with event delegation (also CSP-friendly) |
| No state beyond an array | OK | Kept simple; sufficient for the use case |

## 2. Performance issues

| Issue | Impact | Fix |
|---|---|---|
| Full-size DataURL thumbnails held in memory | Memory on large batches | Use `object-fit` thumbnails + `URL.createObjectURL`, `loading="lazy"` |
| No font strategy | Render-blocking risk | `display=swap` + preconnect |
| No caching headers | Repeat-visit speed | `_headers` with immutable asset cache |
| Synchronous batch loop blocks UI | Jank on big batches | Sequential async with progress + yielding |
| No lazy-loading of heavy deps | — | JSZip / HEIC / TIFF decoders loaded on demand only |

## 3. SEO issues (was: effectively zero)

- Generic `<title>`, no meta description, no canonical, no OG/Twitter, no structured data, no sitemap, no robots.txt, single thin URL.
- **Fixed:** keyword-targeted titles/descriptions, canonical, OG + Twitter cards, JSON-LD (WebSite, Organization, WebPage, SoftwareApplication, FAQPage, BreadcrumbList, Article), `sitemap.xml`, `robots.txt`, 10 conversion landing pages, blog cluster, internal-linking.

## 4. Accessibility issues

| Issue | Fix |
|---|---|
| Drop zone not keyboard reachable | `role="button"`, `tabindex=0`, Enter/Space handler |
| No status announcements | `aria-live` region for upload/convert/error states |
| Low-contrast dark grays (#555 on #0f0f13 failed AA) | New light theme meets WCAG AA; dark mode tuned |
| Slider had no ARIA | `role="slider"` + `aria-valuenow/min/max` |
| No skip link / focus styles | Added skip link + visible `:focus-visible` |
| Icon-only buttons unlabeled | `aria-label` on remove/menu buttons |
| No reduced-motion support | `prefers-reduced-motion` disables animation |

## 5. Security issues

| Issue | Fix |
|---|---|
| No input validation (type/size/count) | Type allow-list, 50MB cap, 100-file cap |
| `innerHTML` with raw filenames → XSS | `escapeHtml()` on all user-supplied strings |
| No CSP / security headers | `_headers` + `netlify.toml` CSP, X-CTO, frame options, Permissions-Policy |
| External script without integrity hints | `crossorigin="anonymous"` on CDN scripts; CSP allow-list |
| (Note) Pure static site → no CSRF/rate-limit surface server-side | Documented in SECURITY.md |

## 6. UX issues

- No hero, no explanation of privacy/limits, no trust signals → looked like a dev tool, not a product.
- No empty state, no cumulative savings feedback, no success summary.
- **Fixed:** hero with clear value prop + dual CTA, features/how-it-works/FAQ/testimonials, live "saved X%" feedback, skeleton loaders, per-file size delta, mobile nav.
- **Honesty fix:** the original advertised HEIC/TIFF support but `canvas` cannot decode them — they failed silently. Now decoded via on-demand `heic2any`/`UTIF`, so the claim is true.

## 7. Revenue opportunities (implemented as non-intrusive placeholders)

- **AdSense** slots: top banner, in-content (placed *after* the tool), footer — never between upload and download.
- **Donations:** GitHub Sponsors, Buy Me a Coffee, Patreon.
- **Sponsorships:** "Sponsored Tools" cards.
- **Affiliates:** image tools / hosting / dev tools cards.
- **Future:** paid API tier (free core stays free) — see roadmap.

Guiding rule: **ads never interrupt the conversion workflow.**

## 8. Growth opportunities

- Programmatic SEO: 10 conversion pages now, architecture scales to dozens.
- Content engine: 100-article plan (`CONTENT-PLAN.md`) targeting low-competition, high-intent terms + featured snippets.
- Viral: share buttons (X/LinkedIn/Reddit), copy-link, GitHub star CTA, Product Hunt placeholder.
- Open-source flywheel: contributors → backlinks → authority.

## Roadmap (sequenced)

**Now (this transformation):** modern UI, multi-page, SEO foundation, 10 landing pages, 2 sample posts + content plan, monetization placeholders, OSS files, CI/CD, deploy configs.

**Next (2–6 weeks):** publish P1 blog articles; replace placeholder testimonials/ratings with real ones; add real AdSense/GA IDs; submit sitemap to Search Console + Bing; templatize blog posts via `posts.json`.

**Later (Phase 14 features):** animated WebP, AVIF output, resize/crop, folder upload, ZIP-in, public API (free core preserved), browser extension, WordPress plugin.

> ⚠️ **Honesty note on metrics:** the `aggregateRating` (4.9/1280) in the JSON-LD is a
> placeholder. Fake review schema violates Google's guidelines and risks a manual action.
> Replace with real ratings or remove before launch — flagged in README.
