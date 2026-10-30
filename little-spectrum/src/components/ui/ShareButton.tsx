"use client";

import { useState } from "react";
import { Check, Copy, Share } from "lucide-react";
import { Button, type ButtonStyleProps } from "./Button";

type Props = ButtonStyleProps & {
  url: string;
  title: string;
  text?: string;
  label?: string;
  className?: string;
};

export function ShareButton({ url, title, text, label = "Share invite link", className, ...style }: Props) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  async function share() {
    const nav = typeof navigator === "undefined" ? undefined : navigator;
    if (nav?.share) {
      try {
        await nav.share({ title, text, url });
        return;
      } catch (error) {
        if ((error as { name?: string }).name === "AbortError") return;
      }
    }
    try {
      await nav?.clipboard.writeText(url);
      setState("copied");
    } catch {
      setState("failed");
    }
    setTimeout(() => setState("idle"), 2200);
  }

  const canShare = typeof navigator !== "undefined" && typeof navigator.share === "function";
  const icon =
    state === "copied" ? (
      <Check className="size-4" aria-hidden />
    ) : canShare ? (
      <Share className="size-4" aria-hidden />
    ) : (
      <Copy className="size-4" aria-hidden />
    );

  return (
    <>
      <Button onClick={share} icon={icon} className={className} {...style}>
        {state === "copied" ? "Link copied" : state === "failed" ? "Copy failed, long-press link" : label}
      </Button>
      <span className="sr-only" aria-live="polite">
        {state === "copied" ? "Invite link copied to clipboard" : ""}
      </span>
    </>
  );
}
