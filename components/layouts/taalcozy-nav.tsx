"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  BookOpen,
  ChevronDown,
  Construction,
  Flame,
  Globe2,
  LayoutDashboard,
  LogOut,
  Map,
  MessageSquareText,
  UsersRound,
  Star,
  User,
  UserCircle2,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { LANGUAGES, flagEmoji, getNativeName, type Locale } from "@/lib/i18n/types";
import { PRIMARY_LOCALES_WITH_FULL_DICT, getSectorLabel } from "@/lib/i18n/dictionaries";
import { nlSources } from "@/lib/i18n/nlSources";
import { Bilingual } from "@/components/ui/bilingual";
import { useSector } from "@/lib/sector/SectorProvider";
import type { SectorCode } from "@/lib/sector/types";

type NavItem = {
  titleKey: "dashboard" | "missions" | "lessons" | "lessonBuilder" | "profile" | "teacher" | "coach" | "progress";
  href: string;
  badgeKey?: "teacherBadge";
  teacherOnly?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { titleKey: "dashboard", href: "/dashboard" },
  { titleKey: "missions", href: "/missions" },
  { titleKey: "coach", href: "/chat" },
  { titleKey: "lessons", href: "/lessons" },
  { titleKey: "lessonBuilder", href: "/lesson-builder", badgeKey: "teacherBadge", teacherOnly: true },
  { titleKey: "teacher", href: "/teacher", teacherOnly: true },
  { titleKey: "progress", href: "/progress" },
];

type Props = {
  userName?: string | null;
  userEmail?: string | null;
  userImage?: string | null;
  streakDays?: number;
  xp?: number;
  erkLevel?: string;
  role?: "ADMIN" | "TEACHER" | "STUDENT";
};

function initials(name?: string | null) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("");
}

function useClickOutside<T extends HTMLElement>(onClose: () => void) {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);
  return ref;
}

