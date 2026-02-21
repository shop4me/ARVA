"use client";

import { useState, useEffect, useCallback } from "react";
import type { Product } from "@/lib/content";
import type { ProductDetailData, ProductDetailImages } from "@/lib/productDetail";

const IMAGE_LABELS: { key: keyof ProductDetailImages; label: string }[] = [
  { key: "hero", label: "Hero (main product image)" },
  { key: "thumbnail1", label: "Thumbnail 1: Seam close-up" },
  { key: "thumbnail2", label: "Thumbnail 2: Chamfer close-up" },
  { key: "thumbnail3", label: "Thumbnail 3: Fabric texture" },
  { key: "thumbnail4", label: "Thumbnail 4: Modular breakdown" },
  { key: "thumbnail5", label: "Thumbnail 5: Lifestyle" },
  { key: "comfort1", label: "Comfort section: Seat depth image" },
  { key: "comfort2", label: "Comfort section: Fabric texture image" },
  { key: "dimensionsDiagram", label: "Dimensions: Diagram / illustration" },
];

const DEFAULT_DETAIL: ProductDetailData = {
  displayPrice: 0,
  subhead: "",
  reassuranceText: "",
  valueStack: [],
  fabricDefault: "",
  trustStrip: [],
  comfortHeadline: "",
  comfortCopy: "",
  comparisonTable: { rows: [] },
  dimensions: { width: "", depth: "", height: "", seatHeight: "", maxWeightPerPiece: "" },
  dimensionsReassurance: "",
  deliveryHeadline: "",
  deliveryCopy: [],
  reviewsHeading: "",
  reviews: [],
  faq: [],
  finalCtaHeadline: "",
  finalCtaSubhead: "",
};

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedSlug, setSelectedSlug] = useState("");
  const [detail, setDetail] = useState<ProductDetailData | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveOk, setSaveOk] = useState(false);
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({ slug: "", name: "", price: 0 });
  const [uploadingField, setUploadingField] = useState<keyof ProductDetailImages | null>(null);
  const [uploadingColor, setUploadingColor] = useState<string | null>(null);
  /** Bump per color so img src gets a new query param and browser shows the newly uploaded file immediately. */
  const [colorHeroCacheBust, setColorHeroCacheBust] = useState<Record<string, number>>({});
  /** Same for main product image fields (hero, thumbnails, etc.). */
  const [imageFieldCacheBust, setImageFieldCacheBust] = useState<Record<string, number>>({});

  const checkAuth = useCallback(async () => {
    const res = await fetch("/api/admin/me");
    setAuthed(res.ok);
    return res.ok;
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!authed) return;
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then(setProducts)
      .catch(() => setProducts([]));
  }, [authed]);

  useEffect(() => {
    if (!authed || !selectedSlug) {
      setDetail(null);
      return;
    }
    fetch(`/api/admin/product-detail?slug=${encodeURIComponent(selectedSlug)}`)
      .then((r) => r.json())
      .then((d) => {
        if (!d || typeof d !== "object") return { ...DEFAULT_DETAIL };
        return {
          ...DEFAULT_DETAIL,
          ...d,
          dimensions: { ...DEFAULT_DETAIL.dimensions, ...(d.dimensions || {}) },
          comparisonTable: d.comparisonTable?.rows ? { rows: d.comparisonTable.rows } : DEFAULT_DETAIL.comparisonTable,
          images: d.images ? { ...d.images } : undefined,
        };
      })
      .then(setDetail)
      .catch(() => setDetail({ ...DEFAULT_DETAIL }));
  }, [authed, selectedSlug]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.ok) {
      setAuthed(true);
      setPassword("");
    } else {
      setLoginError("Wrong password");
    }
  };

  const handleSave = async () => {
    if (!selectedSlug || !detail) return;
    setSaving(true);
    setSaveOk(false);
    const res = await fetch("/api/admin/product-detail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: selectedSlug, detail }),
    });
    setSaving(false);
    setSaveOk(res.ok);
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ add: newProduct }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      const list = await fetch("/api/admin/products").then((r) => r.json());
      setProducts(list);
      setSelectedSlug(newProduct.slug);
      setNewProduct({ slug: "", name: "", price: 0 });
      setAddProductOpen(false);
    } else {
      alert(data.error || "Failed to add product");
    }
  };

  const updateDetail = (updates: Partial<ProductDetailData>) => {
    setDetail((d) => (d ? { ...d, ...updates } : null));
  };

  const updateImages = (key: keyof ProductDetailImages, value: string) => {
    setDetail((d) => (d ? { ...d, images: { ...d.images, [key]: value || undefined } } : null));
  };

  const updateColorVariantHero = (colorName: string, url: string) => {
    setDetail((d) =>
      d
        ? {
            ...d,
            images: {
              ...d.images,
              colorVariantHeros: { ...(d.images?.colorVariantHeros ?? {}), [colorName]: url },
            },
          }
        : null
    );
  };

  const handleImageUpload = async (key: keyof ProductDetailImages, file: File) => {
    if (!selectedSlug) return;
    setUploadingField(key);
    const formData = new FormData();
    formData.set("file", file);
    formData.set("slug", selectedSlug);
    formData.set("field", key);
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.url) {
        updateImages(key, data.url);
        setImageFieldCacheBust((prev) => ({ ...prev, [key]: Date.now() }));
      } else {
        alert(data.error || "Upload failed");
      }
    } catch {
      alert("Upload failed");
    } finally {
      setUploadingField(null);
    }
  };

  const handleColorHeroUpload = async (colorName: string, file: File) => {
    if (!selectedSlug) return;
    setUploadingColor(colorName);
    const formData = new FormData();
    formData.set("file", file);
    formData.set("slug", selectedSlug);
    formData.set("colorName", colorName);
    try {
      const res = await fetch("/api/admin/upload-color-hero", { method: "POST", body: formData });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.url) updateColorVariantHero(colorName, data.url);
      else alert(data.error || "Upload failed");
    } catch {
      alert("Upload failed");
    } finally {
      setUploadingColor(null);
    }
  };

  if (authed === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-arva-bg">
        <p className="text-arva-text-muted">Checking…</p>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-arva-bg p-4">
        <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
          <h1 className="text-xl font-semibold text-arva-text">Admin login</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-2 border border-arva-border rounded-lg"
            autoFocus
          />
          {loginError && <p className="text-sm text-red-600">{loginError}</p>}
          <button type="submit" className="w-full py-2 bg-arva-accent text-white rounded-lg font-medium">
            Log in
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-arva-bg text-arva-text">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-6">Edit product page</h1>

        {/* Product selector */}
        <section className="mb-8 p-4 bg-white border border-arva-border rounded-xl">
          <h2 className="text-sm font-semibold text-arva-text-muted uppercase tracking-wide mb-3">
            Which product are you editing?
          </h2>
          <div className="flex flex-wrap gap-3 items-center">
            <select
              value={selectedSlug}
              onChange={(e) => setSelectedSlug(e.target.value)}
              className="px-3 py-2 border border-arva-border rounded-lg bg-white"
            >
              <option value="">Select product</option>
              {products.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.name} ({p.slug})
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setAddProductOpen(true)}
              className="text-sm text-arva-accent font-medium hover:underline"
            >
              + Add new product
            </button>
          </div>
          {addProductOpen && (
            <form onSubmit={handleAddProduct} className="mt-4 p-4 border border-arva-border rounded-lg space-y-3">
              <h3 className="font-medium">New product</h3>
              <input
                required
                placeholder="Slug (e.g. atlas-sectional)"
                value={newProduct.slug}
                onChange={(e) => setNewProduct((n) => ({ ...n, slug: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg"
              />
              <input
                required
                placeholder="Name"
                value={newProduct.name}
                onChange={(e) => setNewProduct((n) => ({ ...n, name: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg"
              />
              <input
                type="number"
                placeholder="Price"
                value={newProduct.price || ""}
                onChange={(e) => setNewProduct((n) => ({ ...n, price: Number(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border rounded-lg"
              />
              <div className="flex gap-2">
                <button type="submit" className="px-4 py-2 bg-arva-accent text-white rounded-lg text-sm">
                  Add product
                </button>
                <button type="button" onClick={() => setAddProductOpen(false)} className="px-4 py-2 border rounded-lg text-sm">
                  Cancel
                </button>
              </div>
            </form>
          )}
        </section>

        {!selectedSlug && (
          <p className="text-arva-text-muted">Select a product above to edit its page.</p>
        )}

        {selectedSlug && detail && (
          <>
            {/* Section: Product images */}
            <section className="mb-8 p-4 bg-white border border-arva-border rounded-xl">
              <h2 className="text-lg font-semibold mb-2 border-b border-arva-border pb-2">
                Product images
              </h2>
              <p className="text-sm text-arva-text-muted mb-4">
                Edit the URL or use Browse to upload a new image from your computer. Uploading replaces the existing image.
              </p>
              <div className="space-y-4">
                {IMAGE_LABELS.map(({ key, label }) => {
                  const raw = detail.images?.[key];
                  const url = typeof raw === "string" ? raw : "";
                  return (
                    <div key={key} className="flex flex-col sm:flex-row sm:items-start gap-3 p-3 border border-arva-border/60 rounded-lg">
                      <div className="sm:w-32 shrink-0">
                        <label className="block text-sm font-medium text-arva-text mb-1">{label}</label>
                        {url ? (
                          <img
                            key={`${key}-${imageFieldCacheBust[key] ?? 0}`}
                            src={`${url}${url.includes("?") ? "&" : "?"}t=${imageFieldCacheBust[key] ?? 0}`}
                            alt=""
                            className="w-full max-w-[120px] aspect-square object-cover rounded border border-arva-border"
                          />
                        ) : (
                          <div className="w-full max-w-[120px] aspect-square rounded border border-arva-border bg-arva-bg flex items-center justify-center text-arva-text-muted text-xs">
                            No image
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 space-y-2">
                        <input
                          type="text"
                          value={url}
                          onChange={(e) => updateImages(key, e.target.value)}
                          placeholder="/images/... or full URL"
                          className="w-full px-3 py-2 border border-arva-border rounded-lg text-sm"
                        />
                        <div className="flex items-center gap-2">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            id={`file-${key}`}
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) handleImageUpload(key, f);
                              e.target.value = "";
                            }}
                          />
                          <label
                            htmlFor={`file-${key}`}
                            className="inline-block px-3 py-1.5 border border-arva-border rounded-lg text-sm font-medium cursor-pointer hover:bg-arva-bg"
                          >
                            {uploadingField === key ? "Uploading…" : "Browse"}
                          </label>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Color variant heroes: one image per fabric; shown as main hero when customer picks that color */}
              {detail.fabricOptions && detail.fabricOptions.length > 0 && (
                <div className="mt-6 pt-6 border-t border-arva-border">
                  <h3 className="text-sm font-semibold text-arva-text-muted uppercase tracking-wide mb-2">
                    Color variant heroes
                  </h3>
                  <p className="text-sm text-arva-text-muted mb-4">
                    Upload one image per color. When a customer selects that color on the product page, this image is shown as the main hero. Converted to WebP automatically.
                  </p>
                  <div className="space-y-4">
                    {detail.fabricOptions.map((opt) => {
                      const url = detail.images?.colorVariantHeros?.[opt.name] ?? "";
                      return (
                        <div
                          key={opt.name}
                          className="flex flex-col sm:flex-row sm:items-start gap-3 p-3 border border-arva-border/60 rounded-lg"
                        >
                          <div className="sm:w-32 shrink-0 flex items-center gap-2">
                            <div
                              className="w-8 h-8 rounded border border-arva-border shrink-0"
                              style={{ backgroundColor: opt.hex ?? "#f5f0e8" }}
                              title={opt.name}
                            />
                            <span className="text-sm font-medium text-arva-text">{opt.name}</span>
                          </div>
                          <div className="sm:w-24 shrink-0">
                            {url ? (
                              <img
                                key={`${opt.name}-${colorHeroCacheBust[opt.name] ?? 0}`}
                                src={`${url}${url.includes("?") ? "&" : "?"}t=${colorHeroCacheBust[opt.name] ?? 0}`}
                                alt=""
                                className="w-full max-w-[96px] aspect-square object-cover rounded border border-arva-border"
                              />
                            ) : (
                              <div className="w-full max-w-[96px] aspect-square rounded border border-arva-border bg-arva-bg flex items-center justify-center text-arva-text-muted text-xs">
                                No image
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              id={`color-hero-${opt.name}`}
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) handleColorHeroUpload(opt.name, f);
                                e.target.value = "";
                              }}
                            />
                            <label
                              htmlFor={`color-hero-${opt.name}`}
                              className="inline-block px-3 py-1.5 border border-arva-border rounded-lg text-sm font-medium cursor-pointer hover:bg-arva-bg"
                            >
                              {uploadingColor === opt.name ? "Uploading…" : "Upload hero"}
                            </label>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>

            {/* Section: Hero & price */}
            <section className="mb-8 p-4 bg-white border border-arva-border rounded-xl">
              <h2 className="text-lg font-semibold mb-2 border-b border-arva-border pb-2">
                Hero & price (top of page)
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Display price (number)</label>
                  <input
                    type="number"
                    value={detail.displayPrice ?? ""}
                    onChange={(e) => updateDetail({ displayPrice: Number(e.target.value) || undefined })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Subhead</label>
                  <input
                    value={detail.subhead}
                    onChange={(e) => updateDetail({ subhead: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Reassurance text (under price)</label>
                  <input
                    value={detail.reassuranceText}
                    onChange={(e) => updateDetail({ reassuranceText: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Value stack (one per line)</label>
                  <textarea
                    value={detail.valueStack.join("\n")}
                    onChange={(e) => updateDetail({ valueStack: e.target.value.split("\n").filter(Boolean) })}
                    rows={5}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>
            </section>

            {/* Section: Comfort */}
            <section className="mb-8 p-4 bg-white border border-arva-border rounded-xl">
              <h2 className="text-lg font-semibold mb-2 border-b border-arva-border pb-2">
                Comfort & feel section
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Headline</label>
                  <input
                    value={detail.comfortHeadline}
                    onChange={(e) => updateDetail({ comfortHeadline: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Body copy</label>
                  <textarea
                    value={detail.comfortCopy}
                    onChange={(e) => updateDetail({ comfortCopy: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>
            </section>

            {/* Section: Delivery & returns */}
            <section className="mb-8 p-4 bg-white border border-arva-border rounded-xl">
              <h2 className="text-lg font-semibold mb-2 border-b border-arva-border pb-2">
                Delivery & returns section
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Headline</label>
                  <input
                    value={detail.deliveryHeadline}
                    onChange={(e) => updateDetail({ deliveryHeadline: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Bullets (one per line)</label>
                  <textarea
                    value={detail.deliveryCopy.join("\n")}
                    onChange={(e) => updateDetail({ deliveryCopy: e.target.value.split("\n").filter(Boolean) })}
                    rows={5}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>
            </section>

            {/* Section: Dimensions */}
            <section className="mb-8 p-4 bg-white border border-arva-border rounded-xl">
              <h2 className="text-lg font-semibold mb-2 border-b border-arva-border pb-2">
                Dimensions & fit section
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {(["width", "depth", "height", "seatHeight", "ottoman", "maxWeightPerPiece"] as const).map((k) => (
                  <div key={k}>
                    <label className="block text-sm font-medium mb-1">{k}</label>
                    <input
                      value={detail.dimensions[k] ?? ""}
                      onChange={(e) => updateDetail({ dimensions: { ...detail.dimensions, [k]: e.target.value } })}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    />
                  </div>
                ))}
              </div>
              <div className="mt-3">
                <label className="block text-sm font-medium mb-1">Reassurance text</label>
                <input
                  value={detail.dimensionsReassurance}
                  onChange={(e) => updateDetail({ dimensionsReassurance: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </section>

            {/* Section: Final CTA */}
            <section className="mb-8 p-4 bg-white border border-arva-border rounded-xl">
              <h2 className="text-lg font-semibold mb-2 border-b border-arva-border pb-2">
                Final CTA section (bottom of page)
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Headline</label>
                  <input
                    value={detail.finalCtaHeadline}
                    onChange={(e) => updateDetail({ finalCtaHeadline: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Subhead</label>
                  <input
                    value={detail.finalCtaSubhead}
                    onChange={(e) => updateDetail({ finalCtaSubhead: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
            </section>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-3 bg-arva-accent text-white font-medium rounded-lg hover:opacity-90 disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
              {saveOk && <span className="text-sm text-green-600">Saved.</span>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
