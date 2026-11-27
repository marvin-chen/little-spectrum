import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/cn";

export type ScaleMarker = {
  id: string;
  position: number;
  kind: "target" | "guess" | "mine";
  label: string;
  avatar?: string;
  name?: string;
};

// Markers closer than this many points share a column and stack upward.
const LANE_GAP = 8;

export function assignLanes(markers: ScaleMarker[]): Array<ScaleMarker & { lane: number }> {
  const sorted = [...markers].sort((a, b) => a.position - b.position || a.id.localeCompare(b.id));
  const lastInLane: number[] = [];
  return sorted.map((m) => {
    let lane = 0;
    while (lane < lastInLane.length && m.position - lastInLane[lane] < LANE_GAP) lane += 1;
    lastInLane[lane] = m.position;
    return { ...m, lane };
  });
}

// Keeps edge labels inside the track while the marker line stays exact.
function edgeShift(position: number): React.CSSProperties | undefined {
  if (position > 88) return { transform: "translateX(-42%)" };
  if (position < 12) return { transform: "translateX(42%)" };
  return undefined;
}

export function SpectrumScale({
  left,
  right,
  markers,
  className,
}: {
  left: string;
  right: string;
  markers: ScaleMarker[];
  className?: string;
}) {
  const placed = assignLanes(markers.filter((m) => m.kind !== "target"));
  const target = markers.find((m) => m.kind === "target");
  const lanes = placed.reduce((max, m) => Math.max(max, m.lane + 1), 0);
  const markerHeight = 52;
  const top = Math.max(lanes * markerHeight + (target ? 28 : 0), 40);

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="relative" style={{ height: top + 16 }}>
        {target ? (
          <div
            className="anim-pop absolute bottom-0 flex -translate-x-1/2 flex-col items-center"
            style={{ left: `${target.position}%`, height: top + 16 }}
          >
            <span
              className="rounded-capsule bg-coral-deep px-2 py-0.5 text-caption font-bold whitespace-nowrap text-white shadow-card"
              style={edgeShift(target.position)}
            >
              {target.label}
            </span>
            <span className="w-0.5 flex-1 bg-coral" aria-hidden />
          </div>
        ) : null}
        {placed.map((m, index) => (
          <div
            key={m.id}
            className="anim-rise absolute flex -translate-x-1/2 flex-col items-center"
            style={
              { left: `${m.position}%`, bottom: 16 + m.lane * markerHeight, "--i": index + 1 } as React.CSSProperties
            }
            title={`${m.name ?? m.label} at ${m.position}`}
          >
            <span
              className={cn(
                "rounded-capsule px-1.5 text-caption font-semibold whitespace-nowrap",
                m.kind === "mine" ? "bg-ink text-canvas" : "bg-surface text-ink-2 ring-1 ring-line",
              )}
              style={edgeShift(m.position)}
            >
              {m.label}
            </span>
            {m.avatar ? <Avatar avatar={m.avatar} name={m.name ?? m.label} size="sm" ring /> : null}
            <span className={cn("h-3 w-0.5", m.kind === "mine" ? "bg-ink" : "bg-ink-3")} aria-hidden />
          </div>
        ))}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-3 rounded-full bg-gradient-to-r from-coral-soft via-amber-soft to-coral"
        />
      </div>
      <div className="flex justify-between text-footnote font-semibold text-ink-2">
        <span>{left}</span>
        <span>{right}</span>
      </div>
    </div>
  );
}
