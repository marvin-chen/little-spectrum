"use client";

import { ComponentExamples } from "./ComponentExamples";
import { useState } from "react";
import { Clock, Plus, Settings, Share, Sparkles, Users } from "lucide-react";
import { GamesIcon, GardenIcon, HomeIcon, MemoriesIcon } from "@/components/icons/TabIcons";
import { GameMotif, GameStageArt } from "@/components/games/motifs/GameMotif";
import { Avatar, AvatarStack } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button, IconButton } from "@/components/ui/Button";
import { Card, Group, Row, RowButton, RowLink, SectionLabel } from "@/components/ui/Card";
import { CountUp } from "@/components/ui/CountUp";
import { EmptyState } from "@/components/ui/EmptyState";
import { Field, TextArea, TextInput } from "@/components/ui/Field";
import { ToolbarGroup } from "@/components/ui/PageTitle";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Sheet } from "@/components/ui/Sheet";
import { Slider } from "@/components/ui/Slider";
import { cn } from "@/lib/cn";
import { COLOR_CLASSES, COLOR_NAMES } from "@/lib/colors";
import { GAMES, GAME_KEYS } from "@/lib/games";

const TYPE = [
  ["text-large-title font-bold font-display", "Large title", "34 / 700 / -0.022em"],
  ["text-title-1 font-bold font-display", "Title 1", "28 / 700"],
  ["text-title-2 font-bold font-display", "Title 2", "22 / 700"],
  ["text-title-3 font-bold", "Title 3, section headers", "20 / 700"],
  ["text-headline font-semibold", "Headline, row titles", "17 / 600"],
  ["text-body", "Body", "17 / 400"],
  ["text-callout", "Callout, supporting copy", "15 / 400"],
  ["text-footnote", "Footnote, metadata", "13 / 400"],
  ["text-caption font-semibold", "Caption, badges", "12 / 600"],
] as const;

