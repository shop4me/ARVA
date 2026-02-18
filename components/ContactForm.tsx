"use client";

import { useState } from "react";

const inputClass =
  "w-full py-3 px-4 border border-arva-border rounded-lg bg-arva-bg text-arva-text placeholder:text-arva-text-muted focus:outline-none focus:ring-2 focus:ring-arva-accent/30 focus:border-arva-accent transition";
const labelClass = "block text-sm font-medium text-arva-text mb-1.5";

export default function ContactForm() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    const form = e.currentTarget;
    const data = new FormData(form);
    const body = {
      name: data.get("name"),
      email: data.get("email"),
      phone: data.get("phone"),
      message: data.get("message"),
    };
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setSent(true);
        form.reset();
      } else {
        setSent(false);
      }
    } catch {
      setSent(false);
    }
    setSending(false);
  }

  if (sent) {
    return (
      <div className="rounded-lg border border-arva-border bg-arva-accent/5 p-8 text-center">
        <p className="text-arva-text font-medium">Thanks for reaching out.</p>
        <p className="mt-2 text-arva-text-muted text-sm">
          We&apos;ll get back to you soon.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="contact-name" className={labelClass}>
          Name
        </label>
        <input
          id="contact-name"
          type="text"
          name="name"
          required
          className={inputClass}
          placeholder="Your name"
          autoComplete="name"
        />
      </div>
      <div>
        <label htmlFor="contact-email" className={labelClass}>
          Email
        </label>
        <input
          id="contact-email"
          type="email"
          name="email"
          required
          className={inputClass}
          placeholder="you@example.com"
          autoComplete="email"
        />
      </div>
      <div>
        <label htmlFor="contact-phone" className={labelClass}>
          Phone
        </label>
        <input
          id="contact-phone"
          type="tel"
          name="phone"
          className={inputClass}
          placeholder="(555) 000-0000"
          autoComplete="tel"
        />
      </div>
      <div>
        <label htmlFor="contact-message" className={labelClass}>
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={4}
          className={`${inputClass} resize-y min-h-[100px]`}
          placeholder="How can we help?"
        />
      </div>
      <button
        type="submit"
        disabled={sending}
        className="w-full sm:w-auto py-3 px-6 bg-arva-accent text-white font-medium rounded-lg hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {sending ? "Sending…" : "Send"}
      </button>
    </form>
  );
}
