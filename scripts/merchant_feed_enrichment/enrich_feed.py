#!/usr/bin/env python3
"""
Arva Google Merchant Center feed enrichment pipeline.
Parts A–G: audit, material, MPN, dimensions (OCR), image QA, labels, output.
Usage: python enrich_feed.py [--feed PATH] [--outdir PATH] [--skip-dimensions]
Default feed: /mnt/data/feed.xml (or ./feed.xml if not found)
Output: feed_enriched.xml + CSV logs in --outdir (default: same as feed dir).
"""

from __future__ import annotations

import argparse
import csv
import os
import re
import sys
import xml.etree.ElementTree as ET
from collections import OrderedDict
from pathlib import Path
from urllib.parse import urljoin, urlparse

# Part D (dimensions) imports are lazy when --skip-dimensions is used

# --- Namespace ---
NS = {"g": "http://base.google.com/ns/1.0"}
NS_G = "http://base.google.com/ns/1.0"

# --- Material normalization (Part B) ---
MATERIAL_ORIS = "Weather-Resistant Performance Weave"
MATERIAL_DEFAULT = "Performance Fabric"

# --- Hero colors for custom_label_4 (Part F) ---
HERO_COLORS = {"Taupe", "Ivory", "Light Gray", "Charcoal"}

# --- Preferred image order tokens (Part E) ---
IMAGE_ORDER_TOKENS = ["angle", "side", "back", "lifestyle", "detail"]


def get_text(el: ET.Element | None) -> str:
    return (el.text or "").strip() if el is not None else ""


def parse_feed(path: str) -> tuple[ET.Element, list[dict]]:
    """Parse feed XML; return channel root and list of item dicts (all tags preserved)."""
    tree = ET.parse(path)
    root = tree.getroot()
    channel = root.find("channel")
    if channel is None:
        raise SystemExit("Error: no <channel> in feed")
    items = []
    for item_el in channel.findall("item"):
        item = {}
        for child in item_el:
            tag = child.tag.replace("{" + NS_G + "}", "").replace("}", "").strip()
            if tag.startswith("{"):
                tag = tag.split("}")[-1]
            key = "g:" + tag if not tag.startswith("g:") else tag
            if key == "g:product_detail":
                name_el = child.find("{" + NS_G + "}attribute_name")
                value_el = child.find("{" + NS_G + "}attribute_value")
                name = (name_el.text or "").strip() if name_el is not None else ""
                value = (value_el.text or "").strip() if value_el is not None else ""
                if name or value:
                    item.setdefault("_product_detail_from_feed", []).append({"name": name, "value": value})
                continue
            text = (child.text or "").strip()
            if key == "g:additional_image_link":
                item.setdefault("g:additional_image_link", []).append(text)
            else:
                item[key] = text
        # normalize additional_image_link to list
        if "g:additional_image_link" not in item:
            item["g:additional_image_link"] = []
        elif isinstance(item["g:additional_image_link"], str):
            item["g:additional_image_link"] = [item["g:additional_image_link"]] if item["g:additional_image_link"] else []
        items.append(item)
    return channel, items


def get_line_from_item(item: dict) -> str:
    """Atlas / Alto / Oris from title or item_group_id."""
    title = item.get("g:title", "") or ""
    group = item.get("g:item_group_id", "") or ""
    for name in ("Atlas", "Alto", "Oris"):
        if name in title or group.startswith(name.lower()):
            return name.upper()
    if group.startswith("atlas"):
        return "ATLAS"
    if group.startswith("alto"):
        return "ALTO"
    if group.startswith("oris"):
        return "ORIS"
    return "ATLAS"


def get_config_from_item(item: dict) -> str:
    """SECTIONAL / 3SEAT / LOVESEAT from title or item_group_id."""
    title = (item.get("g:title") or "").lower()
    group = (item.get("g:item_group_id") or "").lower()
    if "sectional" in title or "sectional" in group:
        return "SECTIONAL"
    if "3 seat" in title or "3-seat" in group or "3seater" in group:
        return "3SEAT"
    if "loveseat" in title or "loveseat" in group:
        return "LOVESEAT"
    return "SOFA"


