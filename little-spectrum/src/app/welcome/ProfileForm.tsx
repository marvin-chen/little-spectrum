"use client";

import { useActionState, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/Field";
import { AVATAR_ICON_COMPONENTS, Avatar } from "@/components/ui/Avatar";
import { AVATAR_ICONS, parseAvatar, serializeAvatar, type AvatarIcon } from "@/lib/avatars";
import { cn } from "@/lib/cn";
import { COLOR_CLASSES, COLOR_KEYS, COLOR_NAMES, type ColorKey } from "@/lib/colors";
import { saveProfile, type ProfileFormState } from "./actions";

type Props = { next: string; initialName: string; initialAvatar: string; submitLabel: string };

export function ProfileForm({ next, initialName, initialAvatar, submitLabel }: Props) {
  const initial = parseAvatar(initialAvatar);
  const [icon, setIcon] = useState<AvatarIcon>(initial.icon);
  const [color, setColor] = useState<ColorKey>(initial.color);
  const [name, setName] = useState(initialName);
  const [state, action, pending] = useActionState<ProfileFormState, FormData>(
    async (prev, formData) => {
      if (submitLabel === "Save changes") toast.success("Profile updated");
      return saveProfile(prev, formData);
    },
    {},
  );
  const avatar = serializeAvatar({ icon, color });

  return (
    <form action={action} className="flex flex-col gap-6">
      <input type="hidden" name="next" value={next} />
      <input type="hidden" name="avatar" value={avatar} />

      <div className="flex items-center gap-4">
        <Avatar avatar={avatar} name={name || "Your avatar"} size="xl" />
        <Field label="Display name" className="flex-1">
          <TextInput name="displayName" value={name} onChange={(e) => setName(e.target.value)} maxLength={24} autoComplete="nickname" autoCapitalize="words" required placeholder="Jamie" />
        </Field>
      </div>

      <fieldset>
        <legend className="mb-2 px-1 text-footnote font-semibold text-ink-2">Avatar</legend>
        <div role="radiogroup" aria-label="Avatar icon" className="grid grid-cols-6 gap-2">
          {AVATAR_ICONS.map((key) => {
            const Icon = AVATAR_ICON_COMPONENTS[key];
            const selected = key === icon;
            return (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={key}
                onClick={() => setIcon(key)}
                className={cn(
                  "pressable flex aspect-square items-center justify-center rounded-control",
                  selected ? `${COLOR_CLASSES[color].soft} ${COLOR_CLASSES[color].ink} ring-2 ring-ink` : "bg-surface text-ink-2 shadow-hairline",
                )}
              >
                <Icon className="size-6" aria-hidden strokeWidth={2.25} />
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 px-1 text-footnote font-semibold text-ink-2">Color</legend>
        <div role="radiogroup" aria-label="Avatar color" className="flex flex-wrap gap-2">
          {COLOR_KEYS.map((key) => {
            const selected = key === color;
            return (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setColor(key)}
                className={cn(
                  "pressable flex h-10 items-center gap-2 rounded-capsule px-3 text-footnote font-semibold",
                  COLOR_CLASSES[key].soft,
                  COLOR_CLASSES[key].ink,
                  selected && "ring-2 ring-ink",
                )}
              >
                <span className={cn("size-3 rounded-full", COLOR_CLASSES[key].bg)} aria-hidden />
                {COLOR_NAMES[key]}
              </button>
            );
          })}
        </div>
      </fieldset>

      {state.error ? (
        <p role="alert" className="rounded-row bg-danger-soft px-4 py-3 text-callout text-danger">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" size="lg" full loading={pending} disabled={!name.trim()}>
        {submitLabel}
      </Button>
    </form>
  );
}
