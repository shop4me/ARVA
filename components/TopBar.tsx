"use client";

import { useEffect, useState } from "react";
import { TRUST_ITEMS } from "@/components/TrustIcons";

function getSecondsUntilMidnight(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return Math.max(0, Math.floor((midnight.getTime() - now.getTime()) / 1000));
}

function formatCountdown(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function TopBar() {
  const [countdown, setCountdown] = useState("00:00:00");

  useEffect(() => {
    const tick = () => setCountdown(formatCountdown(getSecondsUntilMidnight()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="border-b border-arva-border/80">
      {/* Ticker row — short height, complementing color */}
      <div className="bg-arva-ticker text-white/95 top-bar-marquee-pause min-w-0 py-1.5 overflow-hidden" aria-hidden>
        <div className="top-bar-marquee-inner animate-top-bar-marquee flex whitespace-nowrap w-max opacity-90 text-xs">
          {[...TRUST_ITEMS, ...TRUST_ITEMS, ...TRUST_ITEMS, ...TRUST_ITEMS]
          .filter((item) => item.id !== "return")
          .map(({ id, label, Icon }, i) => (
            <span key={`${id}-${i}`} className="inline-flex items-center shrink-0">
              <Icon className="w-3 h-3 shrink-0 text-white/90 mr-1.5" />
              <span>{label}</span>
              <span className="mx-3 text-white/40" aria-hidden>•</span>
            </span>
          ))}
        </div>
      </div>
      {/* Countdown row — taller, different color; same initial value on server/client to avoid hydration mismatch */}
      <div className="bg-arva-topbar text-white flex flex-wrap items-center justify-center gap-2 sm:gap-3 py-3 sm:py-4 px-4 text-center">
        <span className="font-semibold tabular-nums text-2xl sm:text-3xl" suppressHydrationWarning>
          {countdown}
        </span>
        <span className="text-white/90 text-sm sm:text-xl">Sale ends today</span>
      </div>
    </div>
  );
}
