# ARVA Frontend (livearva.com)

Next.js App Router frontend for ARVA. Built for **correct Google indexing**: SSR/ISR, unique metadata per route, canonicals, sitemap, and Product JSON-LD.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or 3001 if 3000 is in use).

## Verify indexing setup

1. **View Page Source** (Ctrl+U / Cmd+Option+U) on:
   - `/` — H1 "ARVA Modern Furniture", canonical `https://livearva.com`
   - `/products/m1-sectional` — H1 "M1 Sectional", price, description, Product JSON-LD, canonical `https://livearva.com/products/m1-sectional`
   - `/blog/first-post` — H1 "First Post", excerpt/body, canonical `https://livearva.com/blog/first-post`
2. **Sitemap:** [http://localhost:3000/sitemap.xml](http://localhost:3000/sitemap.xml) — lists homepage, /products, /blog, all product and blog URLs.
3. **Robots:** [http://localhost:3000/robots.txt](http://localhost:3000/robots.txt) — `Allow: /`, `Sitemap: https://livearva.com/sitemap.xml`

## Where to edit content

- **Products and PDP details:** `data/products.json` and `data/productDetails.json`
- **Blog posts:** `data/posts.json`

## Blog generator

Generate and publish the five ARVA blog articles via OpenAI (server only).

```bash
npm run blog -- generate
```

Idempotent default behavior is to skip existing slugs.

To update existing posts instead of skipping:

```bash
npm run blog -- generate --update
```

## Where to plug in the backend

- **Data layer:** `lib/api.ts`. Replace the current in-memory reads with `fetch(`${API_URL}/api/products`)`, `fetch(`${API_URL}/api/products/${slug}`)`, etc. Keep the same function names and return shapes so pages need no changes.

## Deploy (DigitalOcean)

Build and run:

```bash
npm run build
npm run start
```

Set `metadataBase` and any env (e.g. `NEXT_PUBLIC_API_URL`) in your deployment environment.
