import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        arva: {
          bg: "#FAFAF8",
          text: "#1a1a1a",
          "text-muted": "#525252",
          accent: "#1e2a3a",
          border: "#e5e5e5",
          /** Top bar countdown row */
          topbar: "#5a5046",
          /** Ticker strip: lighter complement, sits above countdown */
          ticker: "#6b635b",
          /** Slightly softer text for reassurance blocks — easier to read */
          "text-soft": "#4a4949",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        arva: "0 1px 3px rgba(0, 0, 0, 0.06)",
        "arva-soft": "0 4px 24px rgba(0, 0, 0, 0.06)",
      },
      keyframes: {
        "top-bar-marquee": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-25%)" },
        },
      },
      animation: {
        "top-bar-marquee": "top-bar-marquee 60s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
