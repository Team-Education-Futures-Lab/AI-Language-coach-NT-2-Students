import { FeatureGrid } from "@/components/illustrations/features-grid";
import { CozyStudySVG } from "@/components/illustrations/cozy-study";
import { CheckCircle2 } from "lucide-react";

export function FeaturesSection() {
  const checklist = [
    "Gepersonaliseerd leerpad op jouw niveau",
    "Woordentrainer met slimme herhaling",
    "Oefeningen voor spelling, luisteren en spreken",
    "AI-coach die je altijd vriendelijk feedback geeft",
  ];

  return (
    <section className="relative pb-16 sm:pb-24">
      <div className="container grid gap-10 lg:grid-cols-12 lg:gap-10 items-center">
        <div className="lg:col-span-5 order-2 lg:order-1">
          <div className="relative mx-auto max-w-md lg:max-w-none">
            <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-tr from-cozy-teal/20 via-cozy-sand/40 to-cozy-orange/25 blur-2xl" aria-hidden />
            <div className="relative rounded-3xl bg-white/85 backdrop-blur-md p-4 ring-1 ring-cozy-teal/20 shadow-cozy">
              <CozyStudySVG />
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 order-1 lg:order-2 space-y-6">
          <FeatureGrid />
          <div className="cozy-card p-5 sm:p-6">
            <div className="grid gap-3 sm:grid-cols-2 pt-1">
              {checklist.map((c) => (
                <div key={c} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cozy-teal/20 text-cozy-teal">
                    <CheckCircle2 className="h-4 w-4" strokeWidth={2.8} />
                  </div>
                  <p className="text-sm leading-relaxed text-cozy-ink/85">
                    {c}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
