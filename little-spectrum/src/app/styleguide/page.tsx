import { AppShell } from "@/components/shell/AppShell";
import { PageTitle } from "@/components/ui/PageTitle";
import { StyleguideClient } from "./StyleguideClient";

export const metadata = { title: "Style guide" };

export default function StyleguidePage() {
  return (
    <AppShell base="/styleguide">
      <PageTitle
        eyebrow="Design system"
        title="Style guide"
        subtitle="Tokens and shared components used across Little Spectrum."
      />
      <StyleguideClient />
    </AppShell>
  );
}
