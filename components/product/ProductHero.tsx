"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type TouchEvent } from "react";
import type { Product } from "@/lib/content";
import type { ProductDetailData } from "@/lib/productDetail";
import { getEffectiveSalePrice, getEffectiveCompareAtPrice } from "@/lib/pricing";
import { getColorVariantHeroPath } from "@/lib/colorVariantImages";
import FabricSwatches from "./FabricSwatches";
import AddToCartButton from "./AddToCartButton";
import ConfigSelector from "./ConfigSelector";
import { TRUST_ITEMS } from "@/components/TrustIcons";
import StarsInline from "@/components/StarsInline";

/** Image hierarchy: 1) Hero (white bg), 2) Seam 3) Chamfer 4) Fabric texture 5) Lifestyle 6) Modular. No autoplay; manual thumbnail click only. */
const THUMBNAIL_LABELS = [
  "Seam close-up",
  "Chamfer close-up",
  "Fabric texture close-up",
  "Lifestyle",
  "Modular breakdown",
];

const HERO_TRUST_ITEMS = [
  { label: "Delivered in 2-4 Weeks", Icon: TRUST_ITEMS[4].Icon },
  { label: TRUST_ITEMS[0].label, Icon: TRUST_ITEMS[0].Icon },
  { label: TRUST_ITEMS[1].label, Icon: TRUST_ITEMS[1].Icon },
  { label: TRUST_ITEMS[3].label, Icon: TRUST_ITEMS[3].Icon },
  { label: TRUST_ITEMS[4].label, Icon: TRUST_ITEMS[4].Icon },
];

