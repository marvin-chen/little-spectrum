import Link from "next/link";
import { ChevronRight, Users } from "lucide-react";
import { PlainShell } from "@/components/shell/AppShell";
import { Wordmark } from "@/components/shell/Brand";
import { Avatar } from "@/components/ui/Avatar";
import { Group, RowLink, SectionLabel } from "@/components/ui/Card";
import { requireUser } from "@/lib/auth";
import { listGardens } from "@/lib/data/gardens";
import { CreateGardenForm } from "./CreateGardenForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Start a garden" };

export default async function StartPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const user = await requireUser("/start");
  const params = await searchParams;
  const gardens = await listGardens(user.id);

  return (
    <PlainShell narrow>
      <div className="flex flex-1 flex-col gap-6 py-4">
        <div className="flex items-center justify-between">
          <Wordmark />
          <Link href="/welcome?edit=1&next=%2Fstart" className="pressable flex items-center gap-2 rounded-capsule py-1 pr-1 pl-3 text-callout font-semibold text-ink-2 hover:bg-fill">
            {user.displayName}
            <Avatar avatar={user.avatar} name={user.displayName} size="sm" />
          </Link>
        </div>

        {params.missing ? (
          <p role="status" className="rounded-row bg-amber-soft px-4 py-3 text-callout text-amber-ink">
            That garden is not one you are part of. Ask for a fresh invite link or start your own.
          </p>
        ) : null}

        {gardens.length > 0 ? (
          <section>
            <SectionLabel>Your gardens</SectionLabel>
            <Group>
              {gardens.map((g) => (
                <RowLink
                  key={g.id}
                  href={`/g/${g.id}`}
                  icon={<Users className="size-5 text-ink-2" aria-hidden />}
                  label={g.name}
                  detail={`${g.memberCount} of ${g.capacity} ${g.capacity === 2 ? "spots" : "friends"}`}
                />
              ))}
            </Group>
          </section>
        ) : null}

        <section>
          <h1 className="font-display text-title-1 font-bold text-ink">
            {gardens.length > 0 ? "Start another garden" : "Plant a garden"}
          </h1>
          <p className="mt-2 mb-5 text-callout text-ink-2">
            A garden is a private space for the people in it. You can invite friends with a link right after.
          </p>
          <CreateGardenForm />
        </section>

        <p className="flex items-center gap-1 text-footnote text-ink-3">
          Got an invite link? Just open it.
          <ChevronRight className="size-4" aria-hidden />
        </p>
      </div>
    </PlainShell>
  );
}
