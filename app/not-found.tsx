import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <h1 className="text-3xl font-semibold text-arva-text mb-2">
        404 — Page Not Found
      </h1>
      <p className="text-arva-text-muted mb-8">
        The page you’re looking for doesn’t exist or has been moved.
      </p>
      <Link
        href="/"
        className="inline-block px-6 py-3.5 bg-arva-accent text-white font-medium rounded-lg hover:opacity-90 transition"
      >
        Back to Home
      </Link>
    </div>
  );
}
