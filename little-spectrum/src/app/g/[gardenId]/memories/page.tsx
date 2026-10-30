import { notFound } from "next/navigation";
import { BookHeart } from "lucide-react";
import { SessionCardRow } from "@/components/session/SessionCardRow";
import { Card, Group } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageTitle } from "@/components/ui/PageTitle";
import { requireUser } from "@/lib/auth";
import { getGardenContext } from "@/lib/data/gardens";
import { listSessionCards } from "@/lib/data/sessions";

export const metadata = { title: "Memories" };

export default async function MemoriesPage({ params }: { params: Promise<{ gardenId: string }> }) {
  const { gardenId } = await params;
  const user = await requireUser(`/g/${gardenId}/memories`);
  const garden = await getGardenContext(gardenId, user.id);
  if (!garden) notFound();
  const cards = (await listSessionCards(gardenId, user.id)).filter((c) => c.status === "revealed");

  return (
    <>
      <PageTitle title="Memories" subtitle="Every finished round you were part of." />
      {cards.length === 0 ? (
        <Card>
          <EmptyState icon={<BookHeart className="size-8" aria-hidden />} title="No memories yet" body="Finished rounds land here, with answers, photos, and scores." />
        </Card>
      ) : (
        <Group>
          {cards.map((card) => (
            <SessionCardRow key={card.id} card={card} gardenId={gardenId} />
          ))}
        </Group>
      )}
    </>
  );
}
