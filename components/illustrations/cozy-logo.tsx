import * as React from "react";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  iconClassName?: string;
  size?: "sm" | "md" | "lg";
  glow?: boolean;
  showText?: boolean;
  textVariant?: "primary" | "cozy";
};

function BookIcon({
  className,
  palette,
}: {
  className?: string;
  palette: { bg: string; accent: string; ink: string; sand: string };
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-full w-full", className)}
    >
      <defs>
        <linearGradient id="logoPageA" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor={palette.sand} />
          <stop offset="100%" stopColor={palette.accent} />
        </linearGradient>
        <linearGradient id="logoPageB" x1="0" x2="1" y1="1" y2="0">
          <stop offset="0%" stopColor={palette.bg} />
          <stop offset="100%" stopColor="#2a9d8f" />
        </linearGradient>
      </defs>

      <rect
        x="8"
        y="10"
        width="48"
        height="46"
        rx="10"
        fill={palette.bg}
        stroke={palette.ink}
        strokeWidth="3"
      />
      <rect x="8" y="10" width="24" height="46" rx="10" fill="url(#logoPageA)" />
      <rect
        x="32"
        y="10"
        width="24"
        height="46"
        rx="10"
        fill="url(#logoPageB)"
      />
      <rect
        x="30"
        y="10"
        width="4"
        height="46"
        fill={palette.ink}
        opacity="0.18"
      />

      <rect x="14" y="20" width="16" height="3" rx="1.5" fill={palette.ink} opacity="0.75" />
      <rect x="14" y="28" width="12" height="3" rx="1.5" fill={palette.ink} opacity="0.6" />
      <rect x="14" y="36" width="14" height="3" rx="1.5" fill={palette.ink} opacity="0.6" />

      <path
        d="M40 24 C44 20 52 20 54 28 C56 36 48 40 42 36 L40 40 Z"
        fill={palette.accent}
        stroke={palette.ink}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <circle cx="46" cy="30" r="2" fill="#FFF8EC" />

      <circle cx="20" cy="50" r="2.5" fill={palette.sand} stroke={palette.ink} strokeWidth="2" />
    </svg>
  );
}

export function CozyLogo({
  className,
  iconClassName,
  size = "md",
  glow = true,
  showText = true,
  textVariant = "cozy",
}: Props) {
  const sizes = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-14 w-14",
  };
  const palette = {
    bg: "#e76f51",
    accent: "#f4a261",
    sand: "#e9c46a",
    ink: "#264653",
  };

  const textClass =
    textVariant === "cozy"
      ? "text-cozy-ink"
      : "text-foreground";

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className={cn(
          "relative shrink-0 rounded-2xl",
          sizes[size],
          glow && "drop-shadow-[0_8px_24px_rgba(231,111,81,0.35)]",
          iconClassName
        )}
      >
        <BookIcon palette={palette} />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-1.5 -top-1.5 h-4 w-4 rounded-full shadow-soft"
          style={{
            background: "#e9c46a",
            border: "2px solid #264653",
          }}
        />
      </div>
      {showText ? (
        <div className="flex flex-col leading-none">
          <span
            className={cn(
              "font-display tracking-tight leading-none",
              size === "lg"
                ? "text-2xl font-bold"
                : size === "sm"
                ? "text-[15px] font-bold"
                : "text-lg font-bold",
              textClass
            )}
          >
            Taalcoach
            <span className="ml-1 bg-gradient-to-r from-cozy-terracotta via-cozy-orange to-cozy-teal bg-clip-text text-transparent">
              AI
            </span>
          </span>
          <span
            className={cn(
              "font-semibold uppercase tracking-[0.16em] text-cozy-terracotta/85",
              size === "sm" ? "text-[9px] mt-0.5" : "text-[10px] mt-1"
            )}
          >
            cozy&nbsp;·&nbsp;NT2
          </span>
        </div>
      ) : null}
    </div>
  );
}
