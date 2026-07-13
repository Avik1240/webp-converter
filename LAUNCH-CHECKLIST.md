# Launch Checklist — what is missing & what you must do

> **STATUS UPDATE (2026-07-13):** Items A3–A6, B7–B14, and responsive fixes are DONE (favicon/manifest/og-image, 404/privacy/terms, placeholder cleanup, HEIC/TIFF notices, schema fixes, per-page meta, sitemap, JPEG transparency, CSP in vercel.json/nginx.conf, 320px responsive CSS). **Still open: A1 (domain — replace `example.com` in ~20 files), A2 (GitHub repo — replace `your-org` in 3 files), GA4 ID, Search Console/Bing verification, AdSense (post-launch), blog content.**

Audit date: 2026-07-13. Codebase is structurally solid (SEO pages, CI, security headers, a11y, ad/donation placeholders all exist). It is NOT live-ready. Blockers below, in order.

---

## A. Hard blockers (site is broken/misleading without these)

### 1. Placeholder domain everywhere
`https://example.com` appears in **18 files**: all canonicals, og:url, robots.txt, sitemap.xml, share URLs, and `assets/site.js` (`origin` const → all schema URLs are wrong).
**Do:** buy a domain, then find-and-replace `example.com` → your domain across the repo. Don't forget `assets/site.js` line 3.

### 2. Placeholder GitHub org
`github.com/your-org/webp-converter` in `index.html`, `assets/site.js`, `README.md`. Folder is not even a git repo yet.
**Do:** `git init`, create the GitHub repo, push, replace `your-org` with your username/org (3 files).

### 3. No favicon, no manifest, no social preview image
Zero icon/OG-image references in any page. Social shares render with no image; Lighthouse Best Practices/SEO drop.
**Do:** create favicon.ico + icon.svg + apple-touch-icon.png + site.webmanifest + a 1200×630 `og-image.png`; add `<link rel="icon" ...>` and `og:image` / `twitter:image` tags to every page (12 HTML files).

### 4. No privacy policy / terms pages
You load Google Analytics and plan AdSense. **AdSense will reject the site without a privacy policy.** GDPR also requires it since GA sets cookies.
**Do:** add `/privacy/` and `/terms/` pages, link in footer, add to sitemap. If you expect EU traffic, add a consent banner before GA fires (or use cookieless analytics like Plausible/GoatCounter).

### 5. Fake content shipped live
- Testimonials section shows literal placeholder quotes ("A clear, trustworthy placeholder…"). This looks fake to users and to Google's quality raters.
- "Sponsored tools" section has three dead `href="#"` links.
- Four ad slots render as visible empty "Advertisement" boxes.
**Do:** delete or `hidden` the testimonials and sponsored sections until you have real ones. Hide ad-slot divs with CSS until AdSense is approved.

### 6. HEIC / TIFF pages promise conversions that fail
Conversion uses Canvas decode. Chrome/Firefox/Edge **cannot decode HEIC or TIFF** — those two landing pages will fail for ~90% of visitors (high bounce = ranking poison).
**Do (pick one):**
- Integrate decoders: `heic2any` (or libheif-wasm) and `utif.js`, self-hosted in `/assets/vendor/` (CDN scripts would violate your CSP), loaded lazily only on those pages; or
- Add capability detection with an honest inline warning + remove those pages from sitemap until fixed.

---

## B. Should fix before launch (quality/SEO correctness)

### 7. FAQ schema is duplicated site-wide and mismatched
`site.js` injects the *homepage* FAQPage schema on every page, but landing pages display different FAQs. Schema must match visible content (Google spam policy).
**Do:** in `site.js`, only emit FAQPage on home; per-page FAQs should get their own schema built from the page's `<details>` elements.

### 8. SoftwareApplication schema missing `offers`
Google requires `offers` (or aggregateRating) for SoftwareApplication rich results.
**Do:** add `"offers":{"@type":"Offer","price":"0","priceCurrency":"USD"}`.

