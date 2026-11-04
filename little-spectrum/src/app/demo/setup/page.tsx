import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageTitle } from "@/components/ui/PageTitle";

export const metadata = { title: "Enable real multiplayer" };

const STEPS: Array<{ title: string; body: ReactNode }> = [
  {
    title: "Create a free Supabase project",
    body: (
      <>
        Sign up at supabase.com and create a project on the Free plan. Any region works, but pick one near your
        friends.
      </>
    ),
  },
  {
    title: "Enable anonymous sign-ins",
    body: (
      <>
        In the Supabase dashboard open <strong>Authentication</strong>, then <strong>Sign In / Providers</strong>, and
        switch on <strong>Anonymous</strong>. Little Spectrum uses guest accounts, so nobody needs an email.
      </>
    ),
  },
  {
    title: "Apply the database migrations",
    body: (
      <>
        From the project directory run <code>pnpm supabase link</code> followed by <code>pnpm supabase db push</code>.
        If you would rather skip the CLI, paste the SQL from <code>supabase/migrations</code> into the SQL editor in
        the dashboard.
      </>
    ),
  },
  {
    title: "Add your keys locally",
    body: (
      <>
        Copy <code>.env.example</code> to <code>.env.local</code> and fill in <code>NEXT_PUBLIC_SUPABASE_URL</code>,{" "}
        <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code>, and <code>SUPABASE_SECRET_KEY</code> from the project&apos;s
        API settings. Restart the dev server and the demo banner disappears.
      </>
    ),
  },
  {
    title: "Deploy to Vercel",
    body: (
      <>
        Import the repository into Vercel on the Hobby plan, set <strong>Root Directory</strong> to{" "}
        <code>little-spectrum</code>, and add the same three environment variables. Every push to main becomes a
        deploy.
      </>
    ),
  },
];

export default function DemoSetupPage() {
  return (
    <>
      <PageTitle
        title="Enable real multiplayer"
        subtitle="Five steps, zero dollars. Afterwards your friends can join from a link and the garden starts growing for real."
      />
      <ol className="flex flex-col gap-3">
        {STEPS.map((step, i) => (
          <li key={step.title}>
            <Card className="flex gap-3 p-4">
              <span
                className="flex size-7 shrink-0 items-center justify-center rounded-full bg-amber-soft text-footnote font-bold text-amber-ink"
                aria-hidden
              >
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-body font-semibold text-ink">{step.title}</p>
                <p className="mt-1 text-footnote text-ink-2 [&_code]:whitespace-nowrap [&_code]:rounded-md [&_code]:bg-fill [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.8em] [&_code]:text-ink">
                  {step.body}
                </p>
              </div>
            </Card>
          </li>
        ))}
      </ol>

      <section className="mt-6">
        <h2 className="mb-2 px-1 text-footnote font-semibold uppercase tracking-[0.06em] text-ink-3">About the free plans</h2>
        <Card className="p-4">
          <p className="text-footnote text-ink-2">
            Supabase Free pauses a project after about a week without traffic. Open the dashboard and press restore
            and it comes back with everything intact. It also includes 500 MB of database space and 1 GB of file
            storage, which is plenty for a group of friends and their photos. Vercel Hobby is free for personal,
            non-commercial use, which is exactly what this is.
          </p>
        </Card>
      </section>

      <div className="mt-6">
        <ButtonLink href="/demo" variant="glass" full icon={<ArrowLeft className="size-4" aria-hidden />}>
          Back to the demo garden
        </ButtonLink>
      </div>
    </>
  );
}
