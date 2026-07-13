# WebP Converter

A free, unlimited, browser-based image converter. Images are processed locally with the browser Canvas API: no account, server upload, watermark, or paid infrastructure is required.

## Features

- Batch conversion with adjustable quality, individual downloads, progress, and error states.
- Responsive, keyboard-accessible interface with reduced-motion support.
- Format landing pages for JPG, JPEG, PNG, GIF, BMP, TIFF, SVG, HEIC, WebP-to-PNG, and WebP-to-JPG.
- Technical SEO: canonical tags, Open Graph, Twitter cards, JSON-LD, sitemap, robots rules, and internal links.
- Optional analytics, ad slots, donations, sponsor links, and affiliate-ready sections—never placed inside the conversion flow.

## Run locally

This project has no runtime dependency. Open `index.html` in a modern browser, or serve the directory:

```bash
npm run build
npx serve .
```

`npm run build` runs JavaScript syntax checks and validates required routes and SEO tags.

## Configure before publishing

1. Replace every `https://example.com` with your canonical HTTPS domain, including `sitemap.xml`, `robots.txt`, and canonical tags.
2. Update donation URLs (Buy Me a Coffee, Patreon) with real project links when available.
3. Put a valid GA4 measurement ID in `<meta name="google-analytics-id">` if you want analytics. Add Search Console and Bing verification tokens to their existing meta tags.
4. Replace each `Advertisement` slot with your approved AdSense unit only after your privacy policy and consent requirements are satisfied. Keep ads out of the converter card.

## Deployment

- **GitHub Pages:** enable Pages from the `main` branch or use the included `pages.yml` workflow. Static routes use directory `index.html` files.
- **Netlify:** connect the repository; publish directory is `.`. `_headers` supplies security and cache headers.
- **Vercel:** import the repository as a static site. `vercel.json` adds baseline headers.
- **Cloudflare Pages:** connect the repo, leave build command blank, set output directory to `.`; `_headers` is supported.
- **Docker/self-hosting:** `docker build -t webp-converter . && docker run -p 8080:80 webp-converter`.

For GitHub Pages under a project subpath, use relative asset links as already implemented. Set canonical URLs to the public custom domain whenever possible.

## Privacy and supported formats

The browser must be able to decode an input before Canvas can convert it. JPG, PNG, GIF, BMP, WebP, AVIF, and SVG are commonly supported. TIFF and HEIC support depends on browser and OS. Animated GIFs export the current rendered frame, not an animation.

The client limits each batch to 50 files and 50 MB per file to reduce browser memory pressure. The limit is a safety guard, not a paywall.

## Architecture

| Path | Purpose |
| --- | --- |
| `index.html` | Product homepage, converter, trust, revenue, and growth sections |
| `assets/app.js` | Local file validation, Canvas conversion queue, downloads, events |
| `assets/site.js` | JSON-LD, links, FAQs, sharing, optional GA4 |
| `assets/conversion-page.js` | Shared interactive tool for SEO landing pages |
| `*/index.html` | Unique format-specific metadata and editorial content |
| `_headers`, `nginx.conf` | Security and caching headers for supported hosts |

## SEO content roadmap

Publish genuinely helpful articles—do not auto-publish thin pages. Each article should include an original example, a concise answer near the top, 3–5 People Also Ask-style questions, relevant screenshots or diagrams, an author/reviewer, and links to the appropriate converter.

