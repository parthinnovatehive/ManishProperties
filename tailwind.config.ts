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
          navy: "#164A34",
          "navy-mid": "#1E5D3D",
          "navy-light": "#2E7450",
          blue: "#1E5D3D",
          "blue-light": "#66BB6A",
          "blue-pale": "#E8F5E9",
          amber: "#66BB6A",
          "amber-dark": "#3E7B45",
          "amber-pale": "#EFF8EF",
          bg: "#F8FAF8",
          surface: "#F3F6F2",
          text: "#1F2937",
          "text-sec": "#5D6B61",
          muted: "#8A9A90",
          border: "#DDE8DD",
          "border-med": "#C7D8C8",
          success: "#2F8F46",
          "success-bg": "#E8F5E9",
          red: "#B94B4B",
          "red-bg": "#FFF1F1",
        },
      },
      fontFamily: {
        serif: ["Playfair Display", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
      boxShadow: {
        estate: "0 4px 20px rgba(22,74,52,0.08)",
        "estate-md": "0 12px 34px rgba(22,74,52,0.10)",
        "estate-lg": "0 22px 54px rgba(22,74,52,0.12)",
        "search-card": "0 24px 70px rgba(22,74,52,0.16)",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fadeUp 0.35s ease forwards",
      },
    },
  },
  plugins: [],
};

export default config;
