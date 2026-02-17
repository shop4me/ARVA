import type { Metadata } from "next";
import { Inter } from "next/font/google";
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
