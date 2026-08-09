"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App boundary error caught:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center p-4 max-w-md mx-auto">
      <div className="p-3 rounded-full bg-destructive/10 text-destructive mb-4">
        <AlertTriangle className="h-8 w-8" />
      </div>
      <h2 className="text-2xl font-bold tracking-tight mb-2">Something went wrong</h2>
      <p className="text-sm text-muted-foreground mb-6">
        An unexpected error occurred while loading this section. You can try refreshing or returning to the dashboard.
      </p>
      <div className="flex gap-3">
        <Button onClick={() => reset()} variant="default">
          <RefreshCw className="mr-2 h-4 w-4" /> Try Again
        </Button>
        <Link href="/dashboard">
          <Button variant="outline">
            <Home className="mr-2 h-4 w-4" /> Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
