## Second Brain — Technical SEO Implementation Plan (Day-by-Day)

> Scope: Public routes (/, /our-pricing, /privacy-policy, /terms-and-conditions). Private app routes will be noindex.

### Day 1 — Foundations (Meta, Head, Robots, Sitemap)
- [x] Add meta description to `index.html` (300–500 chars, value-based, CTA)
- [x] Add canonical link to `index.html` (production domain)
- [x] Add Open Graph (og:title, og:description, og:image) and Twitter Card tags
- [x] Add theme-color, color-scheme, manifest, and multi-size favicons
- [x] Create `public/robots.txt` (Disallow private app routes; allow public)
- [x] Create `public/sitemap.xml` with public routes and lastmod/priority
- [x] Add OG image assets (using existing `/dashboard.png` as social preview)
- [x] Verify in browser: view-source and meta presence; robots reachable
- [x] Deliverable: PR with head tags, robots.txt, sitemap.xml, OG assets

### Day 2 — Route-level Metadata (Titles, Descriptions per Page)
- [x] Install and set up `react-helmet-async`
- [x] Add unique `<title>` and meta description for `/` (Landing)
- [x] Add unique `<title>` and meta description for `/our-pricing`
- [x] Add unique `<title>` and meta description for `/privacy-policy`
- [x] Add unique `<title>` and meta description for `/terms-and-conditions`
- [x] Add canonical tags per route
- [x] Add `noindex, nofollow` meta for private app routes
- [x] QA: navigate all routes and confirm titles/meta update correctly
- [x] Deliverable: PR with Helmet usage and route-level SEO components

### Day 3 — Pre-render/SSG (SPA SEO) - ❌ CANCELLED
- [❌] ~~Choose plugin: `vite-plugin-seo-prerender`~~ (Cancelled - slowed down build time)
- [❌] ~~Configure pre-render for: `/`, `/our-pricing`, `/privacy-policy`, `/terms-and-conditions`~~ (Cancelled)
- [❌] ~~Ensure critical content (H1/hero) is server-rendered in static HTML~~ (Cancelled)
- [❌] ~~Test build and inspect `dist/` HTML for content presence~~ (Cancelled)
- [❌] ~~Deliverable: PR enabling pre-render of public routes~~ (Cancelled)
- [❌] **Decision**: Pre-render process slowed down build time by 8-10 seconds. Continuing as SPA.

### Day 4 — Structured Data (JSON-LD)
- [ ] Add Organization schema (name, url, logo, sameAs) on `/`
- [ ] Add Product schema for Second Brain (description, image, url, offers)
- [ ] Add WebSite + SearchAction (if on-site search exists; else skip)
- [ ] Add Offer/AggregateOffer on `/our-pricing`
- [ ] Add WebPage schema to policy pages (or Article if applicable)
- [ ] Validate with Rich Results Test; fix warnings
- [ ] Deliverable: PR with JSON-LD blocks and validation notes

### Day 5 — Core Web Vitals & Media Optimization
- [ ] Add `loading="lazy"` and `decoding="async"` to non-critical images
- [ ] Convert hero/large images to WebP/AVIF with `srcset` responsive variants
- [ ] Define explicit `width`/`height` for images to reduce CLS
- [ ] Ensure Tailwind purge captures all classes (avoid dynamic string builds)
- [ ] Preload critical font(s); add `font-display: swap`
- [ ] Run Lighthouse against prod preview; fix LCP/CLS/INP issues
- [ ] Deliverable: PR with media optimizations and LH report

### Day 6 — Security & Caching Headers
- [ ] Add production headers in `vercel.json`: HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- [ ] Add a strict `Content-Security-Policy` (allow Supabase & Datadog domains; avoid unsafe-inline/eval)
- [ ] Set long-lived `Cache-Control` for hashed assets; shorter for HTML
- [ ] Verify headers in prod preview (DevTools > Network)
- [ ] Deliverable: PR with header updates

### Day 7 — PWA (Optional but Recommended)
- [ ] Install `vite-plugin-pwa` and configure manifest (name, icons, theme/background)
- [ ] Add service worker with basic offline caching (public routes)
- [ ] Validate installability in Lighthouse
- [ ] Deliverable: PR enabling PWA features

### Day 8 — Internationalization & Hreflang (If/When Multilingual)
- [ ] Decide URL structure (e.g., /en, /tr)
- [ ] Add `hreflang` alternates and language-specific canonicals
- [ ] Extend sitemap per locale
- [ ] Deliverable: PR with hreflang and i18n sitemap changes

### Day 9 — Internal Linking & Content Signals
- [ ] Add descriptive internal links from Landing to Pricing/Policies
- [ ] Ensure a single H1 per page and proper H2/H3 hierarchy
- [ ] Improve alt text for images (descriptive, keyword-rich but natural)
- [ ] Deliverable: PR with copy/linking/a11y refinements

### Day 10 — Monitoring & CI
- [ ] Add Lighthouse CI to pipeline (budget thresholds for CWV)
- [ ] Add simple script to regenerate `sitemap.xml` on build
- [ ] Document runbook for SEO checks before releases
- [ ] Deliverable: PR with LHCI and build scripts

---

## Dependencies & Tools
- [ ] Add: `react-helmet-async`, `vite-plugin-ssg`/`vite-plugin-prerender`, `vite-plugin-pwa`
- [ ] Optional: Lighthouse CI (`@lhci/cli`) for automated checks

## Acceptance Criteria (Global)
- [ ] Public pages return correct titles, meta, canonical, OG/Twitter
- [ ] Pre-rendered HTML contains above-the-fold content (H1/hero)
- [ ] Robots & sitemap correctly reflect public vs private areas
- [ ] JSON-LD validates without critical errors
- [ ] Lighthouse scores: Performance ≥ 90, Accessibility ≥ 95, SEO ≥ 100


