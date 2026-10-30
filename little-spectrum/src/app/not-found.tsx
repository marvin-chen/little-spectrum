import { Sprout } from "lucide-react";
import { PlainShell } from "@/components/shell/AppShell";
import { Wordmark } from "@/components/shell/Brand";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function NotFound() {
  return (
    <PlainShell narrow>
      <div className="flex flex-1 flex-col justify-center gap-6 py-8">
        <Wordmark />
        <Card className="p-5">
          <Sprout className="size-8 text-ink-3" aria-hidden />
          <h1 className="mt-3 font-display text-title-2 font-bold">Nothing growing here</h1>
          <p className="mt-2 text-callout text-ink-2">That page does not exist, or it belongs to a round you are not part of.</p>
          <ButtonLink className="mt-5" href="/" size="lg" full>
            Go home
          </ButtonLink>
        </Card>
      </div>
    </PlainShell>
  );
}
