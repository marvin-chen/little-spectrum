import { cn } from "@/lib/cn";

export function BrandMark({ className, size = 28 }: { className?: string; size?: number }) {
  return (
    <svg
      viewBox="0 0 40 40"
      width={size}
      height={size}
      aria-hidden
      className={cn("shrink-0", className)}
    >
      <circle cx="20" cy="20" r="18" fill="#fbf7f0" stroke="#1f1b2e" strokeWidth="1.5" />
      <path d="M20 20 L20 4 A16 16 0 0 1 33.9 12 Z" fill="#ff7a59" />
      <path d="M20 20 L33.9 12 A16 16 0 0 1 33.9 28 Z" fill="#f2a93b" />
      <path d="M20 20 L33.9 28 A16 16 0 0 1 20 36 Z" fill="#4fb37a" />
      <path d="M20 20 L20 36 A16 16 0 0 1 6.1 28 Z" fill="#4f8cff" />
      <path d="M20 20 L6.1 28 A16 16 0 0 1 6.1 12 Z" fill="#8b6cf0" />
      <path d="M20 20 L6.1 12 A16 16 0 0 1 20 4 Z" fill="#f26b8a" />
      <circle cx="20" cy="20" r="6.5" fill="#fbf7f0" />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <BrandMark />
      <span className="font-display text-title-3 font-bold tracking-tight text-ink">Little Spectrum</span>
    </span>
  );
}
