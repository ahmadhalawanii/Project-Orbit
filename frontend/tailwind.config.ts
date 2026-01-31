import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      animation: {
        "orbit-ring": "orbit-ring 2.5s ease-in-out infinite",
        "pulse-once": "pulse-once 0.6s ease-out",
        "travel-line": "travel-line 0.8s ease-out forwards",
      },
      keyframes: {
        "orbit-ring": {
          "0%, 100%": { opacity: "1", boxShadow: "0 0 0 0 rgba(34, 211, 238, 0.4)" },
          "50%": { opacity: "0.9", boxShadow: "0 0 0 6px rgba(34, 211, 238, 0.15)" },
        },
        "pulse-once": {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.08)", opacity: "0.95" },
        },
        "travel-line": {
          "0%": { opacity: "0.3", transform: "scaleX(0)" },
          "50%": { opacity: "1", transform: "scaleX(1)" },
          "100%": { opacity: "1", transform: "scaleX(1)" },
        },
        "stage-enter": {
          from: { opacity: "0", transform: "translateX(16px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "stage-exit": {
          from: { opacity: "1", transform: "translateX(0)" },
          to: { opacity: "0", transform: "translateX(-12px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
