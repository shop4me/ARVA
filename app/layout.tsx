import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartLayout from "@/components/CartLayout";
import TopBar from "@/components/TopBar";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://livearva.com"),
  title: {
    default: "ARVA | Modern Furniture",
    template: "%s | ARVA",
  },
  description: "ARVA modern furniture. Quality sofas, sectionals, and living room pieces.",
  openGraph: {
    siteName: "ARVA",
  },
  verification: {
    google: "sFq_qF0-h7j27gLNyHfFKvbVqmr-JdF5mYnnYglHZIQ",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen flex flex-col bg-arva-bg text-arva-text font-sans">
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-17962701660"
          strategy="afterInteractive"
        />
        <Script id="google-ads-gtag" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-17962701660');
          `}
        </Script>
        <Script id="yandex-metrica" strategy="afterInteractive">
          {`(function(m,e,t,r,i,k,a){
              m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
              m[i].l=1*new Date();
              for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
              k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
          })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=106885026', 'ym');

          ym(106885026, 'init', {
            ssr: true,
            webvisor: true,
            clickmap: true,
            ecommerce: 'dataLayer',
            referrer: document.referrer,
            url: location.href,
            accurateTrackBounce: true,
            trackLinks: true
          });`}
        </Script>
        <noscript>
          <div>
            <img
              src="https://mc.yandex.ru/watch/106885026"
              style={{ position: "absolute", left: "-9999px" }}
              alt=""
            />
          </div>
        </noscript>
        <CartLayout>
          <TopBar />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </CartLayout>
      </body>
    </html>
  );
}