def color_to_slug(color: str) -> str:
    """Remove spaces and punctuation for MPN."""
    if not color:
        return "TAUPE"
    s = re.sub(r"[^\w]", "", color)
    return s.upper() if s else "TAUPE"


# --- Part A: Audit ---
def run_audit(items: list[dict], out_path: str) -> None:
    materials = set()
    audit_rows = []
    for item in items:
        mid = item.get("g:id", "")
        title = item.get("g:title", "")
        link = item.get("g:link", "")
        group = item.get("g:item_group_id", "")
        color = item.get("g:color", "")
        material = item.get("g:material", "")
        image_link = item.get("g:image_link", "")
        additional = item.get("g:additional_image_link") or []
        if isinstance(additional, str):
            additional = [additional] if additional else []
        materials.add(material)
        image_count = 1 if image_link else 0
        additional_count = len(additional)
        flags = []
        if not material:
            flags.append("missing_material")
        if not color:
            flags.append("missing_color")
        if not group:
            flags.append("missing_item_group_id")
        if additional_count == 0:
            flags.append("missing_additional_image_link")
        seen = set()
        for u in additional:
            if u in seen:
                flags.append("duplicate_image_url")
                break
            seen.add(u)
        audit_rows.append({
            "id": mid,
            "title": title,
            "link": link,
            "item_group_id": group,
            "color": color,
            "material": material,
            "image_count": image_count,
            "additional_image_count": additional_count,
            "flags": ";".join(flags) if flags else "",
        })
    with open(out_path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=["id", "title", "link", "item_group_id", "color", "material", "image_count", "additional_image_count", "flags"])
        w.writeheader()
        w.writerows(audit_rows)
    if len(materials) > 1:
        print("[Audit] Multiple material strings found:", materials)


# --- Part B: Material ---
def apply_material(items: list[dict], log_path: str) -> list[dict]:
    changes = []
    for item in items:
        mid = item.get("g:id", "")
        old = item.get("g:material", "")
        line = get_line_from_item(item)
        new = MATERIAL_ORIS if line == "ORIS" else MATERIAL_DEFAULT
        if old != new:
            item["g:material"] = new
            changes.append({"id": mid, "old_material": old, "new_material": new})
    if changes:
        with open(log_path, "w", newline="", encoding="utf-8") as f:
            w = csv.DictWriter(f, fieldnames=["id", "old_material", "new_material"])
            w.writeheader()
            w.writerows(changes)
    return changes


# --- Part C: MPN ---
def apply_mpn(items: list[dict], log_path: str) -> list[dict]:
    """Set g:mpn = ARVA-{LINE}-{CONFIG}-{COLOR}. Log all set MPNs."""
    mpn_log = []
    for item in items:
        mid = item.get("g:id", "")
        line = get_line_from_item(item)
        config = get_config_from_item(item)
        color = item.get("g:color", "Taupe")
        color_slug = color_to_slug(color)
        new_mpn = f"ARVA-{line}-{config}-{color_slug}"
        old_mpn = item.get("g:mpn", "")
        if old_mpn and re.match(r"^ARVA-[A-Z]+-[A-Z0-9]+-[A-Z0-9]+$", old_mpn):
            pass  # keep if already in correct format
        else:
            item["g:mpn"] = new_mpn
        mpn_log.append({"id": mid, "mpn": item.get("g:mpn", new_mpn)})
    with open(log_path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=["id", "mpn"])
        w.writeheader()
        w.writerows(mpn_log)
    return mpn_log


