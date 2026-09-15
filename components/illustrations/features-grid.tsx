import * as React from "react";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  label?: string;
};

type IconProps = { className?: string };

function BookIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("h-6 w-6", className)}>
      <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5A2.5 2.5 0 0 0 4 22.5v-18Z" stroke="#264653" strokeWidth="1.8" />
      <path d="M8 6.5h10M8 10h10M8 13.5h7" stroke="#264653" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function SparkIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("h-6 w-6", className)}>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8"
        stroke="#264653" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function TrophyIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("h-6 w-6", className)}>
      <path d="M7 4h10v4a5 5 0 0 1-10 0V4Z M4 6H7v2a3 3 0 0 1-3-3Z M17 6h3a3 3 0 0 1-3 3V6Z M9 15h6l-1 4h-4l-1-4Z M8 19h8v2H8z"
        fill="#264653" fillOpacity="0.12" stroke="#264653" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function ChatIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("h-6 w-6", className)}>
      <path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-6l-4 4v-4H6a2 2 0 0 1-2-2V6Z"
        fill="#264653" fillOpacity="0.08" stroke="#264653" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M8 9h8M8 12h5" stroke="#264653" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

const LIST = [
  {
    id: "coach",
    title: "Praat met je AI-coach",
    description: "Oefen je spreekvaardigheid in een warm gesprek zonder druk. De coach antwoordt simpel en met feedback.",
    icon: ChatIcon,
    color: "#2a9d8f",
  },
  {
    id: "words",
    title: "Woordjes leren",
    description: "Plezierige flashcards die precies terugkomen wanneer je ze nodig hebt. Nieuw? Oud? Allemaal OK.",
    icon: BookIcon,
    color: "#e76f51",
  },
  {
    id: "practice",
    title: "Kleine stapjes, grote winst",
    description: "Van 'de/het' tot zinnen bouwen: per oefening stap je verder en krijg je een beloning.",
    icon: SparkIcon,
    color: "#f4a261",
  },
  {
    id: "progress",
    title: "Zie je vooruitgang",
    description: "XP, strepen, niveaus en doelen: alles klopt en je ziet precies hoe je groeit.",
    icon: TrophyIcon,
    color: "#e9c46a",
  },
];

export function FeatureGrid({ className, label = "Waarom Taalcoach AI" }: Props & { label?: string }) {
  return (
    <div className={className}>
      <div className="mb-6 flex flex-col items-start gap-3">
        <span className="cozy-chip">✨ {label}</span>
        <h3 className="heading-display text-2xl font-bold text-cozy-ink sm:text-3xl">
          Leren moet fijn zijn, niet moeilijk.
        </h3>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {LIST.map((f) => {
          const Icon = f.icon;
          return (
            <div
              key={f.id}
              className="cozy-card p-5 transition-transform duration-300 hover:-translate-y-0.5"
            >
              <div className="flex items-start gap-4 pt-1">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
                  style={{ background: `${f.color}22`, border: `2px solid ${f.color}44` }}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="font-display text-lg font-semibold text-cozy-ink">
                    {f.title}
                  </h4>
                  <p className="text-sm leading-relaxed text-cozy-ink/75">
                    {f.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