export function StyleguideClient() {
  const [mode, setMode] = useState<"two" | "group">("two");
  const [open, setOpen] = useState(false);
  const [guess, setGuess] = useState(62);
  const [replay, setReplay] = useState(0);

  return (
    <div className="flex flex-col gap-10">
      <ComponentExamples />
      <section id="foundations">
        <SectionLabel>Canvas and ink</SectionLabel>
        <Card className="p-4">
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["bg-canvas", "Canvas"],
              ["bg-surface", "Surface"],
              ["bg-surface-3", "Surface 3"],
              ["bg-fill-2", "Fill"],
              ["bg-ink", "Ink"],
              ["bg-ink-2", "Ink 2"],
              ["bg-ink-3", "Ink 3"],
              ["bg-tint", "Tint"],
            ].map(([cls, label]) => (
              <li key={cls} className="flex items-center gap-3">
                <span className={cn("size-10 rounded-control ring-1 ring-line", cls)} aria-hidden />
                <span className="text-callout font-semibold">{label}</span>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <section>
        <SectionLabel>Game identities</SectionLabel>
        <Card className="p-4">
          <ul className="grid gap-3 sm:grid-cols-2">
            {GAME_KEYS.map((key) => {
              const game = GAMES[key];
              const colors = COLOR_CLASSES[game.color];
              return (
                <li key={key} className="flex items-center gap-3">
                  <GameMotif game={key} size={44} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-headline font-semibold">{game.name}</span>
                    <span className={cn("block text-footnote font-semibold", colors.ink)}>{game.descriptor}</span>
                  </span>
                  <span className="flex items-center gap-1" aria-hidden>
                    <span className={cn("size-6 rounded-[8px]", colors.bg)} />
                    <span className={cn("size-6 rounded-[8px]", colors.bgDeep)} />
                    <span className={cn("size-6 rounded-[8px]", colors.soft)} />
                  </span>
                  <Badge tone={game.color}>{COLOR_NAMES[game.color]}</Badge>
                </li>
              );
            })}
          </ul>
        </Card>
      </section>

      <section>
        <SectionLabel>Motif tiles and stage art</SectionLabel>
        <Card className="flex flex-col gap-5 p-4">
          <div className="flex flex-wrap items-end gap-3">
            {[24, 32, 44, 56, 72].map((size) => (
              <GameMotif key={size} game="hue-clue" size={size} />
            ))}
            <span className="text-footnote text-ink-3">24 to 72px</span>
          </div>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {GAME_KEYS.map((key) => (
              <li key={key} className={cn("relative h-28 overflow-hidden rounded-tile", COLOR_CLASSES[GAMES[key].color].soft)}>
                <GameStageArt game={key} className="absolute -top-2 right-0 h-28 w-auto" />
                <span className="absolute bottom-2 left-3 text-footnote font-semibold text-ink">{GAMES[key].name}</span>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <section>
        <SectionLabel>Type scale</SectionLabel>
        <Card className="divide-y divide-line px-4">
          {TYPE.map(([cls, label, spec]) => (
            <div key={label} className="flex items-baseline justify-between gap-4 py-3">
              <span className={cn("truncate text-ink", cls)}>{label}</span>
              <span className="shrink-0 text-caption text-ink-3 tabular-nums">{spec}</span>
            </div>
          ))}
        </Card>
      </section>

      <section>
        <SectionLabel>Buttons</SectionLabel>
        <Card className="flex flex-col gap-4 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button>Prominent</Button>
            <Button accent="coral">Coral</Button>
            <Button variant="glass">Glass</Button>
            <Button variant="tinted" accent="violet">
              Tinted
            </Button>
            <Button variant="plain">Plain</Button>
            <Button variant="danger">Delete</Button>
            <Button loading>Saving</Button>
            <Button disabled>Disabled</Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="glass">
              Small
            </Button>
            <Button size="md" variant="glass">
              Medium
            </Button>
            <Button size="lg" variant="glass">
              Large
            </Button>
            <IconButton variant="glass" label="Share" icon={<Share className="size-4" aria-hidden />} />
            <IconButton label="Start a game" icon={<Plus className="size-5" strokeWidth={2.5} aria-hidden />} />
          </div>
          <div className="flex items-center gap-3">
            <ToolbarGroup>
              <button type="button" aria-label="Switch garden" className="pressable flex size-9 items-center justify-center rounded-capsule hover:bg-fill">
                <Users className="size-[18px]" aria-hidden />
              </button>
              <button type="button" aria-label="Settings" className="pressable flex size-9 items-center justify-center rounded-capsule hover:bg-fill">
                <Settings className="size-[18px]" aria-hidden />
              </button>
            </ToolbarGroup>
            <span className="text-footnote text-ink-3">Glass toolbar group</span>
          </div>
        </Card>
      </section>

      <section>
        <SectionLabel>Controls</SectionLabel>
        <Card className="flex flex-col gap-5 p-4">
          <SegmentedControl
            label="Garden size"
            value={mode}
            onChange={setMode}
            options={[
              { value: "two", label: "Just us two" },
              { value: "group", label: "A group of friends" },
            ]}
          />
          <Field label="Garden name" hint="Up to 40 characters.">
            <TextInput placeholder="Our little patch" />
          </Field>
          <Field label="Caption">
            <TextArea rows={2} placeholder="A few words about it" />
          </Field>
          <Slider label="Your guess" value={guess} onChange={setGuess} leftLabel="Cozy" rightLabel="Chaotic" />
        </Card>
      </section>

      <section>
        <SectionLabel>Badges, avatars, tab icons</SectionLabel>
        <Card className="flex flex-col gap-4 p-4">
          <div className="flex flex-wrap gap-2">
            <Badge icon={<Clock className="size-3" aria-hidden />}>Waiting</Badge>
            <Badge tone="coral">Your turn</Badge>
            <Badge tone="green">Reveal ready</Badge>
            <Badge tone="glass">Glass</Badge>
            <Badge tone="ink">New</Badge>
          </div>
          <div className="flex items-center gap-3">
            <Avatar avatar="sun:amber" name="Jamie" size="lg" />
            <Avatar avatar="cat:violet" name="Sam" />
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
          <div className="flex items-center gap-6 text-[24px] text-ink">
            {[HomeIcon, GamesIcon, GardenIcon, MemoriesIcon].map((Icon, i) => (
              <span key={i} className="flex items-center gap-2">
                <Icon />
                <Icon active />
              </span>
            ))}
          </div>
        </Card>
      </section>

      <section>
        <SectionLabel action={<Badge>Grouped</Badge>}>Rows</SectionLabel>
        <Group>
          <RowLink href="/styleguide" icon={<Users className="size-5 text-ink-2" aria-hidden />} label="Members" detail="2 of 8 spots filled" />
          <RowButton onClick={() => setOpen(true)} icon={<Sparkles className="size-5 text-ink-2" aria-hidden />} label="Open a sheet" trailing="Demo" />
          <Row icon={<Settings className="size-5 text-ink-2" aria-hidden />} label="Timezone" trailing="Pacific" />
        </Group>
      </section>

      <section>
        <SectionLabel action={<Button size="sm" variant="glass" onClick={() => setReplay((n) => n + 1)}>Replay</Button>}>Motion</SectionLabel>
        <Card className="p-4" key={replay}>
          <div className="flex items-baseline justify-between">
            <span className="text-footnote font-semibold text-ink-3">Count up</span>
            <CountUp value={83} className="font-display text-title-1 font-bold text-amber-ink tabular-nums" />
          </div>
          <ul className="mt-3 flex flex-col gap-2">
            {["Staggered rise", "Each item waits 60ms longer", "Reduced motion collapses it to a fade"].map((t, i) => (
              <li key={t} className="anim-rise rounded-row bg-fill px-3 py-2 text-callout" style={{ "--i": i } as React.CSSProperties}>
                {t}
              </li>
            ))}
          </ul>
          <div className="mt-3 flex gap-3">
            <span className="anim-pop flex size-12 items-center justify-center rounded-tile bg-violet-soft text-violet-ink">pop</span>
            <span className="anim-grow flex size-12 items-center justify-center rounded-tile bg-green-soft text-green-ink">grow</span>
          </div>
        </Card>
      </section>

      <section>
        <SectionLabel>Empty state</SectionLabel>
        <Card>
          <EmptyState icon={<Sparkles className="size-8" aria-hidden />} title="Nothing waiting on you" body="Start something and your friends get a turn." action={<Button variant="tinted" accent="coral">Start a game</Button>} />
        </Card>
      </section>

      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title="Pick who plays"
        description="Choose at least two people."
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
        <Field label="Keyboard test" className="mt-4">
          <TextInput placeholder="Type to test the keyboard" />
        </Field>
      </Sheet>
    </div>
  );
}
