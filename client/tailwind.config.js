/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Base backgrounds (Midnight Obsidian)
        background: "#09090B", // Deepest zinc/black
        surface: "#18181B", // Slightly elevated for cards/modals
        surfaceSecondary: "#27272A", // Tertiary elevations

        // Primary – Champagne Gold
        primary: {
          50: "#FBF9F1",
          100: "#F6F1E0",
          200: "#EAE0C0",
          300: "#DAC999",
          400: "#C9AE6D",
          500: "#D4AF37", // Main premium gold
          600: "#A37A37",
          700: "#835C2B",
          800: "#694826",
          900: "#573B21",
          DEFAULT: "#D4AF37",
        },

        // Secondary – Rich Emerald (Maintains the cricket/success vibe but darker)
        secondary: {
          50: "#ECFDF5",
          100: "#D1FAE5",
          200: "#A7F3D0",
          300: "#6EE7B7",
          400: "#34D399",
          500: "#10B981", // Rich emerald
          600: "#059669",
          700: "#047857",
          800: "#065F46",
          900: "#064E3B",
          DEFAULT: "#10B981",
        },

        // Text colors (Optimized for dark backgrounds)
        text: {
          primary: "#FAFAFA", // Off-white, easier on the eyes than pure white
          secondary: "#A1A1AA", // Muted zinc
          tertiary: "#71717A", // Deeper gray for placeholders
          disabled: "#52525B",
          inverse: "#09090B", // Dark text for gold buttons
        },

        // Border & divider (Subtle delineations)
        border: {
          light: "#3F3F46",
          DEFAULT: "#27272A",
          dark: "#18181B",
        },

        // Status & feedback (Adjusted for dark mode contrast)
        success: {
          light: "#064E3B",
          DEFAULT: "#10B981",
          dark: "#047857",
        },
        warning: {
          light: "#713F12",
          DEFAULT: "#F59E0B",
          dark: "#B45309",
        },
        danger: {
          light: "#7F1D1D",
          DEFAULT: "#EF4444",
          dark: "#B91C1C",
        },
        info: {
          light: "#1E3A8A",
          DEFAULT: "#3B82F6", // Kept a vibrant blue for standard info state
          dark: "#1D4ED8",
        },

        // Overlays & accents
        active: "#27272A",
        highlight: "rgba(212, 175, 55, 0.1)", // Gold highlight

        // Shadows optimized for dark mode
        shadow: {
          sm: "rgba(0,0,0,0.3)",
          md: "rgba(0,0,0,0.4)",
          lg: "rgba(0,0,0,0.5)",
        },
      },

      borderRadius: {
        scorer: "4px",
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
          "0 1px 3px 0 rgb(0 0 0 / 0.4), 0 1px 2px -1px rgb(0 0 0 / 0.3)",
        card: "0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.3)",
        "card-md":
          "0 10px 15px -3px rgb(0 0 0 / 0.5), 0 4px 6px -4px rgb(0 0 0 / 0.4)",
        "card-lg":
          "0 20px 25px -5px rgb(0 0 0 / 0.6), 0 8px 10px -6px rgb(0 0 0 / 0.5)",
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
