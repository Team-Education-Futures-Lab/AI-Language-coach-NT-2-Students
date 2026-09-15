import type { Config } from "tailwindcss";

const cozyPalette = {
  ink: "#264653",
  teal: "#2a9d8f",
  sand: "#e9c46a",
  orange: "#f4a261",
  terracotta: "#e76f51",
};

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "0.75rem",
      screens: {
        "2xl": "1280px",
      },
    },
    extend: {
      fontFamily: {
        sans: [
          "var(--font-atkinson)",
          "ui-rounded",
          "Quicksand",
          "system-ui",
          "sans-serif",
        ],
        display: [
          "var(--font-fredoka)",
          "Quicksand",
          "var(--font-atkinson)",
          "system-ui",
          "sans-serif",
        ],
        pixel: [
          "'Press Start 2P'",
          "ui-monospace",
          "SFMono-Regular",
          "monospace",
        ],
      },
      colors: {
        cozy: cozyPalette,
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 6px)",
        "2xl": "calc(var(--radius) + 12px)",
        pill: "999px",
      },
      boxShadow: {
        cozy: "0 10px 30px -10px hsl(27 51% 45% / 0.25)",
        soft: "0 6px 18px -8px hsl(197 36% 24% / 0.2)",
        glow: "0 0 40px -10px hsl(44 72% 66% / 0.45)",
        "tc-card":
          "0 1px 2px hsl(197 36% 24% / 0.04), 0 10px 30px -16px hsl(197 36% 24% / 0.18)",
        "tc-topbar": "0 1px 0 hsl(197 36% 24% / 0.05), 0 6px 20px -12px hsl(197 36% 24% / 0.12)",
        "tc-stats": "0 2px 0 hsl(44 72% 66% / 0.35), 0 10px 30px -16px hsl(173 58% 39% / 0.2)",
        "tc-inset": "inset 0 1px 0 hsl(0 0% 100% / 0.7)",
        "tc-soft": "0 2px 10px -4px hsl(197 36% 24% / 0.12)",
      },
      backgroundImage: {
        "grain-light":
          "radial-gradient(hsl(44 72% 66% / 0.12) 1px, transparent 1px), radial-gradient(hsl(27 87% 67% / 0.12) 1px, transparent 1px)",
        "sunset-gradient":
          "linear-gradient(135deg, #e76f51 0%, #f4a261 35%, #e9c46a 70%, #2a9d8f 100%)",
        "tc-sunset-btn":
          "linear-gradient(135deg, #e76f51 0%, #e08043 30%, #f4a261 60%, #e9c46a 100%)",
        "tc-sunset-soft":
          "linear-gradient(135deg, hsl(11 76% 61% / 0.10) 0%, hsl(27 87% 67% / 0.16) 35%, hsl(44 72% 66% / 0.18) 70%, hsl(173 58% 39% / 0.12) 100%)",
        "tc-sky-card":
          "linear-gradient(180deg, hsl(197 65% 97%) 0%, hsl(200 60% 95%) 100%)",
        "tc-header-hero":
          "radial-gradient(1200px 300px at 10% -20%, hsl(44 72% 88% / 0.65), transparent 60%), radial-gradient(900px 300px at 110% 0%, hsl(11 76% 86% / 0.35), transparent 55%)",
        "tc-ai-panel":
          "linear-gradient(135deg, hsl(11 76% 61% / 0.10) 0%, hsl(44 72% 66% / 0.12) 30%, hsl(173 58% 39% / 0.16) 70%, hsl(188 55% 84% / 0.35) 100%)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        floaty: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        wiggle: {
          "0%,100%": { transform: "rotate(-2deg)" },
          "50%": { transform: "rotate(2deg)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        floaty: "floaty 5s ease-in-out infinite",
        wiggle: "wiggle 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
