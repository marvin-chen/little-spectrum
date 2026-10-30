import { expect, test, type Page } from "@playwright/test";
import sharp from "sharp";
import { createGarden, createProfile, inviteUrlFor, joinGarden, newPlayer, shot } from "./helpers";

async function startGame(page: Page, gardenId: string, gameName: RegExp, expectedPeople: number, deselect: string[] = []) {
  await page.goto(`/g/${gardenId}/games`);
  await page.getByRole("button", { name: gameName }).click();
  for (const name of deselect) await page.getByRole("checkbox", { name: new RegExp(`^${name}`) }).click();
  await page.getByRole("button", { name: new RegExp(`Start with ${expectedPeople} people`) }).click();
  await page.waitForURL(/\/play\//);
  return new URL(page.url()).pathname;
}

test("three friends play True Colors, Hue Clue, Same Wavelength, Palette Picks, and Color Quest", async ({ browser }) => {
  test.setTimeout(240_000);
  const ada = await newPlayer(browser, "Ada");
  const bo = await newPlayer(browser, "Bo");
  const cy = await newPlayer(browser, "Cy");
  await createProfile(ada.page, "Ada");
  const gardenId = await createGarden(ada.page, "The Thursday crew", "group");
  const invite = await inviteUrlFor(ada.page, gardenId);
  await joinGarden(bo.page, invite, "Bo");
  await joinGarden(cy.page, invite, "Cy");

  // True Colors with everyone.
  let url = await startGame(ada.page, gardenId, /True Colors/, 3);
  for (const p of [ada, bo, cy]) {
    await p.page.goto(url);
    await p.page.getByRole("radiogroup", { name: /Your answer/i }).getByRole("radio").first().click();
    await p.page.getByRole("radiogroup", { name: /Your prediction/i }).getByRole("radio").first().click();
    if (p === ada) await shot(p.page, "true-colors-answer");
    await p.page.getByRole("button", { name: "Lock in both" }).click();
  }
  await expect(cy.page.getByText(/Correct predictions/)).toBeVisible({ timeout: 20_000 });
  await expect(cy.page.getByText("3 of 3")).toBeVisible();
  await shot(cy.page, "true-colors-reveal");

  // Hue Clue with a subset: Ada and Bo only. Cy must not see it.
  url = await startGame(ada.page, gardenId, /Hue Clue/, 2, ["Cy"]);
  await expect(ada.page.getByText(/Your secret square is/)).toBeVisible();
  await shot(ada.page, "hue-clue-giver");
  await ada.page.getByPlaceholder("Your clue").fill("ripe mango");
  await ada.page.getByRole("button", { name: "Send clue" }).click();
  await bo.page.goto(url);
  await expect(bo.page.getByText("ripe mango")).toBeVisible({ timeout: 20_000 });
  expect(await bo.page.content()).not.toMatch(/target\\?":\{/);
  await bo.page.getByRole("gridcell", { name: /^C3,/ }).click();
  await shot(bo.page, "hue-clue-guess");
  await bo.page.getByRole("button", { name: "Confirm C3" }).click();
  await expect(bo.page.getByText("Shared score")).toBeVisible({ timeout: 20_000 });
  await shot(bo.page, "hue-clue-reveal");
  await cy.page.goto(url);
  await expect(cy.page).toHaveURL(/\/g\/.*\/play\//);
  await expect(cy.page.getByText("ripe mango")).toHaveCount(0);

  // Same Wavelength with everyone: no match on attempt one, then a full match.
  url = await startGame(bo.page, gardenId, /Same Wavelength/, 3);
  const words = { Ada: "towel", Bo: "sunscreen", Cy: "Towel!" };
  for (const p of [ada, bo, cy]) {
    await p.page.goto(url);
    await p.page.getByRole("textbox").fill(words[p.name as keyof typeof words]);
    await p.page.getByRole("button", { name: "Lock in" }).click();
  }
  await expect(bo.page.getByText(/Attempt 2 of 3/)).toBeVisible({ timeout: 20_000 });
  await expect(bo.page.getByText("Matched x2")).toBeVisible();
  await shot(bo.page, "same-wavelength-attempt-2");
  for (const p of [ada, bo, cy]) {
    await p.page.goto(url);
    await p.page.getByRole("textbox").fill("  Beach  Ball ");
    await p.page.getByRole("button", { name: "Lock in" }).click();
  }
  await expect(ada.page.getByText("Everyone on the same wavelength!")).toBeVisible({ timeout: 20_000 });
  await shot(ada.page, "same-wavelength-win");

  // Palette Picks with everyone, Cy never answers, Ada reveals early.
  url = await startGame(ada.page, gardenId, /Palette Picks/, 3);
  for (const p of [ada, bo]) {
    await p.page.goto(url);
    if (p === bo) await p.page.getByRole("button", { name: /Move .* down/ }).first().click();
    if (p === ada) await shot(p.page, "palette-picks-rank");
    await p.page.getByRole("button", { name: "Confirm ranking" }).click();
  }
  await ada.page.getByRole("button", { name: "Reveal" }).click();
  await expect(ada.page.getByText("Still waiting on Cy.")).toBeVisible();
  await ada.page.getByRole("button", { name: "Reveal available answers" }).click();
  await expect(ada.page.getByText("Overall similarity")).toBeVisible({ timeout: 20_000 });
  await expect(ada.page.getByText("83", { exact: true }).first()).toBeVisible();
  await expect(ada.page.getByText("Didn't play this round")).toBeVisible();
  await shot(ada.page, "palette-picks-reveal");

  // Color Quest with Ada and Cy.
  url = await startGame(cy.page, gardenId, /Color Quest/, 2, ["Bo"]);
  const jpeg = await sharp({ create: { width: 2400, height: 1600, channels: 3, background: { r: 79, g: 179, b: 122 } } }).jpeg().toBuffer();
  const png = await sharp({ create: { width: 800, height: 1200, channels: 3, background: { r: 242, g: 169, b: 59 } } }).png().toBuffer();
  for (const [p, buffer, mime] of [[cy, jpeg, "image/jpeg"], [ada, png, "image/png"]] as const) {
    await p.page.goto(url);
    await p.page.getByLabel("Choose a photo").setInputFiles({ name: "test.img", mimeType: mime, buffer });
    await expect(p.page.getByText("Ready to share?")).toBeVisible();
    await p.page.getByPlaceholder("A few words about it").fill(`From ${p.name}`);
    if (p === cy) await shot(p.page, "color-quest-sheet");
    await p.page.getByRole("button", { name: "Share photo" }).click();
    if (p === cy) await expect(p.page.getByText("Your photo is in")).toBeVisible({ timeout: 20_000 });
  }
  await expect(ada.page.getByText("From Cy")).toBeVisible({ timeout: 20_000 });
  await expect(ada.page.locator("img[src*='photos']")).toHaveCount(2);
  await shot(ada.page, "color-quest-reveal");
  // Bo is not a participant and cannot see the photos.
  await bo.page.goto(url);
  await expect(bo.page.getByText("From Cy")).toHaveCount(0);
  // Cy deletes the photo and the gallery degrades gracefully.
  await cy.page.goto(url);
  await cy.page.getByRole("button", { name: "Delete my photo" }).click();
  await cy.page.getByRole("button", { name: "Delete photo" }).click();
  await expect(cy.page.getByText("Photo removed")).toBeVisible({ timeout: 20_000 });

  // Home and memories reflect five completed games this week with one reward.
  await ada.page.goto(`/g/${gardenId}`);
  await expect(ada.page.getByText("Your garden grew something new this week.")).toBeVisible();
  await shot(ada.page, "home-group");
  await ada.page.goto(`/g/${gardenId}/garden`);
  await expect(ada.page.getByText("Three friends added a little color this week.")).toBeVisible();
  await shot(ada.page, "garden");
  // The earned item opens a sheet listing that week's rounds. Bo was only left out of Color Quest, so that one shows no details.
  await bo.page.goto(`/g/${gardenId}/garden`);
  await bo.page.locator("ul li button").first().click();
  await expect(bo.page.getByText(/Earned the week of/)).toBeVisible();
  await expect(bo.page.getByText("Not in this one")).toHaveCount(1);
  await shot(bo.page, "garden-sheet");
});
