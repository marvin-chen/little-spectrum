"use client";

import { useEffect } from "react";
import { CloudOff, RefreshCw } from "lucide-react";
import { PlainShell } from "@/components/shell/AppShell";
import { Wordmark } from "@/components/shell/Brand";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

// Friendly retry state for a paused or unreachable backend. The route is preserved, nothing is replaced with demo data.
export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  const unreachable = error.name === "BackendUnavailableError" || /fetch|network|unavailable/i.test(error.message);
  return (
    <PlainShell narrow>
      <div className="flex flex-1 flex-col justify-center gap-6 py-8">
        <Wordmark />
        <Card className="p-5">
          <CloudOff className="size-8 text-ink-3" aria-hidden />
          <h1 className="mt-3 font-display text-title-2 font-bold">
            {unreachable ? "The garden is out of reach" : "Something went sideways"}
          </h1>
          <p className="mt-2 text-callout text-ink-2">
            {unreachable
              ? "We could not reach the backend. Free Supabase projects pause after a week without activity and take about a minute to wake up. Your data is safe."
              : "An unexpected error happened. Trying again usually fixes it."}
          </p>
          <Button className="mt-5" size="lg" full onClick={reset} icon={<RefreshCw className="size-4" aria-hidden />}>
            Try again
          </Button>
        </Card>
      </div>
    </PlainShell>
  );
}
