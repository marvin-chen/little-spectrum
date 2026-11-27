import { Flame } from "lucide-react";
import { cn } from "@/lib/cn";
import type { GrowthSummary } from "@/lib/data/growth";

// Compact weekly indicator: three segments, one sentence, the reset day.
export function WeeklyProgress({ growth, className }: { growth: GrowthSummary; className?: string }) {
  const done = Math.min(growth.completionsThisWeek, growth.goal);
  const line = growth.rewardedThisWeek
    ? "Your garden grew this week."
    : `${done} of ${growth.goal} little moments this week.`;
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex items-center gap-1" aria-hidden>
        {Array.from({ length: growth.goal }).map((_, i) => (
          <span key={i} className={cn("h-2 w-6 rounded-full transition-colors", i < done ? "bg-green" : "bg-ink/12")} />
        ))}
      </div>
      <p className="min-w-0 flex-1 text-footnote text-ink-2">
        <span className="font-semibold text-ink">{line}</span>{" "}
        <span className="whitespace-nowrap text-ink-3">Resets {growth.weekResetLabel}.</span>
      </p>
      {growth.streak > 1 ? (
        <span
          className="flex items-center gap-1 text-footnote font-semibold text-amber-ink"
          title="Consecutive weeks with a completed game"
        >
          <Flame className="size-4" aria-hidden />
          {growth.streak}w
        </span>
      ) : null}
    </div>
  );
}
