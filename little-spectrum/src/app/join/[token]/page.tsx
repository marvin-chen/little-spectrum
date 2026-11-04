import { redirect } from "next/navigation";
import { PlainShell } from "@/components/shell/AppShell";
import { Wordmark } from "@/components/shell/Brand";
import { ButtonLink } from "@/components/ui/Button";
import { getCurrentUser } from "@/lib/auth";
import { getInviteInfo, listGardens } from "@/lib/data/gardens";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { themeFor } from "@/lib/themes";
import { InviteCardView } from "@/components/invite/InviteCardView";
import { getSiteUrl } from "@/lib/supabase/env";
import { JoinForm } from "./JoinForm";

export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ token: string }> }) {
  if (!isSupabaseConfigured()) return { title: "You're invited" };
  const { token } = await params;
  const info = await getInviteInfo(token);
  if (info.status === "invalid") return { title: "This invite has wilted" };
  const image = `${getSiteUrl()}/join/${token}/opengraph-image?v=${info.cardVersion}`;
  const description = info.card.note || `Join ${info.creatorName} and friends in ${info.gardenName} on Little Spectrum.`;
  return {
    title: `${info.card.headline} · ${info.gardenName}`,
    description,
    openGraph: { title: info.card.headline, description, siteName: "Little Spectrum", images: [{ url: image, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title: info.card.headline, description, images: [image] },
  };
}

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
          <ButtonLink href="/" variant="glass" full>
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

  return (
    <PlainShell narrow>
      <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[40vh]" style={{ background: `linear-gradient(180deg, ${theme.skyTop} 0%, transparent 100%)` }} />
      <div className="flex flex-1 flex-col justify-center gap-6 py-8">
        <Wordmark />
        <h1 className="sr-only">{info.card.headline}</h1>
        <div className="anim-pop">
          <InviteCardView
            data={{
              gardenName: info.gardenName,
              theme: info.theme,
              timezone: info.timezone,
              creatorName: info.creatorName,
              members: info.members,
              capacity: info.capacity,
              card: info.card,
            }}
          />
        </div>

        {info.status === "full" ? (
          <div className="flex flex-col gap-3">
            <p role="status" className="rounded-row bg-amber-soft px-4 py-3 text-callout text-amber-ink">
              This garden is full. The creator can make room for more friends, or you can plant your own.
            </p>
            <ButtonLink href={user ? "/start" : "/welcome?next=%2Fstart"} variant="glass" full>
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