### 9. Landing pages missing meta
Conversion pages lack `og:url`, `og:type`, twitter card tags, and `meta name="robots"`. Blog pages lack schema.
**Do:** copy the homepage meta block pattern into the 10 landing pages + 2 blog pages.

### 10. Sitemap incomplete
Missing `/blog/` and `/blog/webp-vs-png/`; no `<lastmod>`.
**Do:** add both URLs (+ privacy/terms once created), add lastmod dates.

### 11. WebP→JPG transparency bug
Canvas → JPEG turns transparent pixels black.
**Do:** in `app.js convertImage()`, when output is `image/jpeg`, fill canvas white before `drawImage`.

### 12. Security headers depend on host
`_headers` (with CSP) only works on **Cloudflare Pages / Netlify**. `vercel.json` has no CSP. **GitHub Pages ignores all of it** — you'd ship with zero security headers.
**Do:** pick host = Cloudflare Pages or Netlify (recommended; free, `_headers` just works). If Vercel, copy the CSP into `vercel.json`. Avoid GitHub Pages as the primary host.

### 13. If/when AdSense goes live, CSP will block it
Current CSP `script-src 'self' googletagmanager.com` blocks `pagead2.googlesyndication.com`.
**Do (later, at AdSense step):** extend script-src/frame-src/img-src per Google's AdSense CSP docs, uncomment `ads.txt` with your real pub ID.

### 14. Minor
- "Download all" fires 50 sequential downloads; browsers may block after the first few. Add JSZip (self-hosted) for a real ZIP later.
- Body font declares `Inter` but never loads it — either self-host Inter (preload, `font-display: swap`) or drop it from the font stack.
- Tests only check file existence + `node --check`; fine for launch, add link-checker later.

---

## C. Step-by-step launch sequence

1. **Repo**: `git init` → commit → create GitHub repo → push → replace `your-org` (3 files). Enable GitHub Sponsors / create Buy Me a Coffee, then put real URLs in `index.html` support section (or hide that section).
2. **Domain**: buy domain → replace `example.com` everywhere (18 files) → update `robots.txt`, `sitemap.xml`, `site.js`.
3. **Assets**: favicon set, manifest, og-image; add tags to all 12 pages.
4. **Pages**: create `404.html`, `/privacy/`, `/terms/`; footer links; sitemap entries.
5. **Cleanup**: remove fake testimonials, dead sponsored links; hide ad slots.
6. **Fixes**: items 6–11 above (HEIC/TIFF, schema, meta, sitemap, JPG transparency).
7. **Deploy**: connect repo to Cloudflare Pages (build command: none, output dir: `/`). Point domain, enable HTTPS.
8. **Verify**: securityheaders.com scan; Lighthouse (mobile) on `/` and one landing page — fix anything under 95; test convert/download on Chrome, Firefox, Safari, and a phone.
9. **Search engines**: Google Search Console → verify (paste token into the empty `google-site-verification` meta) → submit sitemap. Same for Bing (`msvalidate.01`).
10. **Analytics**: create GA4 property → paste `G-XXXX` into the `google-analytics-id` meta (it auto-loads). Add consent banner if targeting EU.
11. **Monetize (after ~2–4 weeks of traffic + 15–20 blog posts)**: apply for AdSense (needs privacy policy, real content, traffic) → on approval: real `ads.txt`, ad units into the hidden slots, CSP update.
12. **Growth**: launch on Product Hunt / r/webdev / HN Show; publish 2–3 blog articles per week from the 100-article plan; the blog currently has **1 article** — this is your main long-term traffic lever, not the tool pages.

---

## D. Realistic expectations (pushback)

- 10 near-identical landing pages with ~150 words each is thin; "jpg to webp" is a high-competition keyword owned by Cloudconvert/Convertio/Squoosh. Rankings will come from long-tail blog content, not the converter pages. Budget months, not weeks.
- AdSense revenue on a utility site with mostly one-visit users is low (RPM often $1–5). Donations/sponsors need an audience first. Treat revenue as a year-one trickle.
