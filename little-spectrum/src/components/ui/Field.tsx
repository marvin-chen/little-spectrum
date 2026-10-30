import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export const inputClass =
  "h-12 w-full rounded-control bg-surface px-4 text-body text-ink shadow-hairline outline-none placeholder:text-ink-3/70 transition-shadow focus-visible:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-tint)_45%,white)]";

export function Field({ label, hint, children, className }: { label: ReactNode; hint?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block px-1 text-footnote font-semibold text-ink-2">{label}</span>
      {children}
      {hint ? <span className="mt-1.5 block px-1 text-caption text-ink-3">{hint}</span> : null}
    </label>
  );
}

export function TextInput({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(inputClass, className)} {...rest} />;
}

export function TextArea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(inputClass, "h-auto resize-none py-3", className)} {...rest} />;
}