# --- Part D: Dimensions from dimension image ---
def parse_dimensions_from_text(text: str) -> tuple[str | None, str | None, str | None]:
    """Return (overall_str, seat_height_str, seat_depth_str). Values only if confident."""
    text_lower = text.lower()
    # Find numbers with optional " or in or cm
    num_re = re.compile(r"(\d+)\s*(?:\"|in\.?|inch|cm)?")
    numbers = [int(m.group(1)) for m in num_re.finditer(text) if int(m.group(1)) < 500]
    # cm -> inches
    if "cm" in text_lower:
        # assume consecutive cm values; convert all to inches
        numbers = [round(n / 2.54) for n in numbers]
    # Sanity
    numbers = [n for n in numbers if 20 <= n <= 200]
    overall = None
    sh = None
    sd = None
    # Heuristics: often W x D x H or Width ... Depth ... Height
    if len(numbers) >= 3:
        w, d, h = numbers[0], numbers[1], numbers[2]
        if 20 <= w <= 200 and 20 <= d <= 200 and 15 <= h <= 120:
            overall = f"{w} in W x {d} in D x {h} in H"
    if len(numbers) >= 4:
        sh = f"{numbers[3]} in"
    if len(numbers) >= 5:
        sd = f"{numbers[4]} in"
    return overall, sh, sd


