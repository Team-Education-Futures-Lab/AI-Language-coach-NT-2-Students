"use client";

import Link from "next/link";
import { Menu, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { CozyLogo } from "@/components/illustrations/cozy-logo";

interface NavLink {
  href: string;
  label: string;
}

const links: NavLink[] = [
  { href: "/#features", label: "Functies" },
  { href: "/#faq", label: "FAQ" },
];

export function SiteHeader({ className }: { className?: string }) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b border-cozy-sand/40 bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/50",
        className,
      )}
    >
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="outline-none">
          <CozyLogo />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-semibold text-cozy-ink/70 transition-colors hover:text-cozy-ink"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="rounded-full text-cozy-ink/80 hover:bg-cozy-sand/30 hover:text-cozy-ink"
          >
            <Link href="/login">Inloggen</Link>
          </Button>
          <Button
            asChild
            size="sm"
            className="rounded-full shadow-soft bg-gradient-to-r from-cozy-terracotta to-cozy-orange text-white hover:brightness-105"
          >
            <Link href="/register">Gratis account</Link>
          </Button>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden rounded-full text-cozy-ink hover:bg-cozy-sand/30" aria-label="Menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="border-cozy-sand/40 bg-[#FFFBF2]">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-cozy-terracotta" />
                Menu
              </SheetTitle>
            </SheetHeader>
            <nav className="mt-8 flex flex-col gap-4">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-base font-semibold text-cozy-ink/85 hover:text-cozy-terracotta"
                >
                  {l.label}
                </Link>
              ))}
              <div className="mt-6 space-y-2">
                <Button asChild variant="outline" className="w-full rounded-full border-cozy-teal/30 text-cozy-ink">
                  <Link href="/login">Inloggen</Link>
                </Button>
                <Button asChild className="w-full rounded-full bg-gradient-to-r from-cozy-terracotta to-cozy-orange text-white">
                  <Link href="/register">Gratis account</Link>
                </Button>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
