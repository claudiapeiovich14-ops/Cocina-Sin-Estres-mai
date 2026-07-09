import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#FBF6EE",
        surface: "#FFFFFF",
        surface2: "#F2E9D8",
        orange: {
          DEFAULT: "#E8672C",
          soft: "#F0895A",
          dim: "#FBE2D0",
        },
        olive: {
          DEFAULT: "#6E7F4F",
          soft: "#93A374",
          dim: "#E7ECDC",
        },
        warm: "#2B2620",
        success: "#5B8A52",
        muted: "#8A8272",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 10px 30px -8px rgba(232, 103, 44, 0.35)",
        card: "0 10px 30px -10px rgba(43,38,32,0.12)",
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
