import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Flower2, Images, Sparkles } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PlainShell } from "@/components/shell/AppShell";
import { Wordmark } from "@/components/shell/Brand";
import { getCurrentUser } from "@/lib/auth";
import { listGardens } from "@/lib/data/gardens";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  if (isSupabaseConfigured()) {
    const user = await getCurrentUser();
    if (user) {
      const gardens = await listGardens(user.id);
      if (gardens.length === 0) redirect("/start");
      const last = (await cookies()).get("ls_garden")?.value;
      const target = gardens.find((g) => g.id === last) ?? gardens[0];
      redirect(`/g/${target.id}`);
    }
  }
  const configured = isSupabaseConfigured();

  return (
    <PlainShell narrow>
      <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[46vh]" style={{ background: "linear-gradient(180deg, #dbeeff 0%, rgba(245,241,234,0) 100%)" }} />
      <div className="flex flex-1 flex-col justify-center gap-8 py-8">
        <Wordmark />
        <div className="anim-rise">
          <h1 className="font-display text-large-title font-bold text-ink">A little color. A little closer.</h1>
          <p className="mt-3 text-body text-ink-2">
            A private place for far-apart friends to play short games, swap moments from the day, and grow a
            garden together.
          </p>
        </div>
        <ul className="anim-rise grid gap-2" style={{ "--i": 1 } as React.CSSProperties}>
          {[
            { Icon: Sparkles, title: "Six short games", body: "Play on your own time. Reveal together." },
            { Icon: Flower2, title: "A garden that grows", body: "Three moments a week unlock something new." },
            { Icon: Images, title: "Private memories", body: "Only the people in a round can see it." },
          ].map(({ Icon, title, body }) => (
            <li key={title}>
              <Card className="flex items-center gap-3 p-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-control bg-amber-soft text-amber-ink">
                  <Icon className="size-5" aria-hidden />
                </span>
                <span>
                  <span className="block text-body font-semibold">{title}</span>
                  <span className="block text-footnote text-ink-2">{body}</span>
                </span>
              </Card>
            </li>
          ))}
        </ul>
        {configured ? (
          <div className="anim-rise flex flex-col gap-3" style={{ "--i": 2 } as React.CSSProperties}>
            <ButtonLink href="/welcome" size="lg" full>
              Get started
            </ButtonLink>
            <p className="text-center text-footnote text-ink-3">
              No email needed. Your guest account lives in this browser.
            </p>
            <Link href="/signin" className="text-center text-footnote font-semibold text-tint">
              Already kept an account? Sign in with email
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <ButtonLink href="/demo" size="lg" full>
              Explore the demo garden
            </ButtonLink>
            <Card className="p-4">
              <p className="text-callout font-semibold">Demo mode</p>
              <p className="mt-1 text-footnote text-ink-2">
                No backend is configured, so this copy runs as a read-only sample. Add Supabase keys to{" "}
                <code>.env.local</code> to play for real. The demo explains how.
              </p>
            </Card>
          </div>
        )}
      </div>
    </PlainShell>
  );
}
