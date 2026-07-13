import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./data/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        estate: {
          navy: "#1A3A5C",
          "navy-mid": "#1E5A8A",
          "navy-light": "#2563A0",
          blue: "#1E5A8A",
          "blue-light": "#42A5F5",
          "blue-pale": "#E3F2FD",
          amber: "#42A5F5",
          "amber-dark": "#2563EB",
          "amber-pale": "#EFF6FF",
          bg: "#F8FAFC",
          surface: "#F1F5F9",
          text: "#1F2937",
          "text-sec": "#5B6B7A",
          muted: "#8A99A8",
          border: "#DBEAFE",
          "border-med": "#BDD4EA",
          success: "#1976D2",
          "success-bg": "#E3F2FD",
          red: "#B94B4B",
          "red-bg": "#FFF1F1",
        },
      },
      fontFamily: {
        serif: ["Playfair Display", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
      boxShadow: {
        estate: "0 4px 20px rgba(26,58,92,0.08)",
        "estate-md": "0 12px 34px rgba(26,58,92,0.10)",
        "estate-lg": "0 22px 54px rgba(26,58,92,0.12)",
        "search-card": "0 24px 70px rgba(26,58,92,0.16)",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseAmber: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(66, 165, 245, 0.4)" },
          "50%": { boxShadow: "0 0 0 8px rgba(66, 165, 245, 0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-up": "fadeUp 0.35s ease forwards",
        "pulse-amber": "pulseAmber 2s infinite",
        "shimmer": "shimmer 2.5s infinite linear",
      },
    },
  },
  plugins: [],
};

export default config;
