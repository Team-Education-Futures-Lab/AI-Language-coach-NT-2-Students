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
        "sticky top-0 z-40 w-full border-b border-white/10 bg-black/40 backdrop-blur-2xl supports-[backdrop-filter]:bg-black/20",
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
              className="text-sm font-semibold text-white/70 transition-colors hover:text-white"
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
            className="rounded-lg text-white/80 hover:bg-white/10 hover:text-white"
          >
            <Link href="/login">Inloggen</Link>
          </Button>
          <Button
            asChild
            size="sm"
            className="rounded-lg shadow-lg bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white hover:brightness-110"
          >
            <Link href="/register">Gratis account</Link>
          </Button>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden rounded-lg text-white hover:bg-white/10" aria-label="Menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="border-white/10 bg-black/90 backdrop-blur-xl text-white">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2 text-white">
                <BookOpen className="h-5 w-5 text-fuchsia-400" />
                Menu
              </SheetTitle>
            </SheetHeader>
            <nav className="mt-8 flex flex-col gap-4">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-base font-semibold text-white/80 hover:text-fuchsia-400"
                >
                  {l.label}
                </Link>
              ))}
              <div className="mt-6 space-y-2">
                <Button asChild variant="outline" className="w-full rounded-lg border-white/20 text-white hover:bg-white/10">
                  <Link href="/login">Inloggen</Link>
                </Button>
                <Button asChild className="w-full rounded-lg bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white shadow-lg hover:brightness-110">
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
