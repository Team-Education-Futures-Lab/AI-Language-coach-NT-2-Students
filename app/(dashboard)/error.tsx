"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCcw } from "lucide-react";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardErrorBoundary({
  error,
  reset,
}: ErrorBoundaryProps) {
  useEffect(() => {
    console.error("Dashboard error boundary:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center px-4 py-12">
      <div className="flex w-full max-w-xl flex-col items-center gap-6 rounded-xl border bg-card p-8 text-center shadow-sm">
        <div className="grid h-14 w-14 place-items-center rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-300">
          <AlertCircle className="h-7 w-7" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold">Er ging iets mis</h2>
          <p className="text-sm text-muted-foreground">
            Deze pagina kon niet worden geladen. Controleer je internetverbinding
            en probeer het opnieuw.
          </p>
          {process.env.NODE_ENV === "development" && (
            <pre className="max-h-40 overflow-auto rounded-lg bg-muted p-3 text-left text-xs text-muted-foreground">
              {error.message}
            </pre>
          )}
        </div>
        <Button onClick={reset}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Probeer opnieuw
        </Button>
      </div>
    </div>
  );
}
