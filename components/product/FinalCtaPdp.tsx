import type { Product } from "@/lib/content";
import type { ProductDetailData } from "@/lib/productDetail";
import AddToCartButton from "./AddToCartButton";

export default function FinalCtaPdp({
  product,
  detail,
}: {
  product: Product;
  detail: ProductDetailData;
}) {
  return (
    <section className="py-20 sm:py-24 bg-arva-accent text-white" aria-labelledby="pdp-final-heading">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
        <h2 id="pdp-final-heading" className="text-2xl sm:text-3xl font-semibold mb-4">
          {detail.finalCtaHeadline}
        </h2>
        <p className="text-white/80 text-lg mb-10">{detail.finalCtaSubhead}</p>
        <AddToCartButton
          product={product}
          detail={detail}
          className="inline-flex justify-center items-center px-8 py-4 bg-white text-arva-accent font-semibold rounded-lg hover:opacity-90 transition text-lg min-h-[52px]"
        />
      </div>
    </section>
  );
}
