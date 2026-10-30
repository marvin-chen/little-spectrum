// Skeleton that mirrors the home composition so navigation does not jump.
export default function GardenLoading() {
  return (
    <div className="anim-fade" aria-busy aria-label="Loading">
      <div className="flex items-start justify-between pt-3 pb-4">
        <div className="flex flex-col gap-2">
          <div className="h-4 w-40 rounded-capsule bg-fill" />
          <div className="h-9 w-56 rounded-capsule bg-fill-2" />
        </div>
        <div className="size-11 rounded-capsule bg-fill" />
      </div>
      <div className="mb-4 flex items-center gap-3">
        <div className="h-8 w-24 rounded-capsule bg-fill" />
        <div className="h-4 w-32 rounded-capsule bg-fill" />
      </div>
      <div className="-mx-4 mb-7 md:mx-0">
        <div className="h-56 w-full bg-fill-2 md:h-64 md:rounded-group" />
        <div className="mx-4 -mt-4 h-12 rounded-row bg-surface shadow-card" />
      </div>
      <div className="mb-3 h-6 w-28 rounded-capsule bg-fill" />
      <div className="h-28 rounded-group bg-surface shadow-card ring-1 ring-line" />
    </div>
  );
}
