import Link from "next/link";
import { ArrowLeft, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardNotFound() {
  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center px-4 py-12">
      <div className="flex w-full max-w-xl flex-col items-center gap-6 text-center">
        <p className="text-6xl font-black tracking-tight text-primary">404</p>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold sm:text-3xl">
            Pagina in dashboard niet gevonden
          </h1>
          <p className="text-muted-foreground">
            Deze link bestaat niet meer. Ga terug naar je dashboard om verder te
            leren.
          </p>
        </div>
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <Button asChild>
            <Link href="/dashboard">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Naar dashboard
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/lessons">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Lessen bekijken
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
