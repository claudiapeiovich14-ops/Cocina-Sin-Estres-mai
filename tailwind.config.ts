import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#090909",
        surface: "#141414",
        surface2: "#1c1c1c",
        orange: {
          DEFAULT: "#FF7A1A",
          soft: "#FF9A4D",
          dim: "#3A2210",
        },
        olive: {
          DEFAULT: "#9FBE7C",
          soft: "#C0DA9E",
          dim: "#26301C",
        },
        warm: "#F5EDE6",
        success: "#3CB371",
        muted: "#8F8F8F",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 70px -8px rgba(255, 122, 26, 0.6)",
        card: "0 10px 30px -10px rgba(0,0,0,0.6)",
      },
      keyframes: {
        floatSlow: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-14px) rotate(4deg)" },
        },
        spinSlow: {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.5", transform: "scale(1)" },
          "50%": { opacity: "0.9", transform: "scale(1.08)" },
        },
      },
      animation: {
        floatSlow: "floatSlow 4.5s ease-in-out infinite",
        spinSlow: "spinSlow 6s linear infinite",
        pulseGlow: "pulseGlow 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
