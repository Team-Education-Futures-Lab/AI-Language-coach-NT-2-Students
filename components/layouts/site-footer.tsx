import Link from "next/link";
import { CozyLogo } from "@/components/illustrations/cozy-logo";
import { Heart } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-cozy-sand/50 bg-gradient-to-b from-cozy-sand/15 via-background to-background">
      <div className="container grid gap-10 py-12 md:grid-cols-12 md:gap-10">
        <div className="md:col-span-6 space-y-4">
          <Link href="/" className="inline-flex outline-none">
          <CozyLogo size="md" />
        </Link>
          <p className="max-w-md text-sm leading-relaxed text-cozy-ink/75">
            Een warm platform voor NT2-studenten om Nederlands te oefenen met een
            persoonlijke AI-coach. Gericht op MBO-doorstromers. Kleine stapjes,
            groot resultaat.
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="cozy-chip">🌞 Laagdrempelig</span>
            <span className="cozy-chip">🧠 Gepersonaliseerd</span>
            <span className="cozy-chip">🎮 Met XP en strepen</span>
          </div>
        </div>

        <div className="md:col-span-3">
          <h4 className="font-display text-sm font-bold uppercase tracking-[0.16em] text-cozy-ink">
            Product
          </h4>
          <ul className="mt-4 space-y-2 text-sm font-medium text-cozy-ink/75">
            <li>
              <Link href="/#features" className="hover:text-cozy-terracotta">
                Functies
              </Link>
            </li>
            <li>
              <Link href="/login" className="hover:text-cozy-terracotta">
                Inloggen
              </Link>
            </li>
            <li>
              <Link href="/register" className="hover:text-cozy-terracotta">
                Aanmelden
              </Link>
            </li>
          </ul>
        </div>

        <div className="md:col-span-3">
          <h4 className="font-display text-sm font-bold uppercase tracking-[0.16em] text-cozy-ink">
            Contact
          </h4>
          <ul className="mt-4 space-y-2 text-sm font-medium text-cozy-ink/75">
            <li className="hover:text-cozy-terracotta">support@taalcoachai.nl</li>
            <li>Mindlabs</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-cozy-sand/40 py-6">
        <div className="container flex flex-col items-center justify-between gap-3 text-xs text-cozy-ink/65 md:flex-row">
          <span>
            © {new Date().getFullYear()} TaalcoachAI · Alle rechten voorbehouden.
          </span>
          <span className="inline-flex items-center gap-1">
            Gemaakt met
            <Heart className="mx-1 h-3.5 w-3.5 text-cozy-terracotta fill-current" />
            zorg voor NT2-studenten.
          </span>
        </div>
      </div>
    </footer>
  );
}