1. What Is WebP?  
2. WebP vs PNG  
3. WebP vs JPEG  
4. AVIF vs WebP  
5. How to Reduce Image Size Without Losing Quality  
6. Best Image Format for Websites  
7. Image Optimization Guide for Beginners  
8. Website Speed Optimization With Images  
9. Image Compression for SEO  
10. Google Core Web Vitals and Images  
11. How to Convert JPG to WebP  
12. How to Convert PNG to WebP  
13. How to Convert WebP to JPG  
14. How to Convert WebP to PNG  
15. How to Open WebP Files  
16. How to Save WebP as JPG  
17. How to Save WebP as PNG  
18. Is WebP Better Than JPG?  
19. Is WebP Better Than PNG?  
20. Does WebP Support Transparency?  
21. Does WebP Support Animation?  
22. WebP File Size Calculator Guide  
23. Lossy vs Lossless Image Compression  
24. What Is Image Metadata?  
25. How Image Dimensions Affect File Size  
26. Best WebP Quality Setting  
27. WebP Quality 80 vs 90  
28. Image Optimization for Shopify  
29. Image Optimization for WordPress  
30. Image Optimization for Next.js  
31. Image Optimization for React  
32. Image Optimization for Static Sites  
33. Lazy Loading Images Explained  
34. Responsive Images With srcset  
35. How to Improve Largest Contentful Paint  
36. How to Optimize Hero Images  
37. How to Optimize Product Images  
38. How to Optimize Portfolio Images  
39. WebP for Ecommerce  
40. WebP for Photography Websites  
41. WebP Browser Support Guide  
42. Image Formats Supported by Chrome  
43. Image Formats Supported by Safari  
44. Image Formats Supported by Firefox  
45. Why Is My WebP File Not Opening?  
46. Why Are PNG Files So Large?  
47. Why Are BMP Files So Large?  
48. HEIC vs JPEG for Photos  
49. TIFF vs PNG  
50. SVG vs PNG  
51. When to Use SVG  
52. When to Use PNG  
53. When to Use JPEG  
54. When to Use WebP  
55. When to Use AVIF  
56. Convert iPhone HEIC Photos for the Web  
57. Convert Screenshots to WebP  
58. Convert Logo PNG to WebP  
59. Convert Blog Images to WebP  
60. Convert WooCommerce Images to WebP  
61. WebP for Email: What Works?  
62. WebP Accessibility Considerations  
63. Image Alt Text Best Practices  
64. Image Sitemap Guide  
65. Open Graph Image Best Practices  
66. How to Create Social Sharing Images  
67. Image CDN vs Local Optimization  
68. Client-side Image Conversion Explained  
69. Is Browser Image Conversion Private?  
70. How Canvas Image Conversion Works  
71. Batch Image Conversion Tips  
72. How to Rename Image Files for SEO  
73. Image File Naming Best Practices  
74. How to Audit Website Images  
75. How to Find Oversized Images  
76. Mobile Image Optimization Checklist  
77. Performance Budget for Images  
78. How to Test Image Page Speed  
79. Lighthouse Image Optimization Audit  
80. Common WebP Conversion Errors  
81. WebP Transparency Troubleshooting  
82. Animated WebP vs GIF  
83. PNG Compression vs WebP Conversion  
84. JPEG Compression vs WebP Conversion  
85. Best Free Image Optimization Tools  
86. Best Self-hosted Image Tools  
87. Open-source Image Optimization Tools  
88. WebP API Design Guide  
89. Build a Browser Image Converter  
90. Browser File API Guide  
91. Secure File Upload UX Patterns  
92. Image Processing Privacy Policy Template  
93. How to Prepare Images for Product Hunt  
94. Image Optimization for Core Web Vitals  
95. How to Measure Image Compression Savings  
96. WebP Migration Checklist  
97. Image Format Decision Tree  
98. SEO Checklist for Image-heavy Sites  
99. How to Use WebP in CSS  
100. Future of Web Image Formats

## Roadmap

Potential additions are deliberately modular: AVIF output, resizing/cropping, compression presets, ZIP packaging, folder input, background-removal providers, an API, desktop app, browser extension, and CMS plugins. Keep all core local conversion free.

## Contributing and security

See [CONTRIBUTING.md](CONTRIBUTING.md), [SECURITY.md](SECURITY.md), and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md). This project is released under the [MIT License](LICENSE).
