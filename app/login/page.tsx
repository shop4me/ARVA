"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/customer/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Login failed.");
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-16">
      <h1 className="text-2xl font-semibold text-arva-text mb-2">Log in</h1>
      <p className="text-arva-text-muted mb-8">
        Use the email and password you set after your purchase.
      </p>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="login-email" className="block text-sm font-medium text-arva-text mb-1">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-arva-border rounded-lg bg-white text-arva-text placeholder:text-arva-text-muted focus:outline-none focus:ring-2 focus:ring-arva-accent/20 focus:border-arva-accent"
            placeholder="you@example.com"
            required
          />
        </div>
        <div>
          <label htmlFor="login-password" className="block text-sm font-medium text-arva-text mb-1">
            Password
          </label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-arva-border rounded-lg bg-white text-arva-text placeholder:text-arva-text-muted focus:outline-none focus:ring-2 focus:ring-arva-accent/20 focus:border-arva-accent"
            required
          />
        </div>
        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-arva-accent text-white font-medium rounded-lg hover:opacity-90 transition disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="mt-6 text-sm text-arva-text-muted">
        Don&apos;t have an account? You can set your password after your first order.
      </p>
      <p className="mt-4">
        <Link href="/" className="text-sm font-medium text-arva-accent hover:underline">
          ← Back to home
        </Link>
      </p>
    </div>
  );
}
