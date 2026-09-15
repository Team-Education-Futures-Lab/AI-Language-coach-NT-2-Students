"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef, type ReactNode } from "react";

type Size = "sm" | "md" | "lg" | "xl";
type Variant = "inline" | "stacked";

type Props = {
  /** Het label in de gekozen UI-taal (Engels fallback als de taal geen complete dict heeft) */
  children: ReactNode;
  /** De Nederlandse bron-referentie (klein, grijs, eronder of ernaast) */
  nl?: ReactNode;
  /** Visuele variant: "stacked" = onder elkaar (default), "inline" = naast elkaar */
  variant?: Variant;
  /** Hoofdlabel-grootte */
  size?: Size;
  /** Toon de NL bron wel of niet (handig voor in tight containers) */
  showNl?: boolean;
  /** Extra classes voor de wrapper */
  className?: string;
};

const SIZE_LABEL: Record<Size, string> = {
  sm: "text-[12px] leading-tight",
  md: "text-sm leading-snug",
  lg: "text-base leading-snug",
  xl: "text-xl leading-snug",
};

const SIZE_NL: Record<Size, string> = {
  sm: "text-[10px] leading-tight",
  md: "text-[11px] leading-tight",
  lg: "text-[12px] leading-tight",
  xl: "text-[13px] leading-tight",
};

/**
 * Bilingual — rendert een vertaald UI-label met de Nederlandse bron-referentie.
 *
 * Voorbeelden:
 *   <Bilingual nl="Hoofdpagina">Dashboard</Bilingual>
 *   // → Dashboard (groot)
 *   //   Hoofdpagina (klein, grijs, eronder)
 *
 *   <Bilingual nl="Uitloggen" variant="inline">Log out</Bilingual>
 *   // → Log out · Uitloggen (naast elkaar)
 *
 * Voor NT2-leerlingen is dit goud: ze zien hun eigen taal + de NL bron.
 * Voor de 7 primary talen (NL/EN/TR/AR/PL/ES/DE) kun je `showNl={false}` zetten
 * als je geen NL referentie wilt naast hun eigen taal.
 */
export function Bilingual({
  children,
  nl,
  variant = "stacked",
  size = "md",
  showNl = true,
  className,
}: Props) {
  const rootRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (!showNl || !nl || !rootRef.current) return;
    const rect = rootRef.current.getBoundingClientRect();
    const text =
      typeof children === "string"
        ? children
        : rootRef.current.firstElementChild?.textContent ?? "";

    // #region debug-point A:bilingual-layout
    fetch("http://127.0.0.1:7777/event", {
      method: "POST",
      body: JSON.stringify({
        sessionId: "styling-broken",
        runId: "pre-fix",
        hypothesisId: "A",
        location: "components/ui/bilingual.tsx",
        msg: "[DEBUG] Bilingual rendered",
        data: {
          variant,
          size,
          showNl,
          className: className ?? "",
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          textLength: text.length,
          nlLength: typeof nl === "string" ? nl.length : 0,
          text,
        },
        ts: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
  }, [children, className, nl, showNl, size, variant]);

  if (!showNl || !nl) {
    return (
      <span ref={rootRef} className={cn(SIZE_LABEL[size], className)}>
        {children}
      </span>
    );
  }

  if (variant === "inline") {
    return (
      <span
        ref={rootRef}
        className={cn(
          "inline-flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5",
          className,
        )}
      >
        <span className={SIZE_LABEL[size]}>{children}</span>
        <span
          className={cn(
            SIZE_NL[size],
            "font-medium text-cozy-ink/45 italic",
          )}
          aria-label={`Nederlands: ${typeof nl === "string" ? nl : ""}`}
          title={typeof nl === "string" ? nl : undefined}
        >
          · {nl}
        </span>
      </span>
    );
  }

  // stacked (default): vertaald groot, NL klein en cursief eronder
  return (
    <span ref={rootRef} className={cn("inline-flex flex-col", className)}>
      <span className={SIZE_LABEL[size]}>{children}</span>
      <span
        className={cn(
          SIZE_NL[size],
          "font-medium text-cozy-ink/45 italic -mt-0.5",
        )}
        aria-label={`Nederlands: ${typeof nl === "string" ? nl : ""}`}
        title={typeof nl === "string" ? nl : undefined}
      >
        {nl}
      </span>
    </span>
  );
}

/**
 * BilingualField — voor inline tekst waar je de bron _achter_ de vertaling
 * wilt tonen in plaats van eronder (bijv. in een sector-banner met beperkte ruimte).
 */
export function BilingualField({
  children,
  nl,
  size = "md",
  className,
}: {
  children: ReactNode;
  nl?: ReactNode;
  size?: Size;
  className?: string;
}) {
  if (!nl) return <span className={className}>{children}</span>;
  return (
    <span className={cn("inline-flex items-baseline gap-1.5", className)}>
      <span className={SIZE_LABEL[size]}>{children}</span>
      <span
        className={cn(
          SIZE_NL[size],
          "font-medium text-cozy-ink/45 italic whitespace-nowrap",
        )}
      >
        ({nl})
      </span>
    </span>
  );
}
