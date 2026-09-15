import Link from "next/link";
import { CozyHomeSVG } from "@/components/illustrations/cozy-home";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-10 pb-16 sm:pt-16 sm:pb-24">
      <div className="pointer-events-none absolute inset-0 cozy-grain opacity-60" aria-hidden />

      <div className="relative container grid gap-10 lg:grid-cols-12 lg:gap-10 items-center">
        <div className="lg:col-span-7 space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/70 backdrop-blur px-3 py-1 text-xs font-semibold text-cozy-ink ring-1 ring-cozy-sand/60 shadow-soft">
            <Sparkles className="h-3.5 w-3.5 text-cozy-terracotta" />
            Gratis proberen · voor MBO-doorstromers · geen creditcard
          </span>

          <div className="space-y-4">
            <h1 className="heading-display text-4xl font-bold leading-[1.05] text-cozy-ink sm:text-5xl md:text-6xl">
              Leer Nederlands met een{" "}
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-cozy-terracotta via-cozy-orange to-cozy-sand bg-clip-text text-transparent">
                  warme, fijne
                </span>
                <span
                  aria-hidden
                  className="absolute -bottom-1 left-0 -right-2 h-3 bg-cozy-sand/50 -rotate-1 rounded-full"
                />
              </span>{" "}
              AI-taalcoach.
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-cozy-ink/75 sm:text-lg">
              Oefen spreekvaardigheid, woordenschat en grammatica op je eigen
              tempo. Kleine stappen, duidelijke feedback en een beloning voor
              elke vooruitgang — of je nu net begint of verder wilt groeien.
            </p>
          </div>

          <div className="flex flex-col items-stretch gap-3 pt-2 sm:flex-row sm:items-center">
            <Button
              asChild
              size="lg"
              className="h-12 rounded-full px-7 text-base font-semibold shadow-cozy bg-gradient-to-r from-cozy-terracotta via-cozy-orange to-cozy-sand text-cozy-ink hover:brightness-105 hover:shadow-glow border-2 border-white/60"
            >
              <Link href="/register">
                <Sparkles className="mr-1.5 h-5 w-5" />
                Start met leren
                <ArrowRight className="ml-1.5 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 rounded-full px-6 text-base font-semibold bg-white/80 backdrop-blur border-cozy-teal/30 text-cozy-ink hover:bg-white"
            >
              <Link href="/login">Ik heb al een account</Link>
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-4">
            <div className="flex -space-x-2">
              {["#e76f51", "#f4a261", "#e9c46a", "#2a9d8f"].map((c, i) => (
                <div
                  key={i}
                  className="h-8 w-8 rounded-full border-2 border-white"
                  style={{ background: c }}
                />
              ))}
            </div>
            <p className="text-sm text-cozy-ink/75">
              <span className="font-semibold text-cozy-ink">Al 1.200+</span>{" "}
              leerlingen oefenen elke week met Taalcoach AI.
            </p>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="relative mx-auto max-w-md lg:max-w-none">
            <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-tr from-cozy-terracotta/25 via-cozy-sand/40 to-cozy-teal/25 blur-2xl" aria-hidden />
            <div className="relative rounded-3xl bg-white/85 backdrop-blur-md p-4 ring-1 ring-cozy-sand/50 shadow-cozy animate-floaty">
              <CozyHomeSVG />
            </div>

            <div className="absolute -left-4 -bottom-6 hidden md:block">
              <div className="cozy-card !rounded-2xl flex items-center gap-3 px-4 py-3 w-56 animate-wiggle origin-bottom-left">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cozy-sand/40 text-cozy-ink">
                  <Sparkles className="h-5 w-5 text-cozy-terracotta" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[11px] uppercase tracking-wider text-cozy-ink/60 font-semibold">
                    Woord van de dag
                  </p>
                  <p className="font-display font-bold text-cozy-ink leading-none">
                    gezellig
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
