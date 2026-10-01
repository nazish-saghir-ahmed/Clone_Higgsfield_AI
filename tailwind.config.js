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
        background: "#06070a",
        surface: {
          DEFAULT: "#0f111a",
          elevated: "#161926",
          glass: "rgba(255, 255, 255, 0.035)",
        },
        border: {
          subtle: "rgba(255, 255, 255, 0.07)",
          prominent: "rgba(255, 255, 255, 0.14)",
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
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
        mono: ["var(--font-jetbrains)", "JetBrains Mono", "monospace"],
        display: ["var(--font-syne)", "Syne", "sans-serif"],
      },
      keyframes: {
        laserFlow: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        glowPulse: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.8" },
        },
      },
      animation: {
        "laser-flow": "laserFlow 3s ease infinite",
        "glow-pulse": "glowPulse 2s ease-in-out infinite",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
