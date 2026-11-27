import { expect, test, type Page } from "@playwright/test";
import { anonymousUser, service } from "../db/helpers";
import { createGarden, createProfile, inviteUrlFor, joinGarden, newPlayer, shot } from "./helpers";

async function startGame(
  page: Page,
  gardenId: string,
  gameName: RegExp,
  expectedPeople: number,
  deselect: string[] = [],
) {
  await page.goto(`/g/${gardenId}/games`);
  await page.getByRole("button", { name: gameName }).click();
  for (const name of deselect) await page.getByRole("checkbox", { name: new RegExp(`^${name}`) }).click();
  await page.getByRole("button", { name: new RegExp(`Start with ${expectedPeople} people`) }).click();
  await page.waitForURL(/\/play\//);
  return new URL(page.url()).pathname;
}

test("memories feed shows rounds, reactions, notes, filters, and garden activity", async ({ browser }) => {
  const ada = await newPlayer(browser, "Ada");
  const bo = await newPlayer(browser, "Bo");
  const cy = await newPlayer(browser, "Cy");
  await createProfile(ada.page, "Ada");
  const gardenId = await createGarden(ada.page, "Memory lane", "group");
  const invite = await inviteUrlFor(ada.page, gardenId);
  await joinGarden(bo.page, invite, "Bo");
  await joinGarden(cy.page, invite, "Cy");
  const memories = `/g/${gardenId}/memories`;

  // Empty state first.
  await ada.page.goto(memories);
  await expect(ada.page.getByText("No memories yet")).toBeVisible();
  await shot(ada.page, "memories-empty");

  // Hue Knew with Ada and Bo only.
  let url = await startGame(ada.page, gardenId, /Hue Knew\?/, 2, ["Cy"]);
  await ada.page.getByPlaceholder("Your clue").fill("Sunday pancakes");
  await ada.page.getByRole("button", { name: "Send clue" }).click();
  await bo.page.goto(url);
  await expect(bo.page.getByText("Sunday pancakes")).toBeVisible({ timeout: 20_000 });
  const slider = bo.page.getByRole("slider", { name: "Your guess" });
  await slider.focus();
  for (let i = 0; i < 10; i += 1) await bo.page.keyboard.press("ArrowRight");
  await bo.page.getByRole("button", { name: /Lock in 60/ }).click();
  await expect(bo.page.getByText("Shared score")).toBeVisible({ timeout: 20_000 });

  // True Colors with everyone.
  url = await startGame(ada.page, gardenId, /True Colors/, 3);
  for (const p of [ada, bo, cy]) {
    await p.page.goto(url);
    await p.page
      .getByRole("radiogroup", { name: /Your answer/i })
      .getByRole("radio")
      .first()
      .click();
    await p.page
      .getByRole("radiogroup", { name: /Your prediction/i })
      .getByRole("radio")
      .first()
      .click();
    await p.page.getByRole("button", { name: "Lock in both" }).click();
  }
  await expect(cy.page.getByText(/Correct predictions/)).toBeVisible({ timeout: 20_000 });

  // Same Wavelength with everyone, instant match.
  url = await startGame(bo.page, gardenId, /Same Wavelength/, 3);
  for (const p of [ada, bo, cy]) {
    await p.page.goto(url);
    await p.page.getByRole("textbox").fill("towel");
    await p.page.getByRole("button", { name: "Lock in" }).click();
  }
  await expect(ada.page.getByText("Everyone on the same wavelength!")).toBeVisible({ timeout: 20_000 });

  // Palette Picks with everyone, Cy never answers, Ada reveals early.
  url = await startGame(ada.page, gardenId, /Palette Picks/, 3);
  for (const p of [ada, bo]) {
    await p.page.goto(url);
    if (p === bo)
      await p.page
        .getByRole("button", { name: /Move .* down/ })
        .first()
        .click();
    await p.page.getByRole("button", { name: "Confirm ranking" }).click();
  }
  await ada.page.getByRole("button", { name: "Reveal" }).click();
  await ada.page.getByRole("button", { name: "Reveal available answers" }).click();
  await expect(ada.page.getByText("Overall similarity")).toBeVisible({ timeout: 20_000 });

  // Cy was not in Hue Knew: no clue text, but an activity entry.
  await cy.page.goto(memories);
  await expect(cy.page.getByRole("heading", { name: "Memories" })).toBeVisible();
  await expect(cy.page.getByText("Sunday pancakes")).toHaveCount(0);
  expect(await cy.page.content()).not.toContain("Sunday pancakes");
  await expect(cy.page.getByText("Around the garden")).toBeVisible();
  await expect(cy.page.getByText(/Hue Knew\? · 2 players/)).toBeVisible();
  await shot(cy.page, "memories-cy-top");
  await shot(cy.page, "memories-cy-full");

  // Bo reacts and leaves a note on the Same Wavelength memory.
  await bo.page.goto(memories);
  const boCard = bo.page.getByRole("article", { name: /Same Wavelength/ });
  await boCard.getByRole("button", { name: "Love it" }).click();
  await expect(boCard.getByRole("button", { name: "Love it, 1" })).toHaveAttribute("aria-pressed", "true");
  await boCard.getByRole("button", { name: "Add a note" }).click();
  await boCard.getByLabel("Add a note").fill("Towel. Obviously.");
  await shot(bo.page, "memories-bo-editing");
  await boCard.getByRole("button", { name: "Save" }).click();
  await expect(boCard.getByText("Towel. Obviously.")).toBeVisible();
  await expect(boCard.getByRole("button", { name: "Edit your note" })).toBeVisible();
  await bo.page.reload();
  const boAgain = bo.page.getByRole("article", { name: /Same Wavelength/ });
  await expect(boAgain.getByRole("button", { name: "Love it, 1" })).toHaveAttribute("aria-pressed", "true");
  await expect(boAgain.getByText("Towel. Obviously.")).toBeVisible();

  // Ada sees Bo's reaction and note, adds her own heart and a wow.
  await ada.page.goto(memories);
  const adaCard = ada.page.getByRole("article", { name: /Same Wavelength/ });
  await expect(adaCard.getByRole("button", { name: "Love it, 1" })).toHaveAttribute("aria-pressed", "false");
  await expect(adaCard.getByText("Towel. Obviously.")).toBeVisible();
  await adaCard.getByRole("button", { name: "Love it, 1" }).click();
  await expect(adaCard.getByRole("button", { name: "Love it, 2" })).toHaveAttribute("aria-pressed", "true");
  await adaCard.getByRole("button", { name: "Wow" }).click();
  await expect(adaCard.getByRole("button", { name: "Wow, 1" })).toHaveAttribute("aria-pressed", "true");
  await ada.page.waitForLoadState("networkidle");
  await adaCard.getByRole("button", { name: "Add a note" }).click();
  await adaCard.getByLabel("Add a note").fill("   We are   one brain.  ");
  await adaCard.getByRole("button", { name: "Save" }).click();
  await expect(adaCard.getByText("We are one brain.")).toBeVisible();
  await ada.page.reload();
  await expect(
    ada.page.getByRole("article", { name: /Same Wavelength/ }).getByRole("button", { name: "Love it, 2" }),
  ).toHaveAttribute("aria-pressed", "true");
  await shot(ada.page, "memories-ada-top");
  await shot(ada.page, "memories-ada-full");

  // Removing a note.
  const adaCard2 = ada.page.getByRole("article", { name: /Same Wavelength/ });
  await adaCard2.getByRole("button", { name: "Edit your note" }).click();
  await adaCard2.getByLabel("Your note").fill("");
  await adaCard2.getByRole("button", { name: "Remove note" }).click();
  await expect(adaCard2.getByText("We are one brain.")).toHaveCount(0);
  await expect(adaCard2.getByRole("button", { name: "Add a note" })).toBeVisible();
  await ada.page.reload();
  await expect(ada.page.getByText("We are one brain.")).toHaveCount(0);

  // Filtering by game lives in the URL.
  const filterNav = ada.page.getByRole("navigation", { name: "Filter by game" });
  await filterNav.getByRole("link", { name: "Hue Knew?" }).click();
  await expect(ada.page).toHaveURL(/game=hue-knew/);
  await expect(filterNav.getByRole("link", { name: "Hue Knew?" })).toHaveAttribute("aria-current", "page");
  await expect(ada.page.getByText("Sunday pancakes")).toBeVisible();
  await expect(ada.page.getByRole("article")).toHaveCount(1);
  await shot(ada.page, "memories-ada-filter");
  await cy.page.goto(`${memories}?game=hue-knew`);
  await expect(cy.page.getByText("No Hue Knew? memories yet")).toBeVisible();
  await expect(cy.page.getByText(/Hue Knew\? · 2 players/)).toBeVisible();
  await shot(cy.page, "memories-cy-filter-empty");

  // Each header links to the full round.
  await ada.page.goto(memories);
  await ada.page
    .getByRole("article", { name: /Hue Knew/ })
    .getByRole("link")
    .first()
    .click();
  await expect(ada.page).toHaveURL(/\/play\//);

  // Desktop width sanity check.
  const wide = await browser.newContext({
    viewport: { width: 1100, height: 900 },
    storageState: await ada.context.storageState(),
  });
  const widePage = await wide.newPage();
  await widePage.goto(memories);
  await expect(widePage.getByRole("heading", { name: "Memories" })).toBeVisible();
  await shot(widePage, "memories-ada-desktop");
  await wide.close();
});

test("memories pages back to older rounds", async ({ browser }) => {
  const ada = await newPlayer(browser, "Ada");
  const name = `Ada${Date.now().toString(36)}`;
  await createProfile(ada.page, name);
  const gardenId = await createGarden(ada.page, "Long memory", "two");
  const memories = `/g/${gardenId}/memories`;

  const { data: profile } = await service().from("profiles").select("id").eq("display_name", name).single();
  const bo = await anonymousUser("Bo");
  const people = [profile!.id as string, bo.id];
  const first = Date.parse("2026-01-01T00:00:00Z");
  const clue = (n: number) => `Clue ${String(n).padStart(2, "0")}`;
  const { data: sessions, error } = await service()
    .from("sessions")
    .insert(
      Array.from({ length: 21 }, (_, i) => ({
        garden_id: gardenId,
        game: "hue-knew",
        status: "revealed",
        created_by: people[0],
        clue_giver_id: people[0],
        prompt: { id: "cozy-chaotic", left: "Cozy", right: "Chaotic" },
        result: {
          target: 50,
          clue: clue(i + 1),
          guesses: [{ userId: bo.id, guess: 40, score: 80 }],
          shared: 80,
          missing: [],
          suggestedClueGiverId: people[0],
        },
        revealed_at: new Date(first + i * 60_000).toISOString(),
      })),
    )
    .select("id");
  expect(error).toBeNull();
  const ids = sessions!.map((s) => s.id as string);
  await service()
    .from("session_participants")
    .insert(ids.flatMap((id) => people.map((userId) => ({ session_id: id, user_id: userId }))));
  await service()
    .from("session_secrets")
    .insert(ids.map((id) => ({ session_id: id, payload: { target: 50 } })));

  await ada.page.goto(memories);
  await expect(ada.page.getByRole("article")).toHaveCount(20);
  await expect(ada.page.getByText(clue(21))).toBeVisible();
  await expect(ada.page.getByText(clue(1))).toHaveCount(0);
  await expect(ada.page.getByRole("link", { name: "Back to newest" })).toHaveCount(0);
  const more = ada.page.getByRole("navigation", { name: "More memories" });
  await ada.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await expect(more.getByRole("link", { name: "Show older" })).toBeInViewport();
  await shot(ada.page, "memories-show-older");

  await more.getByRole("link", { name: "Show older" }).click();
  await expect(ada.page).toHaveURL(/before=/);
  await expect(ada.page.getByRole("article")).toHaveCount(1);
  await expect(ada.page.getByText(clue(1))).toBeVisible();
  await expect(ada.page.getByRole("link", { name: "Show older" })).toHaveCount(0);
  await ada.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await shot(ada.page, "memories-older-page");

  await ada.page.getByRole("link", { name: "Back to newest" }).click();
  await expect(ada.page).not.toHaveURL(/before=/);
  await expect(ada.page.getByRole("article")).toHaveCount(20);
});
