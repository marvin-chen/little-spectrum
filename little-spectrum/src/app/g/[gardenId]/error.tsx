"use client";

import { useEffect } from "react";
import { CloudOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function GardenError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  const unreachable = error.name === "BackendUnavailableError" || /fetch|network|unavailable/i.test(error.message);
  return (
    <Card className="mt-6 p-5">
      <CloudOff className="size-8 text-ink-3" aria-hidden />
      <h1 className="mt-3 font-display text-title-2 font-bold">
        {unreachable ? "The garden is out of reach" : "Something went sideways"}
      </h1>
      <p className="mt-2 text-callout text-ink-2">
        {unreachable
          ? "We could not reach the backend right now. Paused projects take about a minute to wake up. Nothing is lost."
          : "An unexpected error happened. Trying again usually fixes it."}
      </p>
      <Button className="mt-5" size="lg" full onClick={reset} icon={<RefreshCw className="size-4" aria-hidden />}>
        Try again
      </Button>
    </Card>
  );
}
