import Link from "next/link";
import { HomeIcon, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalNotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12">
      <div className="flex w-full max-w-xl flex-col items-center gap-6 text-center">
        <p className="text-6xl font-black tracking-tight text-primary">404</p>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold sm:text-3xl">
            Deze pagina bestaat niet
          </h1>
          <p className="text-muted-foreground">
            De pagina die je zoekt is verwijderd, hernoemd of is nog nooit
            aangemaakt.
          </p>
        </div>
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <Button asChild>
            <Link href="/">
              <HomeIcon className="mr-2 h-4 w-4" />
              Naar de homepage
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Naar mijn dashboard
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
