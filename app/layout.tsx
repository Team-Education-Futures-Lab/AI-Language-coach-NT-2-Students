import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible, Fredoka } from "next/font/google";
import { ThemeProvider } from "@/components/layouts/theme-provider";
import "./globals.css";

const atkinson = Atkinson_Hyperlegible({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "700"],
  variable: "--font-atkinson",
});

const fredoka = Fredoka({
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700"],
  variable: "--font-fredoka",
});

export const metadata: Metadata = {
  title: {
    default: "Taalcoach AI — Leer Nederlands met je persoonlijke AI-coach",
    template: "%s | Taalcoach AI",
  },
  description:
    "Oefen Nederlands op een laagdrempelige manier met je persoonlijke AI-taalcoach. Voor NT2-studenten die doorstromen naar het MBO.",
  keywords: ["NT2", "Nederlands leren", "AI taalcoach", "MBO", "oefenen"],
  authors: [{ name: "Mindlabs" }],
  openGraph: {
    title: "Taalcoach AI — Leer Nederlands met AI",
    description:
      "Persoonlijke AI-taalcoach voor NT2-studenten. Spreekvaardigheid, woordenschat, feedback en gamification.",
    type: "website",
    locale: "nl_NL",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFF8EC" },
    { media: "(prefers-color-scheme: dark)", color: "#264653" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="nl"
      suppressHydrationWarning
      className={`${atkinson.variable} ${fredoka.variable}`}
    >
      <body className="min-h-dvh bg-background font-sans text-foreground antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
