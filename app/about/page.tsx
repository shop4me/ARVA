import type { Metadata } from "next";
import Image from "next/image";
import FadeInSection from "@/components/FadeInSection";

export const metadata: Metadata = {
  title: "About ARVA",
  description:
    "ARVA designs cloud-style sofas with structured comfort, clean lines, and long-term durability for real life.",
};

export default function AboutPage() {
  return (
    <main className="bg-arva-bg text-arva-text">
      <FadeInSection>
        <section className="relative min-h-[44vh] sm:min-h-[52vh] overflow-hidden">
          <Image
            src="/images/lifestyle/about-hero.webp"
            alt="ARVA sofa in a calm, modern living space"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/20 to-black/10" />
          <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-12 sm:pb-16">
            <h1 className="font-serif text-white text-4xl sm:text-5xl lg:text-6xl tracking-tight max-w-3xl">
              Designed to feel calm. Built to be lived in.
            </h1>
            <p className="mt-4 text-white/90 text-base sm:text-lg max-w-2xl leading-relaxed">
              ARVA makes cloud-style sofas with structure, support, and a quiet confidence that lasts.
            </p>
          </div>
        </section>
      </FadeInSection>

      <FadeInSection>
        <section className="bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
            <h2 className="font-serif text-3xl sm:text-4xl tracking-tight mb-8">Our Story</h2>
            <div className="space-y-8 text-arva-text-muted leading-8 text-[17px]">
              <p>
                We started ARVA because too many sofas looked beautiful online but fell short in real life.
                Some were too soft to support you. Some wore down too quickly. Some were priced like luxury,
                but delivered like compromises.
              </p>
              <p>
                We believed there was a better middle: modern, design-forward pieces that still feel practical
                every single day. Sofas that look clean and architectural, but are made for movie nights, coffee
                spills, pets, guests, and years of use.
              </p>
              <p>
                ARVA is built around that balance. We focus on structured comfort, durable materials, and modular
                systems that adapt as your space changes. Nothing loud. Nothing overworked. Just thoughtful
                furniture that earns its place.
              </p>
            </div>
          </div>
        </section>
      </FadeInSection>

      <FadeInSection>
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="order-2 lg:order-1">
              <h3 className="font-serif text-3xl sm:text-4xl tracking-tight mb-5">Designed for Real Life</h3>
              <p className="text-arva-text-muted leading-8 text-[17px] mb-5">
                We design for the way people actually sit, not just the way photos look. That means real back
                support, comfort that works for both upright conversations and long lounging, and silhouettes that
                stay refined over time.
              </p>
              <p className="text-arva-text-muted leading-8 text-[17px]">
                The result is a cloud-style feel with structure where it matters: supportive cores, stable seams,
                and fabrics made to handle everyday life.
              </p>
            </div>
            <div className="order-1 lg:order-2 relative aspect-[4/5] overflow-hidden rounded-2xl">
              <Image
                src="/images/details/about-detail-back-support.webp"
                alt="Close-up detail of ARVA sofa back support and tailoring"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </section>
      </FadeInSection>

      <FadeInSection>
        <section className="bg-[#f4f1ec]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
            <h3 className="font-serif text-3xl sm:text-4xl tracking-tight mb-10">Materials & Details</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <figure className="space-y-3">
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-white">
                  <Image
                    src="/images/details/about-detail-fabric.webp"
                    alt="ARVA performance fabric texture close-up"
                    fill
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    className="object-cover"
                  />
                </div>
                <figcaption className="text-sm text-arva-text-muted">Performance weave texture for daily wear.</figcaption>
              </figure>
              <figure className="space-y-3">
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-white">
                  <Image
                    src="/images/details/about-detail-seam.webp"
                    alt="ARVA seam craftsmanship detail"
                    fill
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    className="object-cover"
                  />
                </div>
                <figcaption className="text-sm text-arva-text-muted">Clean seams and tailored finishing.</figcaption>
              </figure>
              <figure className="space-y-3">
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-white">
                  <Image
                    src="/images/merchant/alto-sectional-hero.jpg"
                    alt="ARVA sofa in a bright modern home"
                    fill
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    className="object-cover"
                  />
                </div>
                <figcaption className="text-sm text-arva-text-muted">Natural light, clean proportions, everyday comfort.</figcaption>
              </figure>
              <figure className="space-y-3">
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-white">
                  <Image
                    src="/images/details/about-detail-texture.webp"
                    alt="Detail view of ARVA sofa upholstery"
                    fill
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    className="object-cover"
                  />
                </div>
                <figcaption className="text-sm text-arva-text-muted">Built to hold its look and shape over time.</figcaption>
              </figure>
            </div>
          </div>
        </section>
      </FadeInSection>

      <FadeInSection>
        <section className="bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <h3 className="font-serif text-3xl sm:text-4xl tracking-tight mb-4">Made to Last Responsibly</h3>
              <p className="text-arva-text-muted leading-8 text-[17px] max-w-xl">
                We prioritize longevity over trend cycles, and we use FSC Mix certified packaging from
                responsibly sourced materials. Better furniture should last longer, move easier, and create less
                waste along the way.
              </p>
            </div>
            <div className="relative aspect-[16/10] rounded-2xl overflow-hidden">
              <Image
                src="/images/lifestyle/about-responsibility.webp"
                alt="ARVA modular pieces prepared for clean delivery and setup"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </section>
      </FadeInSection>

      <FadeInSection>
        <section className="px-4 sm:px-6 py-16 sm:py-20">
          <p className="text-center font-serif text-3xl sm:text-4xl tracking-tight">
            Furniture should earn its place.
          </p>
        </section>
      </FadeInSection>
    </main>
  );
}
