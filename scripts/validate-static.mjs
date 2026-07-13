import { readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const required = [
  'index.html', '404.html', 'privacy/index.html', 'terms/index.html',
  'blog/index.html', 'blog/webp-vs-png/index.html',
  'assets/styles.css', 'assets/extras.css', 'assets/app.js', 'assets/site.js', 'assets/conversion-page.js',
  'assets/og-image.png', 'assets/icons/icon.svg', 'assets/icons/icon-192.png', 'assets/icons/icon-512.png', 'assets/icons/apple-touch-icon.png',
  'favicon.ico', 'site.webmanifest', 'robots.txt', 'sitemap.xml'
];
const routes = ['jpg-to-webp','png-to-webp','jpeg-to-webp','gif-to-webp','bmp-to-webp','tiff-to-webp','svg-to-webp','heic-to-webp','webp-to-png','webp-to-jpg'];
for (const file of [...required, ...routes.map(route => `${route}/index.html`)]) {
  try { await stat(join(root,file)); } catch { throw new Error(`Missing required file: ${file}`); }
}
const seoPages = ['index.html', 'blog/index.html', 'blog/webp-vs-png/index.html', ...routes.map(route => `${route}/index.html`)];
for (const file of seoPages) {
  const html = await readFile(join(root,file),'utf8');
  for (const needle of ['<title>', 'rel="canonical"', 'name="description"', 'property="og:image"', 'name="twitter:card"', 'rel="icon"', 'name="viewport"']) {
    if (!html.includes(needle)) throw new Error(`SEO metadata missing in ${file}: ${needle}`);
  }
}
const sitemap = await readFile(join(root,'sitemap.xml'),'utf8');
for (const route of [...routes, 'blog', 'privacy', 'terms']) {
  if (!sitemap.includes(`/${route}/`)) throw new Error(`Sitemap missing route: /${route}/`);
}
console.log(`Validated ${routes.length} conversion routes, ${seoPages.length} SEO pages, sitemap coverage, and required static assets.`);
