import type { Product } from "@/lib/content";
import type { ProductDetailData } from "@/lib/productDetail";
import FabricSwatches from "./FabricSwatches";
import AddToCartButton from "./AddToCartButton";
import ConfigSelector from "./ConfigSelector";
import { TRUST_ITEMS } from "@/components/TrustIcons";

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
  const price = detail.displayPrice ?? product.price;
  const iconSmall = "w-4 h-4 shrink-0 text-arva-accent";
  const IconDelivery = TRUST_ITEMS[4].Icon;
  const IconTrial = TRUST_ITEMS[0].Icon;
  const IconWarranty = TRUST_ITEMS[3].Icon;

  return (
    <section className="border-b border-arva-border/80 bg-arva-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Left — Product images (hierarchy: hero then thumbnails in order) */}
          <div className="order-2 lg:order-1 space-y-4">
            {/* Hero: pure white background */}
            <div
              className="aspect-[4/3] rounded-xl bg-white border border-arva-border shadow-arva-soft overflow-hidden flex items-center justify-center"
              style={{ minHeight: 320 }}
            >
              <span className="text-arva-text-muted text-sm">
                {product.name} — Hero
              </span>
            </div>
            {/* Thumbnails — manual click only, no autoplay */}
            <div className="grid grid-cols-5 gap-2">
              {THUMBNAIL_LABELS.map((label, i) => (
                <button
                  key={i}
                  type="button"
                  className="aspect-square rounded-lg bg-white border border-arva-border shadow-arva flex items-center justify-center text-arva-text-muted text-xs p-1 hover:border-arva-accent/30 transition"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Right — Product info + CTA */}
          <div className="order-1 lg:order-2 lg:sticky lg:top-24">
            <h1 className="text-2xl sm:text-3xl font-semibold text-arva-text mb-1">
              {detail.pdpH1 ?? product.name}
            </h1>
            <h2 className="text-lg font-normal text-arva-text-muted mb-4">
              {detail.pdpH2 ?? detail.subhead}
            </h2>
            <p className="text-2xl font-semibold text-arva-text mb-1">
              ${price.toLocaleString()}
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

            <p className="text-sm text-arva-text-muted mb-6">
              This is the smart version of the sofa you already want — without the markup or the freight risk.
            </p>

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
    </section>
  );
}
