import { ButtonLink } from "@/components/ui/Button";
import { PlainShell } from "@/components/shell/AppShell";
import { Wordmark } from "@/components/shell/Brand";

export default function LandingPage() {
  return (
    <PlainShell narrow>
      <div className="flex flex-1 flex-col justify-center gap-8 py-10">
        <Wordmark />
        <div>
          <h1 className="font-display text-title-1 font-bold text-ink">A little color. A little closer.</h1>
          <p className="mt-3 text-body text-ink-2">
            A private place for far-apart friends to play short games, swap moments from the day, and grow a
            garden together.
          </p>
        </div>
        <ButtonLink href="/styleguide" size="lg">
          See the style guide
        </ButtonLink>
      </div>
    </PlainShell>
  );
}
