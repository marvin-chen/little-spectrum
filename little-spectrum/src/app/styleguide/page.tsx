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
        subtitle="Shared components, interactive examples, and contributor guidance."
      />
      <StyleguideClient />
    </AppShell>
  );
}