def run_dimension_extraction(
    items: list[dict],
    log_path: str,
    ocr_dir: Path,
    skip_fetch: bool = False,
) -> tuple[dict[str, dict], list[dict]]:
    """Group by g:link; for each unique link fetch once, OCR, parse. Then one log row per item. Return (link -> result), dimension_log rows."""
    if not skip_fetch:
        try:
            import io
            import requests
            from bs4 import BeautifulSoup
            import pytesseract
            from PIL import Image
        except ImportError as e:
            print("Error: missing dependency for dimension extraction:", e, file=sys.stderr)
            print("Install: pip install requests beautifulsoup4 pytesseract Pillow; system: tesseract-ocr", file=sys.stderr)
            sys.exit(1)

        def find_dimension_image_url(html: str, base_url: str):
            soup = BeautifulSoup(html, "html.parser")
            for img in soup.find_all("img"):
                src = img.get("src") or ""
                alt = (img.get("alt") or "").lower()
                if not src:
                    continue
                lower_src = src.lower()
                if "dimension" in lower_src or "dimensions" in lower_src or "dimension" in alt or "dimensions" in alt:
                    return urljoin(base_url, src)
                parts = src.split("/")
                if parts and "dimension" in parts[-1].lower():
                    return urljoin(base_url, src)
            return None

        def download_image(url: str):
            try:
                r = requests.get(url, timeout=15)
                r.raise_for_status()
                return r.content
            except Exception:
                return None

        def image_to_text(image_data: bytes, ext: str):
            try:
                img = Image.open(io.BytesIO(image_data))
                if img.mode not in ("L", "RGB", "RGBA"):
                    img = img.convert("RGB")
                return pytesseract.image_to_string(img)
            except Exception:
                return ""

    link_to_result: dict[str, dict] = {}
    ocr_dir.mkdir(parents=True, exist_ok=True)
    (ocr_dir / "ocr").mkdir(parents=True, exist_ok=True)
    unique_links = list(OrderedDict.fromkeys(item.get("g:link", "") for item in items if item.get("g:link")))

    for link in unique_links:
        if not link:
            continue
        result = {
            "dimension_image_url": "",
            "ocr_text_snippet": "",
            "parsed_overall": "",
            "parsed_seat_height": "",
            "parsed_seat_depth": "",
            "status": "dimension_image_not_found",
            "product_detail": [],
        }
        if skip_fetch:
            result["status"] = "skipped"
            link_to_result[link] = result
            continue
        try:
            resp = requests.get(link, timeout=15)
            resp.raise_for_status()
            html = resp.text
        except Exception as e:
            result["status"] = "ocr_failed"
            result["ocr_text_snippet"] = str(e)[:200]
            link_to_result[link] = result
            continue
        dim_image_url = find_dimension_image_url(html, link)
        if not dim_image_url:
            link_to_result[link] = result
            continue
        result["dimension_image_url"] = dim_image_url
        image_data = download_image(dim_image_url)
        if not image_data:
            result["status"] = "ocr_failed"
            result["ocr_text_snippet"] = "download_failed"
            link_to_result[link] = result
            continue
        ext = "png" if dim_image_url.lower().endswith(".png") else "jpg"
        safe_id = link.rstrip("/").split("/")[-1].replace(" ", "_") or "product"
        save_path = ocr_dir / f"{safe_id}.{ext}"
        try:
            save_path.write_bytes(image_data)
        except Exception:
            pass
        ocr_text = image_to_text(image_data, ext)
        (ocr_dir / "ocr" / f"{safe_id}.txt").write_text(ocr_text, encoding="utf-8")
        result["ocr_text_snippet"] = (ocr_text[:300] + "…") if len(ocr_text) > 300 else ocr_text
        overall, sh, sd = parse_dimensions_from_text(ocr_text)
        if overall:
            result["parsed_overall"] = overall
            result["parsed_seat_height"] = sh or ""
            result["parsed_seat_depth"] = sd or ""
            result["status"] = "success"
            result["product_detail"] = [{"name": "Overall Dimensions", "value": overall}]
            if sh:
                result["product_detail"].append({"name": "Seat Height", "value": sh})
            if sd:
                result["product_detail"].append({"name": "Seat Depth", "value": sd})
        else:
            result["status"] = "parse_failed"
        link_to_result[link] = result

    dimension_log_rows = []
    for item in items:
        mid = item.get("g:id", "")
        link = item.get("g:link", "")
        existing = item.get("_product_detail_from_feed") or []
        has_existing = any(
            (pd.get("name") or "").lower().find("dimension") >= 0 or (pd.get("name") or "").lower() == "overall dimensions"
            for pd in existing
        )
        res = link_to_result.get(link, {})
        if has_existing and existing:
            item["_product_detail"] = [{"name": p["name"], "value": p["value"]} for p in existing]
            status = "already_has_dimensions"
        else:
            item["_product_detail"] = res.get("product_detail") or []
            status = res.get("status", "dimension_image_not_found")
        dimension_log_rows.append({
            "id": mid,
            "link": link,
            "dimension_image_url": res.get("dimension_image_url", ""),
            "ocr_text_snippet": res.get("ocr_text_snippet", ""),
            "parsed_overall": res.get("parsed_overall", ""),
            "parsed_seat_height": res.get("parsed_seat_height", ""),
            "parsed_seat_depth": res.get("parsed_seat_depth", ""),
            "status": status,
        })

    with open(log_path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=["id", "link", "dimension_image_url", "ocr_text_snippet", "parsed_overall", "parsed_seat_height", "parsed_seat_depth", "status"])
        w.writeheader()
        w.writerows(dimension_log_rows)

    return link_to_result, dimension_log_rows


# --- Part E: Image QA ---
def image_order_key(url: str) -> int:
    url_lower = url.lower()
    for i, tok in enumerate(IMAGE_ORDER_TOKENS):
        if tok in url_lower:
            return i
    return 999


def apply_image_qa(items: list[dict], audit_path: str) -> list[dict]:
    audit_rows = []
    for item in items:
        mid = item.get("g:id", "")
        additional = item.get("g:additional_image_link") or []
        if isinstance(additional, str):
            additional = [additional] if additional else []
        orig_count = len(additional)
        deduped = list(OrderedDict.fromkeys(additional))
        deduped_count = len(deduped)
        ordered = sorted(deduped, key=image_order_key)
        reordered = ordered != deduped
        item["g:additional_image_link"] = ordered
        audit_rows.append({
            "id": mid,
            "additional_image_count": orig_count,
            "deduped_count": deduped_count,
            "reordered": reordered,
        })
    with open(audit_path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=["id", "additional_image_count", "deduped_count", "reordered"])
        w.writeheader()
        w.writerows(audit_rows)
    return audit_rows