export default function ProductHero({
  product,
  detail,
  arrivalRange,
  relatedProducts,
  basePath = "/products",
}: {
  product: Product;
  detail: ProductDetailData;
  arrivalRange?: string;
  relatedProducts?: Product[];
  basePath?: string;
}) {
  const price = getEffectiveSalePrice(product.slug, detail?.displayPrice ?? product.price);
  const compareAt = getEffectiveCompareAtPrice(product.slug);
  const iconSmall = "w-4 h-4 shrink-0 text-arva-accent";
  const IconDelivery = TRUST_ITEMS[4].Icon;
  const IconTrial = TRUST_ITEMS[0].Icon;
  const IconWarranty = TRUST_ITEMS[3].Icon;
  const imageSet = detail.images;
  const defaultHero = imageSet?.hero ?? product.image ?? "";
  const [selectedFabric, setSelectedFabric] = useState(detail.fabricDefault ?? "");
  const [heroFallback, setHeroFallback] = useState(false);
  // Atlas Sectional: one hero image per fabric; use that URL directly for the main image when a fabric is selected.
  const isAtlasSectional = product.slug === "atlas-sectional";
  const colorVariantHero =
    isAtlasSectional && selectedFabric && !heroFallback
      ? getColorVariantHeroPath(product.slug, selectedFabric)
      : null;
  const fabricFallbackHero =
    heroFallback && selectedFabric ? imageSet?.fabricHeroFallbacks?.[selectedFabric] : undefined;
  const effectiveHero = colorVariantHero ?? fabricFallbackHero ?? defaultHero;
  const imageCandidates = [
    effectiveHero,
    imageSet?.thumbnail1,
    imageSet?.thumbnail2,
    imageSet?.thumbnail3,
    imageSet?.thumbnail4,
    imageSet?.thumbnail5,
  ];
  const galleryImages = useMemo(
    () => imageCandidates.filter((img): img is string => Boolean(img)),
    [effectiveHero, imageSet?.thumbnail1, imageSet?.thumbnail2, imageSet?.thumbnail3, imageSet?.thumbnail4, imageSet?.thumbnail5]
  );
  const [activeIndex, setActiveIndex] = useState(0);

  // When fabric changes on Atlas Sectional, always show the main hero (index 0) so the color hero is visible.
  useEffect(() => {
    if (isAtlasSectional && selectedFabric) setActiveIndex(0);
  }, [isAtlasSectional, selectedFabric]);

  const handleFabricSelect = useCallback((name: string) => {
    setSelectedFabric(name);
    setHeroFallback(false);
    setActiveIndex(0);
  }, []);
  const handleHeroError = useCallback(() => {
    setHeroFallback(true);
  }, []);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isDimensionsOpen, setIsDimensionsOpen] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const heroImgRef = useRef<HTMLImageElement | null>(null);
  const activeImage = galleryImages[activeIndex];
  // Main hero slot: for Atlas Sectional with a selected fabric, use the color-variant URL with cache-bust so the correct image always loads.
  const mainHeroSrc =
    activeIndex === 0 && isAtlasSectional && selectedFabric && colorVariantHero
      ? `${colorVariantHero}?v=${encodeURIComponent(selectedFabric)}`
      : activeImage;
  const dimensionsImage = imageSet?.dimensionsDiagram;
  const reviewsCount = detail.reviews?.length ?? 0;
  const averageRating = reviewsCount
    ? detail.reviews.reduce((sum, review) => sum + (review.rating ?? 5), 0) / reviewsCount
    : 5;

  useEffect(() => {
    if (activeIndex >= galleryImages.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, galleryImages.length]);

  // Fallback when color-variant image fails: onError may not fire in some environments (e.g. headless).
  // Timeout is not cleared in cleanup so it still fires under React Strict Mode (double mount).
  useEffect(() => {
    if (!colorVariantHero || heroFallback || activeIndex !== 0) return;
    const t = setTimeout(() => {
      const img = heroImgRef.current;
      if (img ? img.naturalWidth === 0 : true) {
        setHeroFallback(true);
      }
    }, 2500);
    return () => { /* intentional: do not clear so fallback runs under Strict Mode */ };
  }, [colorVariantHero, heroFallback, activeIndex]);

  useEffect(() => {
    if (!isLightboxOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsLightboxOpen(false);
      if (event.key === "ArrowRight" && galleryImages.length > 1) {
        setActiveIndex((prev) => (prev + 1) % galleryImages.length);
      }
      if (event.key === "ArrowLeft" && galleryImages.length > 1) {
        setActiveIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isLightboxOpen, galleryImages.length]);

  const goNext = () => {
    if (galleryImages.length < 2) return;
    setActiveIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const goPrev = () => {
    if (galleryImages.length < 2) return;
    setActiveIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const onLightboxTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.changedTouches[0]?.clientX ?? null;
  };

  const onLightboxTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return;
    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
    const deltaX = endX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(deltaX) < 40) return;
    if (deltaX < 0) goNext();
    else goPrev();
  };

  return (
    <section className="border-b border-arva-border/80 bg-arva-bg overflow-x-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Left on desktop, first on mobile */}
          <div className="space-y-4 order-1">
            {/* Hero: pure white background */}
            <button
              type="button"
              className="aspect-[4/3] rounded-xl bg-white border border-arva-border shadow-arva-soft overflow-hidden flex items-center justify-center"
              style={{ minHeight: 320 }}
              onClick={() => activeImage && setIsLightboxOpen(true)}
              aria-label={`Open ${product.name} image gallery`}
            >
              {activeImage ? (
                <img
                  ref={activeIndex === 0 ? (el) => { heroImgRef.current = el; } : undefined}
                  key={activeIndex === 0 ? `hero-${selectedFabric}-${colorVariantHero ?? effectiveHero}` : activeImage}
                  src={mainHeroSrc}
                  alt={`${product.name} ${activeIndex === 0 && selectedFabric ? selectedFabric : ""} image ${activeIndex + 1}`.trim()}
                  className="w-full h-full object-cover"
                  loading="eager"
                  onError={activeIndex === 0 && colorVariantHero ? handleHeroError : undefined}
                />
              ) : (
                <span className="text-arva-text-muted text-sm">
                  {product.name} — Hero
                </span>
              )}
            </button>
            {/* Thumbnails — manual click only, no autoplay */}
            <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
              {galleryImages.map((thumb, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveIndex(i)}
                  className={`aspect-square rounded-lg bg-white border shadow-arva flex items-center justify-center text-arva-text-muted text-xs p-1 transition ${
                    i === activeIndex
                      ? "border-arva-accent"
                      : "border-arva-border hover:border-arva-accent/30"
                  }`}
                  aria-label={`Show image ${i + 1} for ${product.name}`}
                  aria-pressed={i === activeIndex}
                >
                  <img
                    src={thumb}
                    alt={`${product.name} ${THUMBNAIL_LABELS[i - 1] ?? "gallery view"}`}
                    className="w-full h-full object-cover rounded-lg"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right on desktop, below images on mobile */}
          <div className="order-2 lg:sticky lg:top-24 min-w-0">
            {reviewsCount > 0 && (
              <div className="mb-3 text-sm">
                <StarsInline rating={averageRating} count={reviewsCount} />
              </div>
            )}
            <h1 className="text-2xl sm:text-3xl font-semibold text-arva-text mb-1 break-words">
              {detail.pdpH1 ?? product.name}
            </h1>
            <h2 className="text-lg font-normal text-arva-text-muted mb-4 break-words">
              {detail.pdpH2 ?? detail.subhead}
            </h2>
            <p className="text-2xl font-semibold text-arva-text mb-1">
              {compareAt != null ? (
                <>
                  <span className="line-through text-arva-text-muted font-normal mr-2">${compareAt.toLocaleString()}</span>
                  ${price.toLocaleString()}
                </>
              ) : (
                `$${price.toLocaleString()}`
              )}
            </p>
            <p className="text-sm text-arva-text-muted mb-2">
              Comparable cloud-style sectionals often start at $2,500+.
            </p>
            <div className="text-sm mb-6 space-y-1.5 text-[#6e6e6e]">
              <p className="flex flex-wrap items-center gap-x-1 gap-y-0.5">
                <IconDelivery className={iconSmall} aria-hidden />
                <span>Delivered in 2–4 weeks</span>
                <span className="opacity-70" aria-hidden>·</span>
                <IconTrial className={iconSmall} aria-hidden />
                <span>{TRUST_ITEMS[0].label}</span>
                <span className="opacity-70" aria-hidden>·</span>
                <IconWarranty className={iconSmall} aria-hidden />
                <span>Lifetime Structural Warranty</span>
              </p>
              {arrivalRange && (
                <p className="flex items-center gap-1.5">
                  <IconTrial className={iconSmall} aria-hidden />
                  <span>{arrivalRange}</span>
                </p>
              )}
            </div>

            {/* Value stack — visible without scrolling on desktop */}
            <ul className="space-y-2 mb-6">
              {detail.valueStack.map((item, i) => (
                <li key={i} className="flex gap-2 text-sm text-arva-text">
                  <span className="text-arva-accent shrink-0">•</span>
                  {item}
                </li>
              ))}
            </ul>

            <p className="text-sm text-arva-text-muted mb-6 break-words">
              This is the smart version of the sofa you already want — without the markup or the freight risk.
            </p>

            {dimensionsImage && (
              <div className="mb-4">
                <button
                  type="button"
                  onClick={() => setIsDimensionsOpen(true)}
                  className="text-sm underline text-arva-text hover:text-arva-accent transition"
                >
                  Dimensions
                </button>
              </div>
            )}

            {/* Choose your configuration (Sectional / 3-Seater / Loveseat) */}
            {relatedProducts && relatedProducts.length > 0 && (
              <ConfigSelector
                currentProduct={product}
                relatedProducts={relatedProducts}
                basePath={basePath}
              />
            )}

            {/* Fabric selection */}
            {detail.fabricOptions?.length ? (
              <FabricSwatches
                options={detail.fabricOptions}
                defaultName={detail.fabricDefault}
                selected={selectedFabric || detail.fabricDefault}
                onSelect={handleFabricSelect}
              />
            ) : (
              <div className="mb-6">
                <p className="text-xs font-medium text-arva-text-muted uppercase tracking-wide mb-2">
                  Fabric
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded border-2 border-arva-accent bg-[#f5f0e8]"
                    title={detail.fabricDefault}
                  />
                  <span className="text-sm font-medium text-arva-text">
                    {detail.fabricDefault}
                  </span>
                  <span className="text-xs text-arva-text-muted">
                    OEKO-TEX® Certified
                  </span>
                </div>
              </div>
            )}

            {/* CTA block (id for StickyCTA IntersectionObserver) */}
            <div id="pdp-hero-cta" className="space-y-3">
              <AddToCartButton product={product} detail={detail} />
              <ul className="flex flex-wrap justify-center gap-4 pt-2 text-xs text-arva-text-muted">
                {HERO_TRUST_ITEMS.map(({ label, Icon }) => (
                  <li key={label} className="flex items-center gap-1.5">
                    <Icon className="w-4 h-4 shrink-0 text-arva-accent" />
                    <span>{label}</span>
                  </li>
                ))}
              </ul>
            </div>
        </div>
      </div>
      </div>
      {isLightboxOpen && activeImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 p-4 sm:p-8 flex items-center justify-center"
          onClick={() => setIsLightboxOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={`${product.name} image gallery`}
        >
          <div
            className="relative w-full max-w-6xl"
            onClick={(event) => event.stopPropagation()}
            onTouchStart={onLightboxTouchStart}
            onTouchEnd={onLightboxTouchEnd}
          >
            <img
              src={activeImage}
              alt={`${product.name} zoomed image ${activeIndex + 1}`}
              className="w-full max-h-[85vh] object-contain rounded-lg"
            />
            {galleryImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={goPrev}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/55 text-white text-xl"
                  aria-label="Previous image"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/55 text-white text-xl"
                  aria-label="Next image"
                >
                  ›
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 h-9 w-9 rounded-full bg-black/55 text-white text-lg"
              aria-label="Close gallery"
            >
              ×
            </button>
          </div>
        </div>
      )}
      {isDimensionsOpen && dimensionsImage && (
        <div
          className="fixed inset-0 z-50 bg-black/55 p-4 flex items-center justify-center"
          onClick={() => setIsDimensionsOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={`${product.name} dimensions`}
        >
          <div
            className="relative w-full max-w-2xl rounded-xl bg-white p-4 shadow-arva-soft"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={dimensionsImage}
              alt={`${product.name} dimensions diagram`}
              className="w-full max-h-[70vh] object-contain rounded-lg"
            />
            <button
              type="button"
              onClick={() => setIsDimensionsOpen(false)}
              className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/60 text-white text-base"
              aria-label="Close dimensions"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
