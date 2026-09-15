import * as React from "react";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};

export function CozyStudySVG({ className }: Props) {
  return (
    <svg
      viewBox="0 0 320 260"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-auto w-full", className)}
    >
      <defs>
        <linearGradient id="bgStudy" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#e9c46a" stopOpacity="0.35" />
          <stop offset="60%" stopColor="#f4a261" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#e76f51" stopOpacity="0.22" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="320" height="260" rx="20" fill="url(#bgStudy)" />

      <g transform="translate(60,150) rotate(-8)">
        <rect x="0" y="0" width="170" height="12" fill="#264653" rx="3" />
        <rect x="4" y="-42" width="162" height="44" fill="#FFF5E1" stroke="#264653" strokeWidth="3" rx="4" />
        <rect x="10" y="-34" width="58" height="28" fill="#2a9d8f" opacity="0.28" rx="2" />
        <rect x="76" y="-34" width="82" height="4" fill="#264653" opacity="0.18" rx="2" />
        <rect x="76" y="-24" width="68" height="4" fill="#264653" opacity="0.18" rx="2" />
        <rect x="76" y="-14" width="56" height="4" fill="#264653" opacity="0.18" rx="2" />
      </g>

      <g transform="translate(216,54)">
        <rect x="0" y="42" width="14" height="78" fill="#264653" opacity="0.6" rx="3" />
        <rect x="-10" y="112" width="34" height="8" fill="#264653" opacity="0.85" rx="4" />
        <ellipse cx="7" cy="30" rx="16" ry="28" fill="#f4a261" opacity="0.3" />
        <ellipse cx="7" cy="24" rx="10" ry="18" fill="#e9c46a" opacity="0.75" />
        <ellipse cx="7" cy="18" rx="5" ry="10" fill="#FFF8EC" opacity="0.95" />
      </g>

      <g transform="translate(148,98)">
        <path d="M0 0 L30 0 L26 34 L4 34 Z" fill="#e76f51" stroke="#264653" strokeWidth="2.5" />
        <rect x="2" y="6" width="26" height="22" fill="#264653" opacity="0.12" />
        <path d="M4 2 L26 2 L24 10 L6 10 Z" fill="#e9c46a" />
        <circle cx="15" cy="20" r="1.2" fill="#FFF5E1" />
      </g>

      <g transform="translate(30,42)">
        <circle cx="0" cy="0" r="18" fill="#2a9d8f" opacity="0.25" />
        <rect x="-5" y="14" width="10" height="30" fill="#6b4a2b" rx="2" />
        <circle cx="-6" cy="-6" r="12" fill="#2a9d8f" opacity="0.85" />
        <circle cx="8" cy="-4" r="12" fill="#2a9d8f" opacity="0.85" />
        <circle cx="0" cy="6" r="14" fill="#2a9d8f" opacity="0.85" />
        <circle cx="-3" cy="-3" r="4" fill="#e9c46a" opacity="0.55" />
      </g>

      <g transform="translate(230,176)">
        <ellipse cx="0" cy="0" rx="28" ry="10" fill="#264653" opacity="0.08" />
        <rect x="-20" y="-26" width="40" height="26" fill="#FFF5E1" stroke="#264653" strokeWidth="2.5" rx="6" />
        <path d="M-20 -22 Q0 -14 20 -22" fill="none" stroke="#264653" strokeWidth="1.5" opacity="0.3" />
        <rect x="-14" y="-16" width="10" height="3" fill="#e76f51" rx="1" />
        <rect x="-14" y="-10" width="20" height="3" fill="#2a9d8f" opacity="0.6" rx="1" />
        <rect x="-14" y="-4" width="14" height="3" fill="#f4a261" rx="1" />
      </g>
    </svg>
  );
}
