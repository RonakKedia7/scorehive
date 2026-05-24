/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Base backgrounds
        background: "#F8FAFC", // slightly cooler, modern gray
        surface: "#FFFFFF", // cards, modals
        surfaceSecondary: "#F1F5F9",

        // Primary – modern blue
        primary: {
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#3B82F6", // main primary
          600: "#2563EB",
          700: "#1D4ED8",
          800: "#1E40AF",
          900: "#1E3A8A",
          DEFAULT: "#3B82F6",
        },

        // Secondary – cricket green (optional, use for success / pitch)
        secondary: {
          50: "#F0FDF4",
          100: "#DCFCE7",
          200: "#BBF7D0",
          300: "#86EFAC",
          400: "#4ADE80",
          500: "#22C55E",
          600: "#16A34A",
          700: "#15803D",
          800: "#166534",
          900: "#14532D",
          DEFAULT: "#22C55E",
        },

        // Text colors
        text: {
          primary: "#0F172A", // slate-900
          secondary: "#475569", // slate-600
          tertiary: "#94A3B8", // slate-400
          disabled: "#CBD5E1",
          inverse: "#FFFFFF",
        },

        // Border & divider
        border: {
          light: "#E2E8F0",
          DEFAULT: "#CBD5E1",
          dark: "#94A3B8",
        },

        // Status & feedback
        success: {
          light: "#DCFCE7",
          DEFAULT: "#22C55E",
          dark: "#15803D",
        },
        warning: {
          light: "#FEF9C3",
          DEFAULT: "#EAB308",
          dark: "#A16207",
        },
        danger: {
          light: "#FEE2E2",
          DEFAULT: "#EF4444",
          dark: "#B91C1C",
        },
        info: {
          light: "#DBEAFE",
          DEFAULT: "#3B82F6",
          dark: "#1E40AF",
        },

        // Overlays & accents
        active: "#DBEAFE", // kept for backward compatibility
        highlight: "rgba(59,130,246,0.1)",

        // Card & surface shadows (used with shadow utilities)
        shadow: {
          sm: "rgba(0,0,0,0.05)",
          md: "rgba(0,0,0,0.08)",
          lg: "rgba(0,0,0,0.12)",
        },
      },

      borderRadius: {
        scorer: "4px", // legacy
        card: "1rem", // 16px
        btn: "0.75rem", // 12px
        input: "0.75rem",
      },

      spacing: {
        scorer: "14px",
        card: "1.25rem", // 20px
      },

      boxShadow: {
        "card-sm":
          "0 1px 2px 0 rgb(0 0 0 / 0.05), 0 1px 1px -1px rgb(0 0 0 / 0.05)",
        card: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.05)",
        "card-md":
          "0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.05)",
        "card-lg":
          "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.05)",
      },

      animation: {
        "fade-in": "fadeIn 0.2s ease-in-out",
        "scale-in": "scaleIn 0.2s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
