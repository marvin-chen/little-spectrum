import { notFound } from "next/navigation";
import { Clock, Pencil, Plus, Users } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Group, Row, RowLink, SectionLabel } from "@/components/ui/Card";
import { PageTitle } from "@/components/ui/PageTitle";
import { requireUser } from "@/lib/auth";
import { getGardenContext, listGardens } from "@/lib/data/gardens";
import { getSiteUrl } from "@/lib/supabase/env";
import { themeFor } from "@/lib/themes";
import { AccountSection } from "./AccountSection";
import { InviteCardEditor } from "./InviteCardEditor";
import { ExpandGarden, InviteManager } from "./SettingsClient";

export const metadata = { title: "Settings" };

export default async function SettingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ gardenId: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { gardenId } = await params;
  const query = await searchParams;
  const user = await requireUser(`/g/${gardenId}/settings`);
  const garden = await getGardenContext(gardenId, user.id);
  if (!garden) notFound();
  const gardens = await listGardens(user.id);
  const isCreator = garden.role === "creator";
  const inviteUrl = garden.inviteToken ? `${getSiteUrl()}/join/${garden.inviteToken}` : null;
  const full = garden.members.length >= garden.capacity;

  return (
    <>
      <PageTitle title="Settings" subtitle={garden.name} />

      <section className="mb-6">
        <SectionLabel>Invite friends</SectionLabel>
        <InviteManager
          gardenId={gardenId}
          inviteUrl={inviteUrl}
          isCreator={isCreator}
          full={full}
          spotsLeft={garden.capacity - garden.members.length}
        />
      </section>

      <section className="mb-6">
        <SectionLabel>Invite card</SectionLabel>
        <InviteCardEditor
          gardenId={gardenId}
          isCreator={isCreator}
          previewImageUrl={
            garden.inviteToken
              ? `/join/${garden.inviteToken}/opengraph-image?v=${new Date(garden.inviteCardUpdatedAt).getTime()}`
              : null
          }
          data={{
            gardenName: garden.name,
            theme: garden.theme,
            timezone: garden.timezone,
            creatorName: garden.members.find((m) => m.role === "creator")?.name ?? user.displayName,
            members: garden.members.map((m) => ({ id: m.userId, name: m.name, avatar: m.avatar })),
            capacity: garden.capacity,
            card: garden.inviteCard,
          }}
        />
      </section>

      <section className="mb-6">
        <SectionLabel
          action={
            <Badge>
              {garden.members.length} of {garden.capacity}
            </Badge>
          }
        >
          Members
        </SectionLabel>
        <Group>
          {garden.members.map((m) => (
            <Row
              key={m.userId}
              icon={<Avatar avatar={m.avatar} name={m.name} size="sm" />}
              label={m.userId === user.id ? `${m.name} (you)` : m.name}
              detail={
                m.role === "creator"
                  ? "Planted this garden"
                  : `Joined ${new Date(m.joinedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
              }
            />
          ))}
        </Group>
        {garden.capacity === 2 && isCreator ? <ExpandGarden gardenId={gardenId} /> : null}
      </section>

      <section className="mb-6">
        <SectionLabel>Garden</SectionLabel>
        <Group>
          <Row
            icon={<Users className="size-5 text-ink-2" aria-hidden />}
            label="Size"
            trailing={garden.capacity === 2 ? "Just us two" : "A group of friends"}
          />
          <Row
            icon={
              <span
                className="size-5 rounded-full"
                style={{ background: themeFor(garden.theme).hillFront }}
                aria-hidden
              />
            }
            label="Theme"
            trailing={themeFor(garden.theme).name}
          />
          <Row
            icon={<Clock className="size-5 text-ink-2" aria-hidden />}
            label="Week resets"
            detail="Mondays, in the creator's timezone"
            trailing={garden.timezone.split("/").pop()?.replace(/_/g, " ")}
          />
        </Group>
      </section>

      <section className="mb-6">
        <SectionLabel>You</SectionLabel>
        <Group>
          <RowLink
            href={`/welcome?edit=1&next=${encodeURIComponent(`/g/${gardenId}/settings`)}`}
            icon={<Avatar avatar={user.avatar} name={user.displayName} size="sm" />}
            label={user.displayName}
            detail="Change your name or avatar"
          />
        </Group>
      </section>

      <section className="mb-6">
        <SectionLabel>Account</SectionLabel>
        <AccountSection
          gardenId={gardenId}
          email={user.email}
          isAnonymous={user.isAnonymous}
          justKept={query.kept === "1"}
        />
      </section>

      <section className="mb-6">
        <SectionLabel>Your gardens</SectionLabel>
        <Group>
          {gardens.map((g) => (
            <RowLink
              key={g.id}
              href={`/g/${g.id}`}
              icon={<Pencil className="size-4 text-ink-2" aria-hidden />}
              label={g.name}
              detail={`${g.memberCount} of ${g.capacity}`}
              trailing={g.id === gardenId ? "Current" : undefined}
            />
          ))}
          <RowLink
            href="/start"
            icon={<Plus className="size-5 text-ink-2" aria-hidden />}
            label="Plant another garden"
          />
        </Group>
      </section>
    </>
  );
}
