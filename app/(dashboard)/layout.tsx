import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/auth";
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

  const streakDays = user.profile?.level
    ? Math.max(1, Math.min(7, 3 + Math.round((user.profile.level ?? 1) / 2)))
    : 7;
  const totalXP = user.profile?.totalXp ?? 1450;
  const erkLevel = user.profile?.languageLevel ?? "B1";

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
    <div className="relative flex min-h-dvh flex-col">
      <LocaleProvider initialLocale={initialLocale}>
        <SectorProvider initialSector={initialSector}>
          <TaalCozyNav
            userName={user.name}
            userEmail={user.email}
            userImage={user.image}
            streakDays={streakDays}
            xp={totalXP}
            erkLevel={erkLevel}
          />
          <main className="relative flex-1">
            <div className="mx-auto w-full max-w-[1200px] lg:max-w-[1360px] xl:max-w-[1480px] 2xl:max-w-[1680px] px-3 sm:px-4 md:px-5 lg:px-6 xl:px-7 2xl:px-8 py-5 sm:py-6 lg:py-8">
              {children}
            </div>
          </main>
          <TaalCozyFooter />
          <Toaster position="top-right" richColors closeButton />
        </SectorProvider>
      </LocaleProvider>
    </div>
  );
}
