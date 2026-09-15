"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  BookOpen,
  Dumbbell,
  MessageCircle,
  LineChart,
  User,
  Settings,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CozyLogo } from "@/components/illustrations/cozy-logo";

interface DashboardNavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

const navItems: DashboardNavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Lessen", href: "/lessons", icon: BookOpen },
  { title: "Oefenen", href: "/practice", icon: Dumbbell },
  { title: "Chat met AI", href: "/chat", icon: MessageCircle },
  { title: "Voortgang", href: "/progress", icon: LineChart },
  { title: "Profiel", href: "/profile", icon: User },
  { title: "Instellingen", href: "/settings", icon: Settings },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden border-r border-cozy-sand/40 bg-gradient-to-b from-cozy-sand/20 via-card to-card lg:block lg:w-64 xl:w-72">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center gap-2 border-b border-cozy-sand/40 px-5">
          <CozyLogo size="sm" glow={false} />
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          <div className="mb-2 px-2 pt-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-cozy-ink/60">
            <Sparkles className="h-3.5 w-3.5 text-cozy-terracotta" />
            Leeromgeving
          </div>
          <ul className="space-y-1 mt-1">
            {navItems.map((item) => {
              const active =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Button
                    asChild
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-3 px-3 h-10 rounded-2xl text-sm",
                      active
                        ? "bg-gradient-to-r from-cozy-orange/22 via-cozy-sand/30 to-transparent text-cozy-ink ring-1 ring-cozy-orange/30 shadow-soft"
                        : "hover:bg-cozy-sand/20 text-cozy-ink/85",
                    )}
                  >
                    <Link href={item.href}>
                      <item.icon
                        className={cn(
                          "h-5 w-5",
                          active ? "text-cozy-terracotta" : "text-cozy-teal"
                        )}
                      />
                      <span className="font-semibold">{item.title}</span>
                    </Link>
                  </Button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-cozy-sand/40 p-4">
          <div className="cozy-card !rounded-2xl p-4">
            <div className="flex items-start gap-3 pt-1">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-cozy-sand/60 text-cozy-ink">
                <Sparkles className="h-5 w-5 text-cozy-terracotta" />
              </div>
              <div className="space-y-1">
                <p className="font-display text-sm font-bold text-cozy-ink leading-tight">
                  Vandaag
                </p>
                <p className="text-xs leading-snug text-cozy-ink/75">
                  5 minuten oefenen = 1 XP meer. Je kunt het!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export function DashboardSidebarMobile() {
  return navItems;
}
