"use client";

import { cloneElement, useId, type InputHTMLAttributes, type ReactElement, type ReactNode, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export const inputClass =
  "disabled:opacity-45 disabled:cursor-not-allowed aria-invalid:ring-2 aria-invalid:ring-danger h-12 w-full rounded-control bg-surface px-4 text-body text-ink shadow-hairline outline-none placeholder:text-ink-3/70 transition-shadow focus-visible:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-tint)_45%,white)]";

type FieldControlProps = Pick<InputHTMLAttributes<HTMLInputElement>, "id" | "aria-describedby" | "aria-invalid">;

export type FieldProps = {
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  children: ReactElement<FieldControlProps>;
  className?: string;
};

// One direct input/textarea child; its own IDs and descriptions are preserved.
export function Field({ label, hint, error, children, className }: FieldProps) {
  const generatedId = useId();
  const id = children.props.id ?? generatedId;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [children.props["aria-describedby"], hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined;
  return (
    <div className={cn("block", className)}>
      <label htmlFor={id} className="mb-1.5 block px-1 text-footnote font-semibold text-ink-2">{label}</label>
      {cloneElement(children, { id, "aria-describedby": describedBy, "aria-invalid": error ? true : children.props["aria-invalid"] })}
      {hint ? <p id={hintId} className="mt-1.5 block px-1 text-caption text-ink-3">{hint}</p> : null}
      {error ? <p id={errorId} role="alert" className="mt-1.5 px-1 text-footnote text-danger">{error}</p> : null}
    </div>
  );
}

export function TextInput({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(inputClass, className)} {...rest} />;
}

export function TextArea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(inputClass, "h-auto resize-none py-3", className)} {...rest} />;
}
