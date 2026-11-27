import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import type { SessionView } from "@/lib/games/sessionView";
import type { ColorQuestView } from "@/lib/games/colorQuest";
import { PhotoFigure } from "./PhotoFigure";

export function ColorQuestReveal({
  session,
  game,
  userId,
  compact,
}: {
  session: Pick<SessionView, "participants">;
  game: ColorQuestView;
  userId: string;
  compact?: boolean;
}) {
  const nameOf = (id: string) => session.participants.find((p) => p.userId === id)?.name ?? "Someone";
  const avatarOf = (id: string) => session.participants.find((p) => p.userId === id)?.avatar ?? "sun:amber";
  const gallery = game.gallery ?? [];
  return (
    <div className={cn("flex flex-col", compact ? "gap-3" : "gap-4")}>
      {!compact ? (
        <Card className="p-5">
          <p className="text-footnote font-semibold uppercase tracking-[0.06em] text-ink-3">The prompt</p>
          <p className="mt-1 font-display text-title-2 font-bold">{game.prompt}</p>
        </Card>
      ) : null}
      <ul className={cn("grid gap-3", compact ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-2")}>
        {gallery.map((photo) => (
          <li
            key={photo.photoId}
            className={cn(
              "overflow-hidden rounded-card bg-surface shadow-card ring-1 ring-line",
              compact ? "p-2" : "p-3",
            )}
          >
            <PhotoFigure
              photo={photo}
              alt={photo.caption ? `${nameOf(photo.userId)}: ${photo.caption}` : `Photo from ${nameOf(photo.userId)}`}
              square={compact}
            />
            <div className={cn("flex items-start gap-2", compact ? "mt-2" : "mt-3")}>
              <Avatar avatar={avatarOf(photo.userId)} name={nameOf(photo.userId)} size="xs" className="mt-0.5" />
              <p className="min-w-0 text-footnote text-ink-2">
                <span className="font-semibold text-ink">{photo.userId === userId ? "You" : nameOf(photo.userId)}</span>
                {photo.caption ? <span className="block break-words">{photo.caption}</span> : null}
              </p>
            </div>
          </li>
        ))}
      </ul>
      {game.missing.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {game.missing.map((id) => (
            <li key={id} className="flex items-center gap-2 text-footnote text-ink-2">
              <Avatar avatar={avatarOf(id)} name={nameOf(id)} size="xs" />
              {id === userId ? "You" : nameOf(id)}
              <Badge>Didn&apos;t play this round</Badge>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
