/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        lime: {
          300: "#bef264",
          400: "#a3e635",
          500: "#84cc16",
        },
      },
      boxShadow: {
        brutal: "4px 4px 0px 0px #000000",
        "brutal-sm": "2px 2px 0px 0px #000000",
        "brutal-lg": "6px 6px 0px 0px #000000",
        "brutal-xl": "8px 8px 0px 0px #000000",
        "brutal-hover": "2px 2px 0px 0px #000000",
        "brutal-lime": "4px 4px 0px 0px #84cc16",
        "brutal-pink": "4px 4px 0px 0px #ec4899",
        "brutal-blue": "4px 4px 0px 0px #3b82f6",
        "brutal-yellow": "4px 4px 0px 0px #eab308",
        "brutal-red": "4px 4px 0px 0px #ef4444",
        "brutal-emerald": "4px 4px 0px 0px #10b981",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "system-ui", "sans-serif"],
        mono: ["'Space Mono'", "monospace"],
      },
      animation: {
        "bounce-slow": "bounce 2s infinite",
        wiggle: "wiggle 1s ease-in-out infinite",
      },
      keyframes: {
        wiggle: {
          "0%, 100%": { transform: "rotate(-2deg)" },
          "50%": { transform: "rotate(2deg)" },
        },
      },
    },
  },
  plugins: [],
};
