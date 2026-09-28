import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/auth";
import Link from "next/link";
import { db } from "@/lib/db/prisma";
import { TaalCozyFooter, TaalCozyNav } from "@/components/layouts/taalcozy-nav";
import { Toaster } from "@/components/ui/sonner";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
import { SectorProvider } from "@/lib/sector/SectorProvider";
import { LOCALE_COOKIE, type Locale } from "@/lib/i18n/types";
import { SECTOR_COOKIE, DEFAULT_SECTOR, SECTORS, type SectorCode } from "@/lib/sector/types";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const nextCookies = await cookies();
  const rawLocale = nextCookies.get(LOCALE_COOKIE)?.value as Locale | undefined;
  const rawSector = nextCookies.get(SECTOR_COOKIE)?.value as SectorCode | undefined;

  const streak = await db.streak.findUnique({ where: { userId: user.id } });
  const streakDays = streak?.currentStreak ?? 0;
  const totalXP = user.profile?.totalXp ?? 0;
  const erkLevel = user.profile?.languageLevel ?? "A1";

  let initialSector: SectorCode = DEFAULT_SECTOR;
  if (rawSector && SECTORS.some((s) => s.code === rawSector)) {
    initialSector = rawSector;
  } else {
    const profileSector = user.profile?.sector as SectorCode | undefined;
    if (profileSector && SECTORS.some((s) => s.code === profileSector)) {
      initialSector = profileSector;
    }
  }

  // Accepteer ELKE ISO 639-1 code: cookie eerst, dan Profile.uiLocale, dan default NL.
  // Voor talen zonder complete vertaling gebruikt getDictionary() automatisch Engels.
  let initialLocale: Locale = "nl";
  if (typeof rawLocale === "string" && rawLocale.length >= 2 && rawLocale.length <= 10) {
    initialLocale = rawLocale as Locale;
  } else {
    const profileLocale = user.profile?.uiLocale as Locale | undefined;
    if (typeof profileLocale === "string" && profileLocale.length >= 2 && profileLocale.length <= 10) {
      initialLocale = profileLocale as Locale;
    }
  }

  return (
    <div className="relative flex min-h-dvh flex-col pb-20 lg:pb-0 overflow-hidden">
      {/* Background glow effects */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] h-[60%] w-[50%] rounded-full bg-indigo-600/20 blur-[140px]" />
        <div className="absolute top-[20%] -right-[10%] h-[60%] w-[50%] rounded-full bg-fuchsia-600/20 blur-[140px]" />
        <div className="absolute -bottom-[10%] left-[20%] h-[50%] w-[60%] rounded-full bg-blue-600/20 blur-[140px]" />
      </div>

      <LocaleProvider initialLocale={initialLocale}>
        <SectorProvider initialSector={initialSector}>
          <TaalCozyNav
            userName={user.name}
            userEmail={user.email}
            userImage={user.image}
            streakDays={streakDays}
            xp={totalXP}
            erkLevel={erkLevel}
            role={user.role as "ADMIN" | "TEACHER" | "STUDENT"}
          />
          <main className="relative flex-1">
            <div className="mx-auto w-full max-w-[1200px] lg:max-w-[1360px] xl:max-w-[1480px] 2xl:max-w-[1680px] px-3 sm:px-4 md:px-5 lg:px-6 xl:px-7 2xl:px-8 py-5 sm:py-6 lg:py-8">
              {children}
            </div>
          </main>
          <TaalCozyFooter />
          <nav aria-label="Snel naar" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-white/10 bg-black/40 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-2xl lg:hidden">
            {[["/dashboard", "Home"], ["/missions", "Missions"], ["/chat", "Coach"], ["/progress", "Mijn groei"]].map(([href, label]) =>
              <Link key={href} href={href} className="grid min-h-16 place-items-center rounded-lg text-center text-xs font-semibold focus-visible:ring-2 focus-visible:ring-indigo-500 text-white/60 hover:text-white">{label}</Link>)}
          </nav>
          <Toaster position="top-right" richColors closeButton />
        </SectorProvider>
      </LocaleProvider>
    </div>
  );
}
