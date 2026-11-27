import Link from "next/link";
import { redirect } from "next/navigation";
import { PlainShell } from "@/components/shell/AppShell";
import { Wordmark } from "@/components/shell/Brand";
import { getCurrentUser } from "@/lib/auth";
import { safeNextPath } from "@/lib/paths";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { SignInForm } from "./SignInForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sign in" };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  if (!isSupabaseConfigured()) redirect("/");
  const params = await searchParams;
  const next = safeNextPath(params.next, "/");
  const user = await getCurrentUser();
  if (user && !user.isAnonymous) redirect(next);

  return (
    <PlainShell narrow>
      <div className="flex flex-1 flex-col gap-6 py-4">
        <Wordmark />
        <div className="anim-rise">
          <h1 className="font-display text-large-title font-bold text-ink">Welcome back</h1>
          <p className="mt-2 text-callout text-ink-2">
            Enter the email you attached to your account and we will send a sign-in link. Your gardens come with it.
          </p>
        </div>
        <SignInForm
          next={next}
          initialError={
            params.error === "link" ? "That link has expired or was already used. Request a new one." : undefined
          }
        />
        <p className="text-footnote text-ink-3">
          New here?{" "}
          <Link href="/welcome" className="font-semibold text-tint">
            Start as a guest
          </Link>
          , no email needed.
        </p>
      </div>
    </PlainShell>
  );
}
