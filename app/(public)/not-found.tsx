import Link from "next/link";
import { HomeIcon, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PublicNotFound() {
  return (
    <main className="flex min-h-[60vh] w-full items-center justify-center px-4 py-12">
      <div className="flex w-full max-w-xl flex-col items-center gap-6 text-center">
        <p className="text-6xl font-black tracking-tight text-primary">404</p>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold sm:text-3xl">Pagina niet gevonden</h1>
          <p className="text-muted-foreground">
            De pagina die je zocht bestaat niet. Keer terug naar de startpagina
            of maak een account.
          </p>
        </div>
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <Button asChild>
            <Link href="/">
              <HomeIcon className="mr-2 h-4 w-4" />
              Terug naar home
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/login">
              <LogIn className="mr-2 h-4 w-4" />
              Inloggen
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/register">
              <UserPlus className="mr-2 h-4 w-4" />
              Account aanmaken
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
