"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Menu, LogOut, Sparkles, User as UserIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DashboardSidebarMobile,
  DashboardSidebar,
} from "@/components/layouts/dashboard-sidebar";
import { signOut } from "next-auth/react";

interface DashboardTopbarProps {
  userName?: string | null;
  userEmail?: string | null;
  userImage?: string | null;
}

function getInitials(name?: string | null) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("");
}

export function DashboardTopbar({
  userName,
  userEmail,
  userImage,
}: DashboardTopbarProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const items = DashboardSidebarMobile();

  function handleSignOut() {
    startTransition(async () => {
      await signOut({ redirect: false });
      router.push("/login");
      router.refresh();
    });
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-white/10 bg-black/40 backdrop-blur-2xl px-4 lg:px-6">
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Menu openen" className="text-white hover:bg-white/10">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col p-0 border-white/10 bg-black/90 backdrop-blur-xl text-white">
            <SheetHeader className="border-b border-white/10 px-6 py-4">
              <SheetTitle className="flex items-center gap-2 text-white">
                <Sparkles className="h-5 w-5 text-fuchsia-400" />
                Navigatie
              </SheetTitle>
            </SheetHeader>
            <nav className="flex-1 p-3">
              <ul className="space-y-1">
                {items.map((item) => (
                  <li key={item.href}>
                    <Button
                      asChild
                      variant="ghost"
                      className="w-full justify-start gap-3 px-3 text-white/80 hover:text-white hover:bg-white/10"
                    >
                      <Link href={item.href}>
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </Link>
                    </Button>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="border-t border-white/10 p-3">
              <Button
                variant="outline"
                className="w-full justify-start gap-3 border-white/20 text-white hover:bg-white/10"
                onClick={handleSignOut}
                disabled={isPending}
              >
                <LogOut className="h-4 w-4" />
                Uitloggen
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="mr-auto flex items-center gap-2 lg:hidden">
        <span className="grid h-8 w-8 place-items-center rounded-md bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white">
          <Sparkles className="h-4 w-4" />
        </span>
        <span className="font-semibold text-white">
          Taalcoach<span className="text-fuchsia-400">AI</span>
        </span>
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-4">
        <div className="hidden items-center gap-3 sm:flex">
          <div className="text-right leading-tight">
            <div className="text-sm font-medium text-white">
              {userName ?? "Gebruiker"}
            </div>
            <div className="text-xs text-white/60">
              {userEmail ?? ""}
            </div>
          </div>
          <Avatar className="ring-2 ring-white/20">
            {userImage ? <AvatarImage src={userImage} alt={userName ?? ""} /> : null}
            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-sm font-semibold text-white">
              {getInitials(userName) || <UserIcon className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="hidden lg:block">
          <Button
            variant="outline"
            size="sm"
            className="border-white/20 text-white hover:bg-white/10"
            onClick={handleSignOut}
            disabled={isPending}
          >
            <LogOut className="mr-1 h-4 w-4" />
            Uitloggen
          </Button>
        </div>
      </div>

      {/* Dit triggert SSR-friendly sidebar import op desktop */}
      <span className="hidden">
        <DashboardSidebar />
      </span>
    </header>
  );
}
