/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#050609",
        surface: {
          DEFAULT: "#0d101a",
          elevated: "#141826",
          glass: "rgba(255, 255, 255, 0.035)",
        },
        border: {
          subtle: "rgba(255, 255, 255, 0.06)",
          prominent: "rgba(255, 255, 255, 0.12)",
          focus: "#00dbe9",
        },
        accent: {
          cyan: {
            DEFAULT: "#00dbe9",
            glow: "rgba(0, 219, 233, 0.35)",
          },
          indigo: {
            DEFAULT: "#6366f1",
            glow: "rgba(99, 102, 241, 0.3)",
          },
          lime: {
            DEFAULT: "#d9ff00",
            glow: "rgba(217, 255, 0, 0.25)",
          },
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Plus Jakarta Sans", "Inter", "sans-serif"],
        serif: ["var(--font-serif)", "Playfair Display", "Georgia", "serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
      keyframes: {
        laserFlow: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.9" },
        },
      },
      animation: {
        "laser-flow": "laserFlow 3s ease infinite",
        "pulse-glow": "pulseGlow 2.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
