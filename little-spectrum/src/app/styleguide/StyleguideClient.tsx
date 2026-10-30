"use client";

import { useState } from "react";
import { Clock, Settings, Sparkles, Users } from "lucide-react";
import { Avatar, AvatarStack } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, Group, Row, RowButton, RowLink, SectionLabel } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Sheet } from "@/components/ui/Sheet";
import { ShareButton } from "@/components/ui/ShareButton";
import { COLOR_CLASSES, COLOR_KEYS, COLOR_NAMES } from "@/lib/colors";
import { GAMES, GAME_KEYS } from "@/lib/games";

export function StyleguideClient() {
  const [mode, setMode] = useState<"two" | "group">("two");
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-8">
      <section>
        <SectionLabel>Colors</SectionLabel>
        <Card className="p-4">
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {COLOR_KEYS.map((key) => (
              <li key={key} className="flex items-center gap-3">
                <span className={`size-10 rounded-row ${COLOR_CLASSES[key].bg}`} aria-hidden />
                <span className={`size-10 rounded-row ${COLOR_CLASSES[key].soft}`} aria-hidden />
                <span className="text-callout font-semibold">{COLOR_NAMES[key]}</span>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <section>
        <SectionLabel>Buttons</SectionLabel>
        <Card className="flex flex-wrap gap-3 p-4">
          <Button>Primary</Button>
          <Button accent="coral">Coral primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="tinted" accent="violet">
            Tinted
          </Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Delete</Button>
          <Button loading>Saving</Button>
          <Button size="lg" full accent="green">
            Large full width
          </Button>
          <ShareButton url="https://example.com/join/abc" title="Join my garden" variant="tinted" accent="blue" />
        </Card>
      </section>

      <section>
        <SectionLabel>Segmented control</SectionLabel>
        <Card className="p-4">
          <SegmentedControl
            label="Garden size"
            value={mode}
            onChange={setMode}
            options={[
              { value: "two", label: "Just us two" },
              { value: "group", label: "A group of friends" },
            ]}
          />
          <p className="mt-3 text-footnote text-ink-3">Selected: {mode}</p>
        </Card>
      </section>

      <section>
        <SectionLabel>Badges and avatars</SectionLabel>
        <Card className="flex flex-col gap-4 p-4">
          <div className="flex flex-wrap gap-2">
            <Badge icon={<Clock className="size-3" aria-hidden />}>Waiting</Badge>
            <Badge tone="coral">Your turn</Badge>
            <Badge tone="green">Reveal ready</Badge>
            <Badge tone="ink">New</Badge>
          </div>
          <div className="flex items-center gap-3">
            <Avatar avatar="sun:amber" name="Jamie" size="lg" />
            <Avatar avatar="cat:violet" name="Sam" />
            <Avatar avatar="waves:blue" name="Riley" size="sm" />
            <AvatarStack
              people={[
                { id: "1", name: "Jamie", avatar: "sun:amber" },
                { id: "2", name: "Sam", avatar: "cat:violet" },
                { id: "3", name: "Riley", avatar: "waves:blue" },
                { id: "4", name: "Noor", avatar: "leaf:green" },
                { id: "5", name: "Ada", avatar: "star:coral" },
                { id: "6", name: "Kai", avatar: "moon:rose" },
              ]}
            />
          </div>
        </Card>
      </section>

      <section>
        <SectionLabel action={<Badge>3 rows</Badge>}>Grouped rows</SectionLabel>
        <Group>
          <RowLink
            href="/styleguide"
            icon={<Users className="size-5 text-ink-2" aria-hidden />}
            label="Members"
            detail="2 of 8 spots filled"
          />
          <RowButton
            onClick={() => setOpen(true)}
            icon={<Sparkles className="size-5 text-ink-2" aria-hidden />}
            label="Open a sheet"
            trailing="Demo"
          />
          <Row icon={<Settings className="size-5 text-ink-2" aria-hidden />} label="Timezone" trailing="Pacific" />
        </Group>
      </section>

      <section>
        <SectionLabel>Game identities</SectionLabel>
        <ul className="grid gap-3 sm:grid-cols-2">
          {GAME_KEYS.map((key) => {
            const game = GAMES[key];
            const colors = COLOR_CLASSES[game.color];
            return (
              <li key={key}>
                <Card className="flex items-center gap-3 p-4">
                  <span className={`size-11 rounded-row ${colors.soft}`} aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="block text-body font-semibold">{game.name}</span>
                    <span className="block text-footnote text-ink-3">{game.descriptor}</span>
                  </span>
                  <Badge tone={game.color}>{game.colorLabel}</Badge>
                </Card>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <SectionLabel>Empty state</SectionLabel>
        <Card>
          <EmptyState
            icon={<Sparkles className="size-8" aria-hidden />}
            title="Nothing waiting on you"
            body="Start something colorful and your friends will see it here."
            action={<Button variant="tinted" accent="coral">Start a game</Button>}
          />
        </Card>
      </section>

      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title="Pick who plays"
        description="Choose at least two people. Everyone is selected by default."
        footer={
          <Button full size="lg" onClick={() => setOpen(false)}>
            Start game
          </Button>
        }
      >
        <Group>
          <Row icon={<Avatar avatar="sun:amber" name="Jamie" size="sm" />} label="Jamie" trailing="You" />
          <Row icon={<Avatar avatar="cat:violet" name="Sam" size="sm" />} label="Sam" />
        </Group>
        <label className="mt-4 block">
          <span className="mb-1 block text-footnote font-semibold text-ink-2">Keyboard test</span>
          <input
            type="text"
            placeholder="Type to test the keyboard"
            className="h-11 w-full rounded-row bg-fill px-3 text-body outline-none focus-visible:ring-2 focus-visible:ring-blue"
          />
        </label>
      </Sheet>
    </div>
  );
}
