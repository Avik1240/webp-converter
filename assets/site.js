(() => {
  'use strict';
  const origin = 'https://webp-converter.jainavik2000.workers.dev'; // Replace with the production domain before launch.
  const currentPath = location.pathname.endsWith('/') ? location.pathname : `${location.pathname}/`;
  const conversions = [
    ['JPG to WebP', 'jpg-to-webp/'], ['PNG to WebP', 'png-to-webp/'], ['JPEG to WebP', 'jpeg-to-webp/'], ['GIF to WebP', 'gif-to-webp/'], ['BMP to WebP', 'bmp-to-webp/'], ['TIFF to WebP', 'tiff-to-webp/'], ['SVG to WebP', 'svg-to-webp/'], ['HEIC to WebP', 'heic-to-webp/'], ['WebP to PNG', 'webp-to-png/'], ['WebP to JPG', 'webp-to-jpg/']
  ];
  const faqs = [
    ['Is this WebP converter really free?', 'Yes. Core conversion is free and unlimited. There are no accounts, watermarks, or premium conversion limits.'],
    ['Are my images uploaded to a server?', 'No. Conversion happens in your browser with the Canvas API. Your source files remain on your device.'],
    ['Which image formats can I convert?', 'The tool supports image formats your browser can decode, including JPG, PNG, GIF, BMP, SVG, AVIF, and WebP. Support for HEIC and TIFF varies by browser.'],
    ['Does converting to WebP reduce quality?', 'WebP uses a quality setting. Lower settings usually create smaller files; 80–90 is a good balance for most photos.'],
    ['Can I convert several images at once?', 'Yes. Add multiple images and use Convert all. You can download each completed image individually.']
  ];
  const linkRoot = document.body.dataset.converterPage === 'home' ? '' : '../';
  const conversionLinks = document.getElementById('conversionLinks');
  if (conversionLinks) conversions.forEach(([label, path]) => { const a = document.createElement('a'); a.href = `${linkRoot}${path}`; a.textContent = label; conversionLinks.append(a); });
  const faqList = document.getElementById('faqList');
  if (faqList) faqs.forEach(([q, a]) => { const details = document.createElement('details'); const summary = document.createElement('summary'); const answer = document.createElement('p'); summary.textContent = q; answer.textContent = a; details.append(summary, answer); faqList.append(details); });
  const schema = document.getElementById('site-schema');
  if (schema) {
    // Build FAQ schema from the FAQs actually visible on this page, so markup always matches content.
    const pageFaqs = [...document.querySelectorAll('#faqList details, .faq details')]
      .map(d => [d.querySelector('summary')?.textContent.trim(), d.querySelector('p')?.textContent.trim()])
      .filter(([q, a]) => q && a);
    schema.textContent = JSON.stringify({ '@context':'https://schema.org', '@graph':[
      {'@type':'Organization','@id':`${origin}/#organization`,'name':'WebP Converter','url':origin},
      {'@type':'WebSite','@id':`${origin}/#website`,'url':origin,'name':'WebP Converter','publisher':{'@id':`${origin}/#organization`}},
      {'@type':'SoftwareApplication','name':'WebP Converter','applicationCategory':'UtilitiesApplication','operatingSystem':'Any','isAccessibleForFree':true,'offers':{'@type':'Offer','price':'0','priceCurrency':'USD'},'url':`${origin}${currentPath}`,'description':'A free browser-based image to WebP converter.'},
      ...(pageFaqs.length ? [{'@type':'FAQPage','mainEntity':pageFaqs.map(([name,text])=>({'@type':'Question','name':name,'acceptedAnswer':{'@type':'Answer','text':text}}))}] : []),
      {'@type':'WebPage','name':document.title,'url':`${origin}${currentPath}`,'isPartOf':{'@id':`${origin}/#website`}},
      ...(document.body.dataset.converterPage === 'home' ? [] : [{'@type':'BreadcrumbList','itemListElement':[{'@type':'ListItem','position':1,'name':'Home','item':origin},{'@type':'ListItem','position':2,'name':document.body.dataset.toolName || document.title,'item':`${origin}${currentPath}`}]}])
    ]});
  }
  document.getElementById('year')?.append(new Date().getFullYear());
  document.getElementById('shareBtn')?.addEventListener('click', async () => { const data = {title:document.title, text:'A free, private WebP image converter', url:location.href}; try { if (navigator.share) await navigator.share(data); else { await navigator.clipboard.writeText(location.href); alert('Link copied to your clipboard.'); } } catch (_) {} });
  window.trackEvent = (name, params={}) => { window.dataLayer = window.dataLayer || []; window.dataLayer.push({event:name, ...params}); };
  const analyticsId=document.querySelector('meta[name="google-analytics-id"]')?.content.trim();
  if (/^G-[A-Z0-9]+$/i.test(analyticsId)) { const script=document.createElement('script');script.async=true;script.src=`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(analyticsId)}`;document.head.append(script);window.dataLayer=window.dataLayer||[];window.gtag=function(){window.dataLayer.push(arguments);};window.gtag('js',new Date());window.gtag('config',analyticsId,{anonymize_ip:true}); }
})();

/* Motion: parallax scroll variable + scroll-reveal (respects prefers-reduced-motion) */
(() => {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      document.documentElement.style.setProperty('--scroll-y', String(window.scrollY));
      ticking = false;
    });
  };
  addEventListener('scroll', onScroll, {passive: true});
  onScroll();
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in-view'); io.unobserve(e.target); } });
    }, {threshold: .08, rootMargin: '0px 0px -5% 0px'});
    document.querySelectorAll('main section, main article, .feature-grid article, .steps li, .faq details').forEach((el) => {
      // Skip elements already visible on load so the first paint is never dimmed.
      if (el.getBoundingClientRect().top < innerHeight * .9) return;
      el.classList.add('reveal');
      io.observe(el);
    });
  }
})();
