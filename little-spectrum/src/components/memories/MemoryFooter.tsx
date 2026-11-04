"use client";

import { inputClass } from "@/components/ui/Field";
import { useState, useTransition } from "react";
import { MessageSquarePlus, Pencil } from "lucide-react";
import { saveCommentAction, toggleReactionAction } from "@/app/g/[gardenId]/memories/actions";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { REACTION_EMOJI, type ReactionKey } from "@/lib/reactions";

const MAX_NOTE = 300;

type Participant = { userId: string; name: string; avatar: string };

type Props = {
  gardenId: string;
  sessionId: string;
  userId: string;
  participants: Participant[];
  reactions: Array<{ emoji: ReactionKey; userIds: string[] }>;
  comments: Array<{ userId: string; body: string }>;
};

export function MemoryFooter({ gardenId, sessionId, userId, participants, reactions, comments }: Props) {
  const [reactedBy, setReactedBy] = useState<Record<ReactionKey, string[]>>(() => {
    const initial = Object.fromEntries(REACTION_EMOJI.map((r) => [r.key, [] as string[]])) as Record<ReactionKey, string[]>;
    for (const r of reactions) initial[r.emoji] = r.userIds;
    return initial;
  });
  const [notes, setNotes] = useState<Record<string, string>>(() => Object.fromEntries(comments.map((c) => [c.userId, c.body])));
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(notes[userId] ?? "");
  const [error, setError] = useState<string | null>(null);
  const [, startReact] = useTransition();
  const [saving, startSave] = useTransition();
  const myNote = notes[userId];

  function react(key: ReactionKey) {
    setError(null);
    const had = reactedBy[key].includes(userId);
    const without = (ids: string[]) => ids.filter((id) => id !== userId);
    setReactedBy((prev) => ({ ...prev, [key]: had ? without(prev[key]) : [...prev[key], userId] }));
    startReact(async () => {
      const result = await toggleReactionAction(gardenId, sessionId, key);
      if (result.error) {
        setReactedBy((prev) => ({ ...prev, [key]: had ? [...without(prev[key]), userId] : without(prev[key]) }));
        setError(result.error);
      }
    });
  }

  function save() {
    setError(null);
    const text = draft.replace(/\s+/g, " ").trim();
    startSave(async () => {
      const result = await saveCommentAction(gardenId, sessionId, text);
      if (result.error) {
        setError(result.error);
        return;
      }
      setNotes((prev) => {
        const next = { ...prev };
        if (text) next[userId] = text;
        else delete next[userId];
        return next;
      });
      setDraft(text);
      setEditing(false);
    });
  }

  function cancel() {
    setDraft(myNote ?? "");
    setEditing(false);
    setError(null);
  }

  const noted = participants.filter((p) => notes[p.userId]);

  return (
    <div className="flex flex-col gap-3">
      <div role="group" aria-label="Reactions" className="flex flex-wrap gap-2">
        {REACTION_EMOJI.map((r) => {
          const ids = reactedBy[r.key];
          const on = ids.includes(userId);
          return (
            <button
              key={r.key}
              type="button"
              aria-pressed={on}
              aria-label={ids.length > 0 ? `${r.label}, ${ids.length}` : r.label}
              title={r.label}
              onClick={() => react(r.key)}
              className={cn(
                "pressable flex h-11 min-w-11 items-center justify-center gap-1.5 rounded-capsule px-3 ring-1",
                on ? "bg-blue-soft ring-blue" : "bg-fill ring-transparent hover:bg-fill-2",
              )}
            >
              <span className="text-[1.125rem] leading-none" aria-hidden>
                {r.glyph}
              </span>
              {ids.length > 0 ? (
                <span className={cn("text-footnote font-semibold tabular-nums", on ? "text-blue-ink" : "text-ink-2")} aria-hidden>
                  {ids.length}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {noted.length > 0 ? (
        <ul className="flex flex-col gap-2.5" aria-label="Notes">
          {noted.map((p) => {
            const isMe = p.userId === userId;
            return (
              <li key={p.userId} className="flex items-start gap-2.5">
                <Avatar avatar={p.avatar} name={isMe ? `${p.name} (you)` : p.name} size="xs" className="mt-0.5" />
                <p className="min-w-0 flex-1 text-callout text-ink">
                  <span className="block text-footnote font-semibold text-ink-2">{isMe ? "You" : p.name}</span>
                  <span className="break-words">{notes[p.userId]}</span>
                </p>
                {isMe && !editing ? (
                  <button
                    type="button"
                    aria-label="Edit your note"
                    onClick={() => setEditing(true)}
                    className="pressable -my-2 -mr-2 flex size-11 shrink-0 items-center justify-center rounded-full text-ink-3 hover:bg-fill"
                  >
                    <Pencil className="size-4" aria-hidden />
                  </button>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}

      {editing ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
          className="flex flex-col gap-2"
        >
          <label className="block">
            <span className="mb-1 block text-footnote font-semibold text-ink-2">{myNote ? "Your note" : "Add a note"}</span>
            <textarea
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value.slice(0, MAX_NOTE))}
              maxLength={MAX_NOTE}
              rows={2}
              placeholder="Something worth remembering about this one"
              className={cn(inputClass, "h-auto resize-none py-3")}
            />
          </label>
          <div className="flex items-center justify-between gap-2">
            <span className="text-caption text-ink-3 tabular-nums">
              {draft.length}/{MAX_NOTE}
            </span>
            <div className="flex gap-2">
              <Button variant="plain" onClick={cancel} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" loading={saving} disabled={!myNote && draft.trim().length === 0}>
                {myNote && draft.trim().length === 0 ? "Remove note" : "Save"}
              </Button>
            </div>
          </div>
        </form>
      ) : myNote ? null : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="pressable -mx-2 flex h-11 w-fit items-center gap-2 rounded-capsule px-3 text-footnote font-semibold text-blue-ink hover:bg-fill"
        >
          <MessageSquarePlus className="size-4" aria-hidden />
          Add a note
        </button>
      )}

      {error ? (
        <p role="alert" className="rounded-row bg-danger-soft px-4 py-2 text-footnote text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
