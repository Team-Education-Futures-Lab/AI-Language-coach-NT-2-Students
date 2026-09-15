import * as React from "react";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  seed?: number;
  showFoliage?: boolean;
};

export function CozyHomeSVG({ className, seed = 0, showFoliage = true }: Props) {
  const jitter = (seed * 13) % 10;
  return (
    <svg
      viewBox="0 0 320 260"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-auto w-full", className)}
      shapeRendering="crispEdges"
    >
      <defs>
        <linearGradient id="skyCozy" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#f4a261" stopOpacity="0.7" />
          <stop offset="55%" stopColor="#e9c46a" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#2a9d8f" stopOpacity="0.18" />
        </linearGradient>
        <linearGradient id="roofCozy" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#e76f51" />
          <stop offset="100%" stopColor="#b4533a" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="320" height="260" fill="url(#skyCozy)" rx="20" />

      <circle cx={270 - jitter} cy="50" r="20" fill="#e9c46a" opacity="0.9" />
      <circle cx={248 - jitter} cy="42" r="10" fill="#f4a261" opacity="0.55" />

      {showFoliage && (
        <>
          <circle cx="46" cy="146" r="30" fill="#2a9d8f" opacity="0.85" />
          <circle cx="62" cy="130" r="18" fill="#2a9d8f" opacity="0.85" />
          <rect x="50" y="160" width="8" height="36" fill="#6b4a2b" />
          <circle cx="286" cy="156" r="26" fill="#2a9d8f" opacity="0.75" />
          <circle cx="266" cy="142" r="16" fill="#2a9d8f" opacity="0.75" />
          <rect x="278" y="170" width="7" height="32" fill="#6b4a2b" />
        </>
      )}

      <rect x="0" y="200" width="320" height="60" fill="#2a9d8f" opacity="0.28" />
      <rect x="0" y="200" width="320" height="8" fill="#2a9d8f" opacity="0.45" />

      <g transform="translate(86,108)">
        <rect x="0" y="40" width="148" height="92" fill="#FFF5E1" stroke="#264653" strokeWidth="4" />
        <rect x="0" y="28" width="148" height="16" fill="#264653" opacity="0.18" />
        <polygon points="-14,44 74,-10 162,44" fill="url(#roofCozy)" stroke="#264653" strokeWidth="4" />

        <rect x="58" y="74" width="32" height="58" fill="#f4a261" stroke="#264653" strokeWidth="3" rx="4" />
        <circle cx="84" cy="104" r="2.5" fill="#264653" />

        <rect x="18" y="66" width="26" height="26" fill="#e9c46a" stroke="#264653" strokeWidth="3" />
        <line x1="31" y1="66" x2="31" y2="92" stroke="#264653" strokeWidth="3" />
        <line x1="18" y1="79" x2="44" y2="79" stroke="#264653" strokeWidth="3" />

        <rect x="104" y="66" width="26" height="26" fill="#e9c46a" stroke="#264653" strokeWidth="3" />
        <line x1="117" y1="66" x2="117" y2="92" stroke="#264653" strokeWidth="3" />
        <line x1="104" y1="79" x2="130" y2="79" stroke="#264653" strokeWidth="3" />

        <rect x="66" y="-2" width="16" height="22" fill="#b4533a" stroke="#264653" strokeWidth="3" />
        <rect x="66" y="-2" width="16" height="6" fill="#e76f51" opacity="0.8" />

        <rect x="-6" y="104" width="14" height="28" fill="#264653" opacity="0.14" rx="2" />
        <rect x="140" y="108" width="12" height="24" fill="#264653" opacity="0.14" rx="2" />
      </g>

      <g opacity="0.85">
        <rect x="40" y="224" width="20" height="6" fill="#264653" opacity="0.18" rx="3" />
        <rect x="78" y="232" width="16" height="4" fill="#264653" opacity="0.18" rx="2" />
        <rect x="250" y="228" width="18" height="5" fill="#264653" opacity="0.18" rx="3" />
      </g>

      <g transform="translate(150,84)">
        <rect x="0" y="0" width="8" height="18" fill="#264653" opacity="0.4" />
      </g>
    </svg>
  );
}