export function TaalCozyNav({
  userName,
  userEmail,
  userImage,
  streakDays = 7,
  xp = 1450,
  erkLevel = "B1",
  role = "STUDENT",
}: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const xpFormatted = xp.toLocaleString("nl-NL");
  const { locale, setLocale, t, showNlRef } = useLocale();
  const { sector, sectorCode, setSectorCode, sectors } = useSector();

  const [langOpen, setLangOpen] = useState(false);
  const [langQuery, setLangQuery] = useState("");
  const [sectorOpen, setSectorOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const langRef = useClickOutside<HTMLDivElement>(() => {
    setLangOpen(false);
    setLangQuery("");
  });
  const sectorRef = useClickOutside<HTMLDivElement>(() => setSectorOpen(false));
  const menuRef = useClickOutside<HTMLDivElement>(() => setMenuOpen(false));

  const currentLangEntry =
    LANGUAGES.find((l) => l.code === locale) ?? LANGUAGES[0];
  const currentFlag = flagEmoji(currentLangEntry?.region ?? "");
  const currentNativeName = getNativeName(
    (currentLangEntry?.code ?? "nl") as string,
  );

  // Geneste zoekfunctie: filter op Nederlands label + native name + code
  const filteredLangs = LANGUAGES.filter((l) => {
    if (!langQuery) return true;
    const q = langQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      l.code.toLowerCase().includes(q) ||
      l.label.toLowerCase().includes(q) ||
      getNativeName(l.code as string).toLowerCase().includes(q)
    );
  });
  // Tonen: eerst 7 "primary" talen (compleet vertaald), daarna de rest alfabetisch
  const topLangs = langQuery
    ? filteredLangs
    : filteredLangs.filter((l) =>
        PRIMARY_LOCALES_WITH_FULL_DICT.has(l.code as string),
      );
  const restLangs = langQuery
    ? []
    : filteredLangs.filter(
        (l) => !PRIMARY_LOCALES_WITH_FULL_DICT.has(l.code as string),
      );

  function onPickLocale(code: Locale) {
    setLocale(code);
    setLangOpen(false);
    setLangQuery("");
    router.refresh();
  }
  function onPickSector(code: SectorCode) {
    setSectorCode(code);
    setSectorOpen(false);
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-black/40 backdrop-blur-2xl shadow-lg">
      <div className="mx-auto flex h-20 w-full max-w-[1200px] lg:max-w-[1360px] xl:max-w-[1480px] 2xl:max-w-[1680px] items-center gap-2 sm:gap-3 lg:gap-4 xl:gap-5 2xl:gap-6 px-3 sm:px-4 md:px-5 lg:px-6 xl:px-7 2xl:px-8">
        {/* Logo */}
        <Link
          href="/dashboard"
          className="flex shrink-0 items-center gap-2 sm:gap-3 group min-w-0"
          aria-label="TaalCozy home"
        >
          <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 shadow-lg ring-1 ring-inset ring-white/20">
            <MessageSquareText className="h-5 w-5 text-white" />
          </span>
          <div className="leading-tight hidden sm:block shrink-0">
            <p className="font-display text-xl font-bold text-white shrink-0">
              {t.nav.appName.split("TaalCozy")[0]}
              Taal<span className="text-fuchsia-400">Cozy</span>
            </p>
            <div className="text-[11px] font-semibold text-white/60 -mt-0.5 shrink-0">
              {showNlRef ? (
                <Bilingual nl={nlSources.nav.appSubtitle} size="sm">
                  {t.nav.appSubtitle}
                </Bilingual>
              ) : (
                t.nav.appSubtitle
              )}
            </div>
          </div>
        </Link>

        {/* Pill Nav */}
        <nav aria-label="Hoofdmenu" className="hidden lg:block mx-auto min-w-0 overflow-hidden">
          <ul className="flex items-center gap-1 xl:gap-1.5 2xl:gap-2 rounded-xl bg-white/5 p-1 xl:p-1.5 2xl:p-2 ring-1 ring-inset ring-white/10 shadow-lg backdrop-blur-md">
            {NAV_ITEMS.filter((item) => !item.teacherOnly || role !== "STUDENT").map((item) => {
              const title =
                item.titleKey === "missions"
                  ? "Missions"
                  : item.titleKey === "teacher"
                    ? "Studenten"
                    : item.titleKey === "coach"
                      ? "Mijn coach"
                      : item.titleKey === "progress"
                        ? "Mijn groei"
                        : t.nav[item.titleKey];
              const active =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(
                      item.href.split("/").slice(0, 3).join("/"),
                    );
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "relative inline-flex items-center gap-1 xl:gap-1.5 2xl:gap-2 rounded-lg",
                      "px-2.5 xl:px-3 2xl:px-3.5 py-2 xl:py-2.5 text-sm xl:text-[15px] font-bold transition-all",
                      active
                        ? "bg-white/10 text-white shadow-sm ring-1 ring-white/20"
                        : "text-white/60 hover:bg-white/5 hover:text-white",
                    )}
                  >
                    {active && (
                      <span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 rounded-lg bg-gradient-to-r from-indigo-500/20 to-fuchsia-500/20"
                      />
                    )}
                    <span className="relative flex shrink-0 items-center gap-1 xl:gap-1.5 2xl:gap-2">
                      {item.titleKey === "dashboard" && (
                        <LayoutDashboard
                          className={cn(
                            "h-4 w-4 xl:h-[18px] xl:w-[18px] shrink-0",
                            active ? "text-fuchsia-400" : "text-white/60",
                          )}
                        />
                      )}
                      {item.titleKey === "lessons" && (
                        <BookOpen
                          className={cn(
                            "h-4 w-4 xl:h-[18px] xl:w-[18px] shrink-0",
                            active ? "text-fuchsia-400" : "text-white/60",
                          )}
                        />
                      )}
                      {item.titleKey === "missions" && (
                        <Map
                          className={cn(
                            "h-4 w-4 xl:h-[18px] xl:w-[18px] shrink-0",
                            active ? "text-fuchsia-400" : "text-white/60",
                          )}
                        />
                      )}
                      {item.titleKey === "lessonBuilder" && (
                        <Construction
                          className={cn(
                            "h-4 w-4 xl:h-[18px] xl:w-[18px] shrink-0",
                            active ? "text-fuchsia-400" : "text-white/60",
                          )}
                        />
                      )}
                      {item.titleKey === "profile" && (
                        <User
                          className={cn(
                            "h-4 w-4 xl:h-[18px] xl:w-[18px] shrink-0",
                            active ? "text-fuchsia-400" : "text-white/60",
                          )}
                        />
                      )}
                      {item.href === "/teacher" && (
                        <UsersRound
                          className={cn(
                            "h-4 w-4 xl:h-[18px] xl:w-[18px] shrink-0",
                            active ? "text-fuchsia-400" : "text-white/60",
                          )}
                        />
                      )}
                      <span className="hidden 2xl:inline shrink-0 whitespace-nowrap">{title}</span>
                      {item.badgeKey && (
                        <span className="hidden 2xl:inline ml-0.5 rounded-md bg-fuchsia-500/20 px-2 py-0.5 text-[10px] font-black text-fuchsia-200 ring-1 ring-inset ring-fuchsia-500/30 shrink-0 whitespace-nowrap">
                          {t.nav[item.badgeKey]}
                        </span>
                      )}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Right stack: switches + stats + profile */}
        <div className="ml-auto flex items-center gap-1.5 sm:gap-2 lg:gap-2.5 xl:gap-3 2xl:gap-4 min-w-0">
          {/* ---------------- TAAL SWITCHER ---------------- */}
          <div className="relative shrink-0" ref={langRef}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setLangOpen((v) => !v);
                if (!langOpen) setLangQuery("");
                setSectorOpen(false);
                setMenuOpen(false);
              }}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-white shadow-lg hover:bg-white/10 transition-colors backdrop-blur-md"
              aria-haspopup="listbox"
              aria-expanded={langOpen}
              aria-label={t.nav.language}
            >
              <Globe2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white/70 shrink-0" />
              <span className="text-base leading-none shrink-0" aria-hidden>
                {currentFlag}
              </span>
              <span className="hidden lg:inline xl:hidden max-w-[8ch] truncate">
                {currentNativeName}
              </span>
              <span className="hidden xl:inline max-w-[14ch] 2xl:max-w-none truncate">
                {currentNativeName}
              </span>
              <ChevronDown
                className={cn(
                  "hidden sm:inline h-3 w-3 xl:h-3.5 xl:w-3.5 text-white/50 transition-transform shrink-0",
                  langOpen && "rotate-180",
                )}
              />
            </button>
            {langOpen && (
              <div
                role="dialog"
                aria-label={t.nav.language}
                className="absolute right-0 mt-2 z-50 w-[340px] overflow-hidden rounded-xl border border-white/10 bg-black/80 backdrop-blur-2xl shadow-2xl"
              >
                <div className="border-b border-white/10 px-3.5 py-3">
                  <p className="text-[11px] font-black uppercase tracking-wider text-white/50 mb-2">
                    {t.nav.language}
                  </p>
                  <div className="relative">
                    <input
                      autoFocus
                      type="search"
                      value={langQuery}
                      onChange={(e) => setLangQuery(e.target.value)}
                      placeholder={t.common.search + "…"}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-9 py-2 text-sm font-semibold text-white placeholder:text-white/40 focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                      aria-label={t.common.search}
                    />
                    <svg
                      className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <circle cx="11" cy="11" r="7" />
                      <path d="m21 21-4.3-4.3" />
                    </svg>
                  </div>
                </div>

                <ul className="max-h-[360px] overflow-y-auto tc-hide-scroll">
                  {topLangs.length > 0 && !langQuery && (
                    <li className="px-3.5 pt-2.5 pb-1">
                      <p className="text-[10px] font-black uppercase tracking-wider text-white/50">
                        ✓ Direct ondersteund — 7 talen
                      </p>
                    </li>
                  )}
                  {topLangs.map((l) => (
                    <li key={l.code}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={l.code === locale}
                        onClick={() => onPickLocale(l.code)}
                        className={cn(
                          "flex w-full items-center gap-3 px-3.5 py-2 text-left text-sm font-semibold transition-colors",
                          l.code === locale
                            ? "bg-gradient-to-r from-indigo-500/20 to-fuchsia-500/20 text-white"
                            : "text-white/80 hover:bg-white/10",
                        )}
                      >
                        <span className="text-xl leading-none">
                          {flagEmoji(l.region)}
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="block truncate">
                            {getNativeName(l.code as string)}
                          </span>
                          <span className="block truncate text-[11px] font-semibold text-white/50">
                            {l.label} · {(l.code as string).toUpperCase()}
                          </span>
                        </span>
                        {l.code === locale && (
                          <span className="tc-chip-teal-strong">✓</span>
                        )}
                      </button>
                    </li>
                  ))}

                  {restLangs.length > 0 && (
                    <>
                      <li className="border-t border-white/10 px-3.5 pt-2.5 pb-1">
                        <p className="text-[10px] font-black uppercase tracking-wider text-white/50">
                          🌐 Automatische vertaling — {restLangs.length} talen
                        </p>
                      </li>
                      {restLangs.map((l) => (
                        <li key={l.code}>
                          <button
                            type="button"
                            role="option"
                            aria-selected={l.code === locale}
                            onClick={() => onPickLocale(l.code)}
                            className={cn(
                              "flex w-full items-center gap-3 px-3.5 py-2 text-left text-sm font-semibold transition-colors",
                              l.code === locale
                                ? "bg-gradient-to-r from-indigo-500/20 to-fuchsia-500/20 text-white"
                                : "text-white/80 hover:bg-white/10",
                            )}
                          >
                            <span className="text-xl leading-none">
                              {flagEmoji(l.region)}
                            </span>
                            <span className="flex-1 min-w-0">
                              <span className="block truncate">
                                {getNativeName(l.code as string)}
                              </span>
                              <span className="block truncate text-[11px] font-semibold text-white/50">
                                {l.label} · {(l.code as string).toUpperCase()}
                              </span>
                            </span>
                            {l.code === locale && (
                              <span className="tc-chip-teal-strong">✓</span>
                            )}
                          </button>
                        </li>
                      ))}
                    </>
                  )}

                  {langQuery && filteredLangs.length === 0 && (
                    <li className="px-3.5 py-6 text-center text-sm font-semibold text-white/50">
                      🔍 {t.nav.searchNoResults(langQuery)}
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>

          {/* ---------------- SECTOR SWITCHER ---------------- */}
          <div className="relative hidden lg:block shrink-0" ref={sectorRef}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSectorOpen((v) => !v);
                setLangOpen(false);
                setMenuOpen(false);
              }}
              className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-white shadow-lg hover:bg-white/10 transition-colors backdrop-blur-md"
              aria-haspopup="listbox"
              aria-expanded={sectorOpen}
              aria-label={t.nav.sector}
            >
              <span className="text-base leading-none shrink-0" aria-hidden>
                {sector.icon}
              </span>
              <span className="max-w-[7ch] lg:max-w-[7ch] xl:max-w-[12ch] 2xl:max-w-none truncate">
                {(() => {
                  const sectorLabel = getSectorLabel(locale, sector.dictKey);
                  const nlLabel = getSectorLabel("nl", sector.dictKey);
                  return showNlRef ? (
                    <Bilingual nl={nlLabel} size="sm" variant="inline">
                      {sectorLabel}
                    </Bilingual>
                  ) : (
                    sectorLabel
                  );
                })()}
              </span>
              <ChevronDown
                className={cn(
                  "h-3 w-3 xl:h-3.5 xl:w-3.5 text-white/50 transition-transform shrink-0",
                  sectorOpen && "rotate-180",
                )}
              />
            </button>
            {sectorOpen && (
              <div
                role="listbox"
                className="absolute right-0 mt-2 z-50 w-72 overflow-hidden rounded-xl border border-white/10 bg-black/80 backdrop-blur-2xl shadow-2xl"
              >
                <div className="border-b border-white/10 px-3.5 py-2.5">
                  <p className="text-[11px] font-black uppercase tracking-wider text-white/50">
                    {t.nav.sector}
                  </p>
                  <p className="text-sm font-semibold text-white">
                    {t.nav.sectorChooseTitle}
                  </p>
                </div>
                <ul className="max-h-[380px] overflow-y-auto divide-y divide-white/5 tc-hide-scroll">
                  {sectors.map((s) => {
                    const sLabel = getSectorLabel(locale, s.dictKey);
                    const sNlLabel = getSectorLabel("nl", s.dictKey);
                    return (
                      <li key={s.code}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={s.code === sectorCode}
                          onClick={() => onPickSector(s.code)}
                          className={cn(
                            "flex w-full items-center gap-3 px-3.5 py-2.5 text-left text-sm font-semibold transition-colors",
                            s.code === sectorCode
                              ? "bg-gradient-to-r from-indigo-500/20 to-fuchsia-500/20 text-white"
                              : "text-white/80 hover:bg-white/10",
                          )}
                        >
                          <span className="text-xl leading-none">{s.icon}</span>
                          <span className="flex-1">
                            {showNlRef ? (
                              <Bilingual nl={sNlLabel} size="sm">
                                {sLabel}
                              </Bilingual>
                            ) : (
                              sLabel
                            )}
                          </span>
                          {s.code === sectorCode && (
                            <span className="tc-chip-teal-strong">✓</span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

          {/* ---------------- STATS CHIPS ---------------- */}
          <div className="hidden 2xl:flex items-center gap-2 shrink-0">
            <span className="tc-chip-pink shrink-0">
              <Flame className="h-3.5 w-3.5 shrink-0" />
              <span className="shrink-0">
                {showNlRef ? (
                  <Bilingual nl={nlSources.nav.streakDays(streakDays)} size="sm" variant="inline">
                    {t.nav.streakDays(streakDays)}
                  </Bilingual>
                ) : (
                  t.nav.streakDays(streakDays)
                )}
              </span>
            </span>
            <span className="tc-chip-sand shrink-0">
              <Star className="h-3.5 w-3.5 shrink-0" />
              <span className="shrink-0">
                {showNlRef ? (
                  <Bilingual nl={nlSources.nav.xpLabel(xpFormatted)} size="sm" variant="inline">
                    {t.nav.xpLabel(xpFormatted)}
                  </Bilingual>
                ) : (
                  t.nav.xpLabel(xpFormatted)
                )}
              </span>
            </span>
            <span className="tc-chip-teal hidden 2xl:inline-flex shrink-0">
              <span className="font-black tracking-tight shrink-0">
                {showNlRef ? (
                  <Bilingual nl={nlSources.nav.erkLabel} size="sm" variant="inline">
                    {t.nav.erkLabel}
                  </Bilingual>
                ) : (
                  t.nav.erkLabel
                )}
              </span>{" "}
              <span className="shrink-0">{erkLevel}</span>
            </span>
          </div>

          {/* ---------------- AVATAR / PROFILE MENU ---------------- */}
          <div className="relative shrink-0" ref={menuRef}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((v) => !v);
                setLangOpen(false);
                setSectorOpen(false);
              }}
              className="group rounded-full outline-none focus:ring-2 focus:ring-indigo-500/50"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label="Account menu"
            >
              <Avatar className="h-10 w-10 ring-2 ring-white/20 shadow-lg transition-transform group-hover:scale-[1.03]">
                {userImage ? (
                  <AvatarImage src={userImage} alt={userName ?? ""} />
                ) : null}
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-sm font-black text-white ring-1 ring-inset ring-white/30">
                  {initials(userName) || <User className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>
            </button>
            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 z-50 w-72 overflow-hidden rounded-xl border border-white/10 bg-black/80 backdrop-blur-2xl shadow-2xl"
              >
                <div className="border-b border-white/10 px-4 py-3 bg-gradient-to-br from-indigo-500/10 to-fuchsia-500/10">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-11 w-11 ring-2 ring-white/20 shadow-lg">
                      {userImage ? (
                        <AvatarImage src={userImage} alt={userName ?? ""} />
                      ) : null}
                      <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-sm font-black text-white">
                        {initials(userName) || <User className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 leading-tight">
                      <p className="truncate font-display font-bold text-white">
                        {userName ?? "Gast"}
                      </p>
                      <p className="truncate text-[11px] font-semibold text-white/60">
                        {userEmail ?? "Inloggen…"}
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1">
                        <span className="tc-chip-sand-light">
                          <span className="text-sm leading-none" aria-hidden>
                            {sector.icon}
                          </span>
                        </span>
                        <span className="tc-chip-teal">
                          <span className="font-black">
                            {showNlRef ? (
                              <Bilingual nl={nlSources.nav.erkLabel} size="sm" variant="inline">
                                {t.nav.erkLabel}
                              </Bilingual>
                            ) : (
                              t.nav.erkLabel
                            )}
                          </span>{" "}
                          {erkLevel}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <ul className="p-1.5">
                  {role !== "STUDENT" && (
                    <li>
                      <Link
                        href="/teacher"
                        onClick={() => setMenuOpen(false)}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold text-white hover:bg-white/10 transition-colors"
                      >
                        <span className="grid h-8 w-8 place-items-center rounded-md bg-indigo-500/20 text-indigo-400">
                          <UsersRound className="h-4 w-4" />
                        </span>
                        <span className="flex-1 text-left">Studentenbeheer</span>
                      </Link>
                    </li>
                  )}
                  <li>
                    <Link
                      href="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold text-white hover:bg-white/10 transition-colors"
                    >
                      <span className="grid h-8 w-8 place-items-center rounded-md bg-fuchsia-500/20 text-fuchsia-400">
                        <UserCircle2 className="h-4 w-4" />
                      </span>
                      <span className="flex-1 text-left">
                        {showNlRef ? (
                          <Bilingual nl={nlSources.nav.menu.viewProfile} size="sm">
                            {t.nav.menu.viewProfile}
                          </Bilingual>
                        ) : (
                          t.nav.menu.viewProfile
                        )}
                      </span>
                    </Link>
                  </li>
                  <li>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={async () => {
                        setMenuOpen(false);
                        await signOut({ callbackUrl: "/login" });
                      }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <span className="grid h-8 w-8 place-items-center rounded-md bg-rose-500/20 text-rose-400">
                        <LogOut className="h-4 w-4" />
                      </span>
                      <span className="flex-1 text-left">
                        {showNlRef ? (
                          <Bilingual nl={nlSources.nav.menu.logOut} size="sm">
                            {t.nav.menu.logOut}
                          </Bilingual>
                        ) : (
                          t.nav.menu.logOut
                        )}
                      </span>
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export function TaalCozyFooter() {
  const { t, showNlRef } = useLocale();
  return (
    <footer className="tc-footer">
      <div className="mx-auto flex w-full max-w-[1200px] lg:max-w-[1360px] xl:max-w-[1480px] 2xl:max-w-[1680px] flex-col items-start justify-between gap-3 px-3 sm:px-4 md:px-5 lg:px-6 xl:px-7 2xl:px-8 sm:flex-row sm:items-center">
        <div className="text-xs font-semibold text-white/50">
          {showNlRef ? (
            <Bilingual nl={nlSources.footer.copyright} size="sm">
              {t.footer.copyright}
            </Bilingual>
          ) : (
            t.footer.copyright
          )}
        </div>
        <div className="flex items-center gap-5 text-xs font-bold text-white/70">
          <Link
            href="/lessons"
            className="hover:text-white transition-colors"
          >
            {showNlRef ? (
              <Bilingual nl={nlSources.footer.glossary} size="sm" variant="inline">
                {t.footer.glossary}
              </Bilingual>
            ) : (
              t.footer.glossary
            )}
          </Link>
          <Link
            href="/chat"
            className="hover:text-white transition-colors"
          >
            {showNlRef ? (
              <Bilingual nl={nlSources.footer.help} size="sm" variant="inline">
                {t.footer.help}
              </Bilingual>
            ) : (
              t.footer.help
            )}
          </Link>
        </div>
      </div>
    </footer>
  );
}
