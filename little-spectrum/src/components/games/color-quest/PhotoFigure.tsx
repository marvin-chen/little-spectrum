import { ImageOff } from "lucide-react";
import { cn } from "@/lib/cn";
import type { PhotoView } from "@/lib/games/colorQuest";

export function PhotoFigure({
  photo,
  alt,
  className,
  square,
}: {
  photo: PhotoView;
  alt: string;
  className?: string;
  square?: boolean;
}) {
  if (photo.removed || !photo.url) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-row bg-fill text-ink-3",
          square ? "aspect-square" : "aspect-[4/3]",
          className,
        )}
      >
        <span className="flex flex-col items-center gap-1 text-footnote">
          <ImageOff className="size-5" aria-hidden />
          Photo removed
        </span>
      </div>
    );
  }
  const ratio = photo.width && photo.height ? `${photo.width} / ${photo.height}` : "4 / 3";
  return (
    // Signed Supabase URLs are short lived, so the image is served as is rather than through the optimizer.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={photo.url}
      alt={alt}
      width={photo.width ?? undefined}
      height={photo.height ?? undefined}
      loading="lazy"
      decoding="async"
      className={cn("w-full rounded-row bg-fill", square ? "object-cover" : "max-h-[26rem] object-contain", className)}
      style={{ aspectRatio: square ? "1 / 1" : ratio }}
    />
  );
}
