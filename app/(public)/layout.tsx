import type { ReactNode } from "react";
import { SiteHeader } from "@/components/layouts/site-header";
import { SiteFooter } from "@/components/layouts/site-footer";
import { Toaster } from "@/components/ui/sonner";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] h-[60%] w-[50%] rounded-full bg-indigo-600/20 blur-[140px]" />
        <div className="absolute top-[20%] -right-[10%] h-[60%] w-[50%] rounded-full bg-fuchsia-600/20 blur-[140px]" />
        <div className="absolute -bottom-[10%] left-[20%] h-[50%] w-[60%] rounded-full bg-blue-600/20 blur-[140px]" />
      </div>
      <div className="relative z-10 flex min-h-dvh flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </div>
      <Toaster position="top-center" richColors closeButton />
    </div>
  );
}
