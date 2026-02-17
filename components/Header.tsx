import Link from "next/link";
import HeaderCartIcon from "@/components/HeaderCartIcon";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-arva-border/80 bg-arva-bg/95 backdrop-blur-sm shadow-arva">
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between" aria-label="Main">
        <Link href="/" className="text-xl font-semibold text-arva-text tracking-tight hover:opacity-80 transition">
          ARVA
        </Link>
        <ul className="flex items-center gap-6 sm:gap-8">
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
      </nav>
    </header>
  );
}
