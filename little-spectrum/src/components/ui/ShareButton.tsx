"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button, type ButtonStyleProps } from "./Button";

type Props = ButtonStyleProps & {
  url: string;
  title?: string;
  text?: string;
  label?: string;
  className?: string;
};

export function ShareButton({ url, label = "Copy invite link", className, ...style }: Props) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  async function copy() {
    const nav = typeof navigator === "undefined" ? undefined : navigator;
    try {
      if (!nav?.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await nav.clipboard.writeText(url);
      setState("copied");
      toast.success("Invite link copied", {
        description: "Paste it anywhere to invite a friend.",
      });
    } catch {
      setState("failed");
      toast.error("Copy failed", {
        description: "Select the link above to copy it manually.",
      });
    }
    setTimeout(() => setState("idle"), 2200);
  }

  const icon = state === "copied" ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />;

  return (
    <>
      <Button onClick={copy} icon={icon} className={className} {...style}>
        {state === "copied" ? "Link copied" : state === "failed" ? "Copy failed, long-press link" : label}
      </Button>
      <span className="sr-only" aria-live="polite">
        {state === "copied" ? "Invite link copied to clipboard" : ""}
      </span>
    </>
  );
}
