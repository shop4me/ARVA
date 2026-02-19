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

## How to change promo pricing in future

- **Single source of truth:** `lib/pricing.ts` — edit `REGULAR_PRICE_BY_LINE_CONFIG` (crossed-out price) and `SALE_PRICE_BY_LINE_CONFIG` (price charged). Both the website and the Google Merchant feed use these maps.
- **Safety:** If any bucket has regular &lt; 100 and sale &gt; 900, the app will not use the promo maps (website falls back to product price; feed script throws). Run `npx tsx scripts/verify_pricing.ts` to print the safety table before deploying.
- **Website:** PDP shows regular (struck through) and sale as the main price; cart and checkout charge the sale price. No need to edit `data/products.json` for promo prices.
- **Feed:** Regenerate after changing prices: `npm run feed:merchant`. Output is `public/merchant/feed.xml`; the live route builds the feed from the same code. Keep `g:price` = regular and `g:sale_price` = sale so Google shows the discount and avoids price mismatch disapprovals.

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

## Blog rewrite and hero images

Rewrite the existing five posts in place and generate a lifestyle hero image for each post:

```bash
npm run blog rewrite
```

Hero images are saved to `public/blog/hero/<slug>.webp` and referenced from `data/posts.json` as `heroImage`.

## Where to plug in the backend

- **Data layer:** `lib/api.ts`. Replace the current in-memory reads with `fetch(`${API_URL}/api/products`)`, `fetch(`${API_URL}/api/products/${slug}`)`, etc. Keep the same function names and return shapes so pages need no changes.

## Deploy (DigitalOcean)

Build and run:

```bash
npm run build
npm run start
```

Set `metadataBase` and any env (e.g. `NEXT_PUBLIC_API_URL`) in your deployment environment.
