"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import HeaderCartIcon from "@/components/HeaderCartIcon";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-arva-border/80 bg-arva-bg/95 backdrop-blur-sm shadow-arva">
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between" aria-label="Main">
        <Link href="/" className="text-xl font-semibold text-arva-text tracking-tight hover:opacity-80 transition">
          ARVA
        </Link>
        <ul className="hidden md:flex items-center gap-6 sm:gap-8">
          <li>
            <Link
              href="/about"
              className="text-sm font-medium text-arva-text-muted hover:text-arva-text transition"
            >
              About
            </Link>
          </li>
          <li>
            <Link
              href="/products"
              className="text-sm font-medium text-arva-text-muted hover:text-arva-text transition"
            >
              Products
            </Link>
          </li>
          <li>
            <Link
              href="/blog"
              className="text-sm font-medium text-arva-text-muted hover:text-arva-text transition"
            >
              Blog
            </Link>
          </li>
          <li className="ml-auto flex items-center gap-2">
            <HeaderCartIcon />
            <Link
              href="/login"
              className="text-sm font-medium text-arva-text-muted hover:text-arva-text transition"
            >
              Login
            </Link>
          </li>
        </ul>
        <div className="md:hidden flex items-center gap-2">
          <HeaderCartIcon />
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-arva-border text-arva-text"
            aria-expanded={mobileOpen}
            aria-controls="mobile-main-menu"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? "×" : "☰"}
          </button>
        </div>
      </nav>
      {mobileOpen && (
        <div id="mobile-main-menu" className="md:hidden border-t border-arva-border/80 bg-arva-bg">
          <ul className="px-4 py-3 space-y-2">
            <li>
              <Link
                href="/about"
                className="block py-2 text-sm font-medium text-arva-text-muted hover:text-arva-text transition"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                href="/products"
                className="block py-2 text-sm font-medium text-arva-text-muted hover:text-arva-text transition"
              >
                Products
              </Link>
            </li>
            <li>
              <Link
                href="/blog"
                className="block py-2 text-sm font-medium text-arva-text-muted hover:text-arva-text transition"
              >
                Blog
              </Link>
            </li>
            <li>
              <Link
                href="/login"
                className="block py-2 text-sm font-medium text-arva-text-muted hover:text-arva-text transition"
              >
                Login
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