# --- Part F: Labels ---
def apply_labels(items: list[dict], log_path: str) -> list[dict]:
    changes = []
    for item in items:
        mid = item.get("g:id", "")
        config = get_config_from_item(item)
        color = item.get("g:color", "")
        # custom_label_0: hero / supporting
        want_0 = "hero" if config in ("SECTIONAL", "3SEAT") else "supporting"
        if item.get("g:custom_label_0") != want_0:
            old = item.get("g:custom_label_0", "")
            item["g:custom_label_0"] = want_0
            changes.append({"id": mid, "label_name": "custom_label_0", "old_value": old, "new_value": want_0})
        # custom_label_1: high_aov
        if item.get("g:custom_label_1") != "high_aov":
            old = item.get("g:custom_label_1", "")
            item["g:custom_label_1"] = "high_aov"
            changes.append({"id": mid, "label_name": "custom_label_1", "old_value": old, "new_value": "high_aov"})
        # custom_label_2: sectional / sofa / loveseat
        want_2 = "sectional" if config == "SECTIONAL" else ("sofa" if config == "3SEAT" else "loveseat")
        if item.get("g:custom_label_2") != want_2:
            old = item.get("g:custom_label_2", "")
            item["g:custom_label_2"] = want_2
            changes.append({"id": mid, "label_name": "custom_label_2", "old_value": old, "new_value": want_2})
        # custom_label_3: core_collection
        if item.get("g:custom_label_3") != "core_collection":
            old = item.get("g:custom_label_3", "")
            item["g:custom_label_3"] = "core_collection"
            changes.append({"id": mid, "label_name": "custom_label_3", "old_value": old, "new_value": "core_collection"})
        # custom_label_4: hero_color / supporting_color
        want_4 = "hero_color" if color in HERO_COLORS else "supporting_color"
        if item.get("g:custom_label_4") != want_4:
            old = item.get("g:custom_label_4", "")
            item["g:custom_label_4"] = want_4
            changes.append({"id": mid, "label_name": "custom_label_4", "old_value": old, "new_value": want_4})
    if changes:
        with open(log_path, "w", newline="", encoding="utf-8") as f:
            w = csv.DictWriter(f, fieldnames=["id", "label_name", "old_value", "new_value"])
            w.writeheader()
            w.writerows(changes)
    return changes


# --- Part G: Write feed_enriched.xml ---
PREFERRED_ORDER = [
    "g:id", "g:item_group_id", "g:title", "g:description", "g:link", "g:image_link",
    "g:additional_image_link", "g:availability", "g:price", "g:condition", "g:brand", "g:mpn",
    "g:color", "g:material", "g:size", "g:product_type", "g:google_product_category",
    "g:custom_label_0", "g:custom_label_1", "g:custom_label_2", "g:custom_label_3", "g:custom_label_4",
    "g:room", "g:style", "g:identifier_exists",
]


