import Link from "next/link";
import { redirect } from "next/navigation";
import { PlainShell } from "@/components/shell/AppShell";
import { Wordmark } from "@/components/shell/Brand";
import { getCurrentUser } from "@/lib/auth";
import { safeNextPath } from "@/lib/paths";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { randomAvatar } from "@/lib/avatars";
import { ProfileForm } from "./ProfileForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Welcome" };

export default async function WelcomePage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  if (!isSupabaseConfigured()) redirect("/");
  const params = await searchParams;
  const next = safeNextPath(params.next, "/start");
  const editing = params.edit === "1";
  const user = await getCurrentUser();
  if (user && !editing) redirect(next);

  return (
    <PlainShell narrow>
      <div className="flex flex-1 flex-col gap-6 py-4">
        <Wordmark />
        <div>
          <h1 className="font-display text-title-1 font-bold text-ink">
            {editing ? "Update your look" : "Who's playing?"}
          </h1>
          <p className="mt-2 text-callout text-ink-2">
            {editing
              ? "Change the name and avatar your friends see."
              : "Pick a name and an avatar. Your friends will see these in the garden."}
          </p>
        </div>
        <ProfileForm
          next={next}
          initialName={user?.displayName ?? ""}
          initialAvatar={user?.avatar ?? randomAvatar()}
          submitLabel={editing ? "Save changes" : "Continue"}
        />
        {!editing ? (
          <p className="text-footnote text-ink-3">
            No email or password to start. Your guest account belongs to this browser until you keep it with an email in
            Settings.{" "}
            <Link href={`/signin?next=${encodeURIComponent(next)}`} className="font-semibold text-tint">
              Already kept one? Sign in
            </Link>
          </p>
        ) : null}
      </div>
    </PlainShell>
  );
}
