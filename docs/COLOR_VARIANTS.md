# Color-variant hero images (masked, QA-gated)

High-quality, photo-real hero images per sofa color for PDP and Google Shopping. **Only the upholstery color changes**; geometry, seams, stitching, lighting, shadows, camera angle, and background stay identical.

## Architecture

- **Base hero** per product: one image per slug (e.g. `atlas-sectional`) from `data/productDetails.json` → `images.hero`.
- **Mask** per base hero: `assets/masks/{slug}-mask.png`. White = upholstery (region to recolor), black = everything else.
- **Output**: one image per color → `public/images/products/{slug}/{slug}-{colorSlug}.jpg`.
- **Website**: When the user selects a color, the hero image is swapped to that URL (already wired in `ProductHero` + `getColorVariantHeroPath`).
- **Feed**: `image_link` points to the correct color hero for each variant; `additional_image_link` is unchanged.

## Pipeline overview

1. **Masks** (one-time per base hero)  
   Create a PNG mask for each slug. White = upholstery only; black = background, legs, shadow, seams, etc.  
   Verify with the mask preview script (red overlay).

2. **Generation** (`scripts/generate_color_variants.ts`)  
   - Primary: Masked AI edit (image + mask + strict instruction), 2–3 candidates per color, pick best by QA.  
   - Fallback: If no candidate passes QA, deterministic recolor inside mask (LAB shift) + masked AI polish.

3. **QA** (automated gatekeeper)  
   - Background invariance: pixel diff outside mask must stay below threshold.  
   - Upholstery change: diff inside mask must be above threshold.  
   - Color accuracy: average ΔE to target hex inside mask below threshold.  
   - Artifact check: no severe banding in masked region.  
   If any check fails → do **not** publish; log as “needs manual review”.

4. **Preview**  
   Per slug: side-by-side grid (original + each color variant) → `/tmp/variant-previews/{slug}-preview.jpg`.  
   Console table: candidate score, ΔE, outside-mask diff, selected path.

5. **Publishing**  
   Only when QA passes: save to `public/images/products/...`, compress JPG.  
   Website and feed already use the same path convention; no code change needed for hero swap or `image_link`.

6. **Safety**  
   Script is idempotent: if output exists and passes QA, skip unless `--force`.  
   All runs logged to `logs/color-variants.csv`: slug, colorName, hex, output_url, qa_pass, deltaE, timestamp.

---

## How to add a new color

1. **Add the color to product details**  
   In `data/productDetails.json`, for each product (slug) that should have this color, add an entry to `fabricOptions` with `name` and `hex`:
   ```json
   "fabricOptions": [
     { "name": "Warm Ivory", "hex": "#f5f0e8" },
     { "name": "New Color", "hex": "#123456" }
   ]
   ```
   Use the same color name and hex across slugs if it’s a shared palette.

2. **Ensure masks exist**  
   You need a mask for every slug you want to generate variants for:
   - `assets/masks/atlas-sectional-mask.png`
   - `assets/masks/atlas-3-seater-mask.png`
   - etc.  
   White = upholstery only; black = everything else. Same dimensions as the base hero (or they will be resized).  
   To create **placeholder** masks (center rectangle) so you can run the pipeline immediately, then replace with real masks later:
   ```bash
   npm run color-variants:masks
   ```

3. **Verify masks (optional)**  
   Overlay the mask in red on the base image to confirm the region:
   ```bash
   npx tsx scripts/mask_preview.ts
   npx tsx scripts/mask_preview.ts --slug atlas-sectional
   ```
   Previews are written to `/tmp/mask-previews/{slug}-mask-preview.jpg`.

4. **Run the generator**  
   Generate variants for all products and colors (respecting QA; only passing images are written):
   ```bash
   npx tsx scripts/generate_color_variants.ts
   ```
   Or for one product and/or one color:
   ```bash
   npx tsx scripts/generate_color_variants.ts --slug atlas-sectional
   npx tsx scripts/generate_color_variants.ts --slug atlas-sectional --color "New Color"
   ```
   Use `--dry-run` to see what would be generated without calling the API or writing files.  
   Use `--force` to regenerate even when an output already exists and passes QA.

5. **Check results**  
   - Preview grid: `/tmp/variant-previews/{slug}-preview.jpg`.  
   - Log: `logs/color-variants.csv` (qa_pass, deltaE, etc.).  
   - If a variant is logged with `qa_pass=false`, it was **not** published; fix mask or color/hex and re-run (or review manually).

6. **Deploy**  
   Commit new or updated files under `public/images/products/`, then run the merchant feed and deploy so the site and feed use the new images:
   ```bash
   npm run feed:merchant
   ```

No changes are required in website or feed code when adding a new color: both already use `getColorVariantHeroPath(slug, colorName)` for the hero / `image_link`.

---

## Scripts reference

| Command | Purpose |
|--------|--------|
| `npm run color-variants:preview` or `npx tsx scripts/mask_preview.ts [--slug <slug>]` | Overlay mask in red on base hero; output `/tmp/mask-previews/{slug}-mask-preview.jpg`. |
| `npm run color-variants:generate` or `npx tsx scripts/generate_color_variants.ts [--slug <slug>] [--color <name>] [--dry-run] [--force]` | Generate QA-gated color variant heroes. Writes only when QA passes; logs every run to `logs/color-variants.csv`. |

---

## Do not

- Regenerate non-hero images (angled, back, side, detail).
- Use unmasked AI edits for color variants.
- Publish or deploy outputs that failed QA (script does not write them; treat `qa_pass=false` in the log as “needs manual review”).
