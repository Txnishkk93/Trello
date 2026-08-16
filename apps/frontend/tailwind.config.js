/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#09090B",
        surface: "#111113",
        surface2: "#18181B",
        line: "#242427",
        line2: "#2E2E32",
        ink: "#F4F4F5",
        ink2: "#A1A1AA",
        ink3: "#6B6B70",
        accent: "#E4E4E7",
        danger: "#E5484D",
        success: "#3E9B6F",
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      fontSize: {
        xs: ["11px", "16px"],
        sm: ["12.5px", "18px"],
        base: ["13.5px", "20px"],
        md: ["15px", "22px"],
        lg: ["18px", "26px"],
        xl: ["22px", "30px"],
        "2xl": ["28px", "36px"],
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "6px",
        md: "8px",
        lg: "10px",
      },
      boxShadow: {
        panel: "0 1px 0 0 rgba(255,255,255,0.03) inset",
        pop: "0 8px 24px -8px rgba(0,0,0,0.6)",
      },
      keyframes: {
        fadein: { "0%": { opacity: 0, transform: "translateY(2px)" }, "100%": { opacity: 1, transform: "translateY(0)" } },
        scalein: { "0%": { opacity: 0, transform: "scale(0.98)" }, "100%": { opacity: 1, transform: "scale(1)" } },
      },
      animation: {
        fadein: "fadein 120ms ease-out",
        scalein: "scalein 120ms ease-out",
      },
    },
  },
  plugins: [],
};
