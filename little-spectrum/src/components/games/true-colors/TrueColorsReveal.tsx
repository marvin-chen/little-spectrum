import { Check, UserRoundSearch, X } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import type { SessionView } from "@/lib/data/sessions";
import type { TrueColorsPrompt, TrueColorsResult } from "@/lib/games/trueColors";

type Props = {
  session: SessionView;
  prompt: Pick<TrueColorsPrompt, "text" | "options">;
  result: TrueColorsResult;
  userId: string;
  compact?: boolean;
};

export function TrueColorsReveal({ session, prompt, result, userId, compact = false }: Props) {
  const nameOf = (id: string) => session.participants.find((p) => p.userId === id)?.name ?? "Someone";
  const answerBy = new Map(result.answers.map((a) => [a.userId, a.answer]));
  const predictionBy = new Map(result.predictions.map((p) => [p.predictorId, p]));
  const pad = compact ? "p-4" : "p-5";

  return (
    <div className={cn("flex flex-col", compact ? "gap-3" : "gap-4")}>
      <Card className={pad}>
        <p className="text-footnote font-semibold uppercase tracking-[0.06em] text-ink-3">The question</p>
        <p className={cn("mt-1 font-display font-bold", compact ? "text-title-3" : "text-title-2")}>{prompt.text}</p>
      </Card>

      <Card className={pad}>
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-footnote font-semibold uppercase tracking-[0.06em] text-ink-3">Correct predictions</p>
          {result.scorable > 0 ? (
            <p className={cn("font-display font-bold text-rose-ink tabular-nums", compact ? "text-title-2" : "text-title-1")}>
              {result.correct}
              <span className="text-ink-3"> of {result.scorable}</span>
            </p>
          ) : (
            <p className="text-callout text-ink-2">No scorable predictions this round</p>
          )}
        </div>

        <ul className={cn("divide-y divide-line", compact ? "mt-1" : "mt-2")}>
          {session.participants.map((p) => {
            const isMe = p.userId === userId;
            const answer = answerBy.get(p.userId);
            const prediction = predictionBy.get(p.userId);
            return (
              <li key={p.userId} className={cn("flex items-start gap-3", compact ? "py-2" : "py-3")}>
                <Avatar avatar={p.avatar} name={p.name} size={compact ? "xs" : "sm"} className={compact ? "mt-0.5" : undefined} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                    <p className="text-body">
                      <span className="font-semibold">{isMe ? "You" : p.name}</span>
                      {answer !== undefined ? <span className="text-ink-2"> picked {prompt.options[answer]}</span> : null}
                    </p>
                    {answer === undefined ? <Badge>Didn&apos;t play this round</Badge> : null}
                  </div>
                  {prediction ? (
                    <div className="mt-1 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                      <p className="flex items-center gap-1.5 text-footnote text-ink-3">
                        <UserRoundSearch className="size-3.5 shrink-0" aria-hidden />
                        <span>
                          Predicted {prompt.options[prediction.predicted]} for{" "}
                          {prediction.targetId === userId ? "you" : nameOf(prediction.targetId)}
                        </span>
                      </p>
                      <PredictionBadge correct={prediction.correct} />
                    </div>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}

function PredictionBadge({ correct }: { correct: boolean | null }) {
  if (correct === null) return <Badge>Unscored</Badge>;
  if (correct) {
    return (
      <Badge tone="green" icon={<Check className="size-3" strokeWidth={3} aria-hidden />}>
        Called it
      </Badge>
    );
  }
  return (
    <Badge tone="coral" icon={<X className="size-3" strokeWidth={3} aria-hidden />}>
      Not quite
    </Badge>
  );
}
