"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_SECTOR,
  SECTORS,
  SECTOR_COOKIE,
  type Sector,
  type SectorCode,
} from "./types";

type Ctx = {
  sector: Sector;
  sectorCode: SectorCode;
  setSectorCode: (code: SectorCode) => void;
  sectors: Sector[];
};

const SectorContext = createContext<Ctx | null>(null);

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365 * 2;

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  if (!match) return null;
  try {
    return decodeURIComponent(match.slice(name.length + 1));
  } catch {
    return null;
  }
}

function writeCookie(name: string, value: string, maxAgeSeconds: number) {
  if (typeof document === "undefined") return;
  const encoded = encodeURIComponent(value);
  document.cookie =
    `${name}=${encoded}; path=/; SameSite=Lax; max-age=${maxAgeSeconds}` +
    (typeof location !== "undefined" && location.protocol === "https:"
      ? "; Secure"
      : "");
}

export function SectorProvider({
  children,
  initialSector,
}: {
  children: ReactNode;
  initialSector?: SectorCode;
}) {
  const [sectorCode, setSectorCodeState] = useState<SectorCode>(
    initialSector ?? DEFAULT_SECTOR,
  );

  useEffect(() => {
    if (initialSector) return;
    const saved = readCookie(SECTOR_COOKIE) as SectorCode | null;
    if (saved && SECTORS.some((s) => s.code === saved)) {
      setSectorCodeState(saved);
    }
  }, [initialSector]);

  useEffect(() => {
    if (initialSector) setSectorCodeState(initialSector);
  }, [initialSector]);

  const setSectorCode = useCallback((code: SectorCode) => {
    setSectorCodeState(code);
    writeCookie(SECTOR_COOKIE, code, COOKIE_MAX_AGE);
  }, []);

  const sector = useMemo<Sector>(
    () => SECTORS.find((s) => s.code === sectorCode) ?? SECTORS[0],
    [sectorCode],
  );

  return (
    <SectorContext.Provider
      value={{ sector, sectorCode, setSectorCode, sectors: SECTORS }}
    >
      {children}
    </SectorContext.Provider>
  );
}

export function useSector() {
  const ctx = useContext(SectorContext);
  if (!ctx) {
    return {
      sector: SECTORS[0],
      sectorCode: DEFAULT_SECTOR as SectorCode,
      setSectorCode: () => {},
      sectors: SECTORS,
    };
  }
  return ctx;
}
