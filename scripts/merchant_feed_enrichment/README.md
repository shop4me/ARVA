# Arva Google Merchant Feed Enrichment

Pipeline to audit and enrich the Google Merchant Center XML feed (Parts A–G).

## Usage

```bash
# Default: read /mnt/data/feed.xml, write outputs to same dir
python enrich_feed.py

# Use project feed and output to public/merchant
python enrich_feed.py --feed ../../public/merchant/feed.xml --outdir ../../public/merchant

# Skip dimension extraction (no HTTP fetch / OCR)
python enrich_feed.py --feed ../../public/merchant/feed.xml --outdir ../../public/merchant --skip-dimensions
```

## Input

- **Feed path**: Google Merchant XML (RSS 2.0 + `g:` namespace). Default ` /mnt/data/feed.xml`; falls back to `public/merchant/feed.xml` if missing.

## Outputs

| File | Description |
|------|-------------|
| `feed_enriched.xml` | Enriched feed (material, MPN, labels, image order; dimensions if extraction runs). |
| `feed_audit.csv` | Part A: id, title, link, item_group_id, color, material, image counts, flags. |
| `material_changes.csv` | Part B: id, old_material, new_material. |
| `mpn_changes.csv` | Part C: id, mpn (ARVA-LINE-CONFIG-COLOR). |
| `dimension_extraction_log.csv` | Part D: id, link, dimension_image_url, ocr_text_snippet, parsed_*, status. |
| `image_audit.csv` | Part E: id, additional_image_count, deduped_count, reordered. |
| `label_changes.csv` | Part F: id, label_name, old_value, new_value. |

## Parts

- **A** – Inventory: extract items, CSV audit, flag missing/duplicate material, missing fields, duplicate image URLs.
- **B** – Material: Oris → "Weather-Resistant Performance Weave"; others → "Performance Fabric".
- **C** – MPN: set `g:mpn` = `ARVA-{LINE}-{CONFIG}-{COLOR}` (e.g. ARVA-ATLAS-SECTIONAL-TAUPE).
- **D** – Dimensions: fetch product page, find dimension image, download, OCR (pytesseract), parse W×D×H / seat height/depth, add `g:product_detail`. Use `--skip-dimensions` to skip (no requests/OCR).
- **E** – Images: dedupe `additional_image_link`, reorder by tokens (angle, side, back, lifestyle, detail).
- **F** – Labels: enforce custom_label_0..4 (hero/supporting, high_aov, config, core_collection, hero_color/supporting_color).
- **G** – Write `feed_enriched.xml` and all CSVs; print summary.

## Dependencies (for Part D, when not using `--skip-dimensions`)

```bash
pip install requests beautifulsoup4 pytesseract Pillow
# System: tesseract-ocr (e.g. apt install tesseract-ocr)
```

With `--skip-dimensions`, only the Python standard library is required (plus `pathlib`).

## Rules

- Do not change `g:id`, `g:price`, `g:availability`, `g:link`, `g:image_link` or existing image URLs.
- Do not remove items.
- Dimensions: do not guess; if extraction fails, omit and log.
- Existing `g:product_detail` is preserved (status `already_has_dimensions`).