def write_feed_enriched(channel_el: ET.Element, items: list[dict], out_path: str) -> None:
    """Write RSS feed with g: namespace; preserve order and include product_detail."""
    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">',
        "  <channel>",
    ]
    for tag in ("title", "link", "description"):
        child = channel_el.find(tag)
        if child is not None and child.text:
            lines.append(f"    <{tag}>{_escape(child.text.strip())}</{tag}>")
    for item in items:
        lines.append("    <item>")
        seen = set()
        for key in PREFERRED_ORDER:
            if key == "g:additional_image_link":
                for url in item.get(key) or []:
                    if url:
                        lines.append(f"  <g:additional_image_link>{_escape(url)}</g:additional_image_link>")
                seen.add(key)
                continue
            val = item.get(key)
            if val is None or (isinstance(val, str) and val == ""):
                continue
            seen.add(key)
            lines.append(f"  <{key}>{_escape(str(val))}</{key}>")
        for pd in item.get("_product_detail") or []:
            lines.append("  <g:product_detail>")
            lines.append(f"    <g:attribute_name>{_escape(pd['name'])}</g:attribute_name>")
            lines.append(f"    <g:attribute_value>{_escape(pd['value'])}</g:attribute_value>")
            lines.append("  </g:product_detail>")
        for key in sorted(item.keys()):
            if key.startswith("g:") and key not in seen and not key.startswith("_"):
                val = item[key]
                if val and (not isinstance(val, list) or val):
                    if isinstance(val, list):
                        for v in val:
                            if v:
                                lines.append(f"  <{key}>{_escape(str(v))}</{key}>")
                    else:
                        lines.append(f"  <{key}>{_escape(str(val))}</{key}>")
        lines.append("    </item>")
    lines.append("  </channel>")
    lines.append("</rss>")
    Path(out_path).write_text("\n".join(lines), encoding="utf-8")


def _escape(s: str) -> str:
    return (
        s.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


def main() -> None:
    ap = argparse.ArgumentParser(description="Arva merchant feed enrichment")
    ap.add_argument("--feed", default="/mnt/data/feed.xml", help="Input feed XML path")
    ap.add_argument("--outdir", default=None, help="Output directory (default: same as feed)")
    ap.add_argument("--skip-dimensions", action="store_true", help="Skip dimension extraction (no fetch/OCR)")
    args = ap.parse_args()
    feed_path = Path(args.feed)
    if not feed_path.is_file():
        alt = Path(__file__).resolve().parent.parent.parent / "public" / "merchant" / "feed.xml"
        if alt.is_file():
            feed_path = alt
            print("Using feed at", feed_path, file=sys.stderr)
        else:
            print("Error: feed not found:", args.feed, file=sys.stderr)
            sys.exit(1)
    outdir = Path(args.outdir) if args.outdir else feed_path.parent
    outdir.mkdir(parents=True, exist_ok=True)
    tmp_dim = Path("/tmp/arva_dimensions")
    tmp_dim.mkdir(parents=True, exist_ok=True)

    channel_el, items = parse_feed(str(feed_path))
    if not items:
        print("Error: no items in feed")
        sys.exit(1)

    # Part A
    run_audit(items, str(outdir / "feed_audit.csv"))
    # Part B
    material_changes = apply_material(items, str(outdir / "material_changes.csv"))
    # Part C
    apply_mpn(items, str(outdir / "mpn_changes.csv"))
    # Part D
    link_to_dims, dim_log_rows = run_dimension_extraction(
        items, str(outdir / "dimension_extraction_log.csv"), tmp_dim, skip_fetch=args.skip_dimensions
    )
    # Part E
    apply_image_qa(items, str(outdir / "image_audit.csv"))
    # Part F
    label_changes = apply_labels(items, str(outdir / "label_changes.csv"))
    # Part G
    write_feed_enriched(channel_el, items, str(outdir / "feed_enriched.xml"))

    # Summary
    dim_status_counts = {}
    for r in dim_log_rows:
        st = r.get("status", "unknown")
        dim_status_counts[st] = dim_status_counts.get(st, 0) + 1
    dim_success_links = sum(1 for r in link_to_dims.values() if r.get("status") == "success")

    print("--- Summary ---")
    print("Total items processed:", len(items))
    print("Dimensions successfully added (unique links):", dim_success_links)
    print("Dimension extraction status counts:", dim_status_counts)
    print("Materials normalized:", len(material_changes))
    print("Label changes:", len(label_changes))
    print("Output feed:", outdir / "feed_enriched.xml")
    print("Logs: feed_audit.csv, material_changes.csv, mpn_changes.csv, dimension_extraction_log.csv, image_audit.csv, label_changes.csv")


if __name__ == "__main__":
    main()
