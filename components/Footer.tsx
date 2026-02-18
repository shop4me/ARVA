import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-arva-border/80 bg-arva-bg mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <Link href="/" className="font-semibold text-arva-text hover:opacity-80 transition">
            ARVA
          </Link>
          <ul className="flex flex-wrap gap-6 sm:gap-8 text-sm text-arva-text-muted">
            <li>
              <Link href="/products" className="hover:text-arva-text transition">
                Products
              </Link>
            </li>
            <li>
              <Link href="/blog" className="hover:text-arva-text transition">
                Blog
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-arva-text transition">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-arva-text transition">
                Terms of use
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-arva-text transition">
                Privacy policy
              </Link>
            </li>
            <li>
              <Link href="/return-policy" className="hover:text-arva-text transition">
                Shipping and returns
              </Link>
            </li>
            <li>
              <Link href="/return-policy#warranty" className="hover:text-arva-text transition">
                Warranty
              </Link>
            </li>
          </ul>
        </div>
        <p className="mt-6 text-sm text-arva-text-muted text-center sm:text-left">
          © {new Date().getFullYear()} ARVA.
        </p>
      </div>
    </footer>
  );
}
