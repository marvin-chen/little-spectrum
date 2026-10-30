import { redirect } from "next/navigation";
import { PlainShell } from "@/components/shell/AppShell";
import { Wordmark } from "@/components/shell/Brand";
import { AvatarStack } from "@/components/ui/Avatar";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getCurrentUser } from "@/lib/auth";
import { getInviteInfo, listGardens } from "@/lib/data/gardens";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { themeFor } from "@/lib/themes";
import { JoinForm } from "./JoinForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "You're invited" };

export default async function JoinPage({ params }: { params: Promise<{ token: string }> }) {
  if (!isSupabaseConfigured()) redirect("/");
  const { token } = await params;
  const [info, user] = await Promise.all([getInviteInfo(token), getCurrentUser()]);

  if (info.status === "invalid") {
    return (
      <PlainShell narrow>
        <div className="flex flex-1 flex-col justify-center gap-6 py-8">
          <Wordmark />
          <div>
            <h1 className="font-display text-title-1 font-bold">This link has wilted</h1>
            <p className="mt-2 text-callout text-ink-2">
              The invitation is no longer valid. Links can be paused or replaced by whoever made the garden,
              so ask them for a fresh one.
            </p>
          </div>
          <ButtonLink href="/" variant="secondary" full>
            Go home
          </ButtonLink>
        </div>
      </PlainShell>
    );
  }

  if (user) {
    const gardens = await listGardens(user.id);
    if (gardens.some((g) => g.id === info.gardenId)) redirect(`/g/${info.gardenId}`);
  }

  const theme = themeFor(info.theme);
  const spotsLeft = info.capacity - info.memberCount;

  return (
    <PlainShell narrow>
      <div className="flex flex-1 flex-col justify-center gap-6 py-8">
        <Wordmark />
        <Card className="overflow-hidden">
          <div
            aria-hidden
            className="h-28"
            style={{ background: `linear-gradient(180deg, ${theme.skyTop} 0%, ${theme.skyBottom} 55%, ${theme.hillFront} 56%, ${theme.ground} 100%)` }}
          />
          <div className="p-5">
            <p className="text-footnote font-semibold uppercase tracking-[0.06em] text-ink-3">You&apos;re invited to</p>
            <h1 className="mt-1 font-display text-title-1 font-bold">{info.gardenName}</h1>
            <div className="mt-3 flex items-center gap-3">
              <AvatarStack people={info.members} />
              <p className="text-callout text-ink-2">
                {info.members.map((m) => m.name).join(", ")}
                {info.members.length > 0 ? " · " : ""}
                {info.status === "full" ? "Full" : `${spotsLeft} ${spotsLeft === 1 ? "spot" : "spots"} left`}
              </p>
            </div>
          </div>
        </Card>

        {info.status === "full" ? (
          <div className="flex flex-col gap-3">
            <p role="status" className="rounded-row bg-amber-soft px-4 py-3 text-callout text-amber-ink">
              This garden is full. The creator can make room for more friends, or you can plant your own.
            </p>
            <ButtonLink href={user ? "/start" : "/welcome?next=%2Fstart"} variant="secondary" full>
              Start your own garden
            </ButtonLink>
          </div>
        ) : user ? (
          <JoinForm token={token} gardenName={info.gardenName} />
        ) : (
          <div className="flex flex-col gap-3">
            <ButtonLink href={`/welcome?next=${encodeURIComponent(`/join/${token}`)}`} size="lg" full>
              Pick a name to join
            </ButtonLink>
            <p className="text-center text-footnote text-ink-3">No email needed. Takes ten seconds.</p>
          </div>
        )}
      </div>
    </PlainShell>
  );
}
