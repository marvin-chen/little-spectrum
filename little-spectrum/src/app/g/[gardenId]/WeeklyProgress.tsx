import { Flame } from "lucide-react";
import { cn } from "@/lib/cn";
import type { GrowthSummary } from "@/lib/data/growth";

export function WeeklyProgress({ growth, memberCount }: { growth: GrowthSummary; memberCount: number }) {
  const done = Math.min(growth.completionsThisWeek, growth.goal);
  const line = growth.rewardedThisWeek
    ? "Your garden grew something new this week."
    : `${done} of ${growth.goal} little moments this week.`;
  return (
    <div className="mt-3 flex items-center gap-3 px-1">
      <div className="flex items-center gap-1.5" aria-hidden>
        {Array.from({ length: growth.goal }).map((_, i) => (
          <span key={i} className={cn("h-2.5 w-7 rounded-full", i < done ? "bg-green" : "bg-fill-2")} />
        ))}
      </div>
      <p className="min-w-0 flex-1 text-footnote text-ink-2">
        <span className="font-semibold text-ink">{line}</span>{" "}
        <span className="whitespace-nowrap text-ink-3">Resets {growth.weekResetLabel}.</span>
      </p>
      {growth.streak > 1 ? (
        <span className="flex items-center gap-1 text-footnote font-semibold text-amber-ink" title="Consecutive weeks with a completed game">
          <Flame className="size-4" aria-hidden />
          {growth.streak}w
        </span>
      ) : null}
      <span className="sr-only">{memberCount} members</span>
    </div>
  );
}
