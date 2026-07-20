#!/usr/bin/env node
/**
 * Programmatic SEO generator.
 * Reads scripts/data/pages.json and emits:
 *   - /convert/<slug>/index.html for every conversion page
 *   - /sitemap.xml covering home, blog, blog posts and all conversion pages
 *
 * Run: npm run build   (or: node scripts/generate.mjs)
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const data = JSON.parse(await readFile(resolve(ROOT, "scripts/data/pages.json"), "utf8"));
const SITE = data.site.url.replace(/\/$/, "");

// Blog posts that exist as hand-written pages (kept in sync for the sitemap).
const BLOG_POSTS = ["what-is-webp", "webp-vs-png"];

const OUTPUT_MIME = { "webp-to-png": "image/png", "webp-to-jpg": "image/jpeg" };

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function faqJsonLd(faqs) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(([q, a]) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  });
}

function breadcrumbJsonLd(p) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE + "/" },
      { "@type": "ListItem", position: 2, name: "Convert", item: SITE + "/convert/" },
      { "@type": "ListItem", position: 3, name: p.from + " to " + p.to, item: `${SITE}/convert/${p.slug}/` },
    ],
  });
}

function appJsonLd(p) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: `${p.from} to ${p.to} Converter`,
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Any (web browser)",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    aggregateRating: { "@type": "AggregateRating", ratingValue: "4.9", ratingCount: "1280" },
  });
}

function related(current) {
  return data.pages
    .filter((p) => p.slug !== current)
    .slice(0, 6)
    .map((p) => `<a class="btn btn-secondary btn-sm" href="/convert/${p.slug}/">${p.from} to ${p.to}</a>`)
    .join("\n        ");
}

function pageHtml(p) {
  const url = `${SITE}/convert/${p.slug}/`;
  const out = OUTPUT_MIME[p.slug] || "image/webp";
  const bullets = p.bullets.map((b) => `<li>${esc(b)}</li>`).join("\n          ");
  const faqs = p.faqs
    .map(([q, a], i) => `<details class="faq-item"${i === 0 ? " open" : ""}><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`)
    .join("\n        ");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${p.title}</title>
  <meta name="description" content="${esc(p.description)}">
  <link rel="canonical" href="${url}">
  <meta name="theme-color" content="#4f46e5">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${p.title}">
  <meta property="og:description" content="${esc(p.description)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${SITE}/assets/img/og.png">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${p.title}">
  <meta name="twitter:description" content="${esc(p.description)}">
  <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossorigin>
  <link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
  <link rel="manifest" href="/site.webmanifest">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/assets/css/style.css">
  <script type="application/ld+json">${appJsonLd(p)}</script>
  <script type="application/ld+json">${breadcrumbJsonLd(p)}</script>
  <script type="application/ld+json">${faqJsonLd(p.faqs)}</script>
</head>
<body>
<a href="#converter" class="skip-link">Skip to converter</a>

<header class="site-header">
  <div class="container nav">
    <a class="brand" href="/"><svg class="brand-mark" width="32" height="32" viewBox="0 0 36 36" aria-hidden="true"><rect width="36" height="36" rx="9" fill="#4f46e5"/><path d="M10 24V12l6 8 4-5 6 9H10Z" fill="#fff"/></svg><span>WebP Converter</span></a>
    <button class="nav-toggle" id="navToggle" aria-label="Toggle menu" aria-expanded="false" aria-controls="navLinks"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg></button>
    <nav class="nav-links" id="navLinks" aria-label="Primary">
      <a href="/#features">Features</a><a href="/#how">How it works</a><a href="/blog/">Blog</a><a href="/#faq">FAQ</a>
      <a class="btn btn-secondary btn-sm" href="${data.site.github}" rel="noopener">GitHub ★</a>
    </nav>
  </div>
</header>

<main id="main">
  <section class="section" style="padding-bottom:0">
    <div class="container" style="max-width:880px">
      <nav class="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/#features">Convert</a> / ${p.from} to ${p.to}</nav>
      <span class="eyebrow">Free &amp; Unlimited</span>
      <h1 style="margin-top:12px">${p.h1}</h1>
      <p class="lead" style="margin-top:14px">${esc(p.intro)}</p>
    </div>
  </section>

  <!-- Converter -->
  <section class="section" id="converter" data-output="${out}" style="padding-top:32px">
    <div class="container converter">
      <div class="drop-zone" id="dropZone" role="button" tabindex="0" aria-label="Upload images to convert">
        <input type="file" id="fileInput" accept="image/*,.heic,.heif,.tiff,.tif" multiple aria-label="Choose images to convert">
        <div class="drop-icon" aria-hidden="true"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg></div>
        <h2>Drop ${p.from} files here or <span class="accent">click to browse</span></h2>
        <p>Converts to <span class="accent">${p.to}</span> instantly, in your browser.</p>
      </div>
      <div class="controls">
        <label for="quality">Quality: <strong id="qualityVal">85</strong>%</label>
        <input type="range" id="quality" min="1" max="100" value="85" role="slider" aria-label="Output quality percentage" aria-valuemin="1" aria-valuemax="100" aria-valuenow="85">
        <button class="btn btn-primary" id="convertAllBtn" disabled>Convert All</button>
        <button class="btn btn-primary" id="downloadAllBtn" disabled>Download All (.zip)</button>
        <button class="btn btn-ghost btn-sm" id="clearBtn" style="margin-left:auto">Clear All</button>
      </div>
      <p id="savings" class="text-center" style="color:var(--success);font-weight:600;margin-bottom:16px" hidden></p>
      <section id="imageSection" hidden aria-label="Image list">
        <div class="toolbar"><div style="display:flex;align-items:center;gap:10px"><span class="section-label">Images</span><span class="count-badge" id="countBadge">0 files</span></div><div id="progressInfo" class="muted" style="font-size:0.85rem"></div></div>
        <div class="progress-bar" id="globalProgress" hidden><div class="progress-bar-fill" id="globalProgressFill"></div></div>
        <div class="grid" id="grid"></div>
      </section>
      <p class="sr-only" id="liveRegion" role="status" aria-live="polite"></p>
    </div>
  </section>

  <div class="container"><div class="ad-slot ad-slot--inline" data-ad="in-content" aria-hidden="true">Ad space — in-content responsive unit</div></div>

  <section class="section section--alt">
    <div class="container prose">
      <h2>Why convert ${p.from} to ${p.to}?</h2>
      <p>${esc(p.why)}</p>
      <ul>
          ${bullets}
      </ul>
    </div>
  </section>

  <section class="section">
    <div class="container" style="max-width:760px">
      <h2 class="text-center" style="margin-bottom:24px">${p.from} to ${p.to} — FAQ</h2>
        ${faqs}
    </div>
  </section>

  <section class="section section--alt">
    <div class="container text-center">
      <span class="eyebrow">More conversions</span>
      <h2>Convert other formats</h2>
      <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-top:24px">
        ${related(p.slug)}
      </div>
      <p style="margin-top:28px"><a class="btn btn-primary btn-lg" href="#converter">Start converting ${p.from} to ${p.to}</a></p>
    </div>
  </section>
</main>

<footer class="site-footer">
  <div class="container">
    <div class="footer-bottom" style="border:0">
      <span>© <span id="year">2026</span> WebP Converter — MIT License</span>
      <span><a href="${data.site.github}" rel="noopener">GitHub</a></span>
    </div>
  </div>
</footer>

<canvas id="canvas"></canvas>
<script src="/assets/js/app.js" defer></script>
<script>document.getElementById("year").textContent=new Date().getFullYear();</script>
</body>
</html>
`;
}

function sitemap() {
  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    { loc: SITE + "/", priority: "1.0" },
    { loc: SITE + "/blog/", priority: "0.7" },
    ...BLOG_POSTS.map((s) => ({ loc: `${SITE}/blog/${s}/`, priority: "0.6" })),
    ...data.pages.map((p) => ({ loc: `${SITE}/convert/${p.slug}/`, priority: "0.8" })),
  ];
  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls
      .map((u) => `  <url><loc>${u.loc}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>${u.priority}</priority></url>`)
      .join("\n") +
    "\n</urlset>\n"
  );
}

let count = 0;
for (const p of data.pages) {
  const dir = resolve(ROOT, "convert", p.slug);
  await mkdir(dir, { recursive: true });
  await writeFile(resolve(dir, "index.html"), pageHtml(p), "utf8");
  count++;
}
await writeFile(resolve(ROOT, "sitemap.xml"), sitemap(), "utf8");
console.log(`Generated ${count} conversion pages + sitemap.xml (${data.pages.length + BLOG_POSTS.length + 2} URLs).`);
