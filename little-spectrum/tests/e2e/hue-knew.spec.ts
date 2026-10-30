import { expect, test } from "@playwright/test";
import { createGarden, createProfile, inviteUrlFor, joinGarden, newPlayer, shot } from "./helpers";

test("two friends create a garden, join by invite, and play Hue Knew? with a private target", async ({ browser }) => {
  const ada = await newPlayer(browser, "Ada");
  const bo = await newPlayer(browser, "Bo");

  await createProfile(ada.page, "Ada");
  const gardenId = await createGarden(ada.page, "Our little patch", "two");
  await expect(ada.page.getByText("Invite a friend to start playing")).toBeVisible();
  await shot(ada.page, "home-solo");

  const invite = await inviteUrlFor(ada.page, gardenId);
  await joinGarden(bo.page, invite, "Bo");
  await expect(bo.page.getByText("Welcome to Our little patch. You are in.")).toBeVisible();

  // A third person is rejected because the garden is full.
  const cy = await newPlayer(browser, "Cy");
  await cy.page.goto(invite);
  await expect(cy.page.getByText("This garden is full")).toBeVisible();
  await shot(cy.page, "join-full");

  // Ada starts Hue Knew? with everyone.
  await ada.page.goto(`/g/${gardenId}/games`);
  await shot(ada.page, "games");
  await ada.page.getByRole("button", { name: /Hue Knew\?/ }).click();
  await shot(ada.page, "start-sheet");
  await ada.page.getByRole("button", { name: /Start with 2 people/ }).click();
  await ada.page.waitForURL(/\/play\//);
  const sessionUrl = new URL(ada.page.url()).pathname;

  // The clue giver sees the target, the guesser does not, not even in the HTML.
  const targetText = await ada.page.getByText(/Your secret spot is/).textContent();
  const target = Number(targetText!.match(/(\d+)/)![1]);
  expect(target).toBeGreaterThanOrEqual(0);
  expect(target).toBeLessThanOrEqual(100);
  await shot(ada.page, "clue-giver");

  await bo.page.goto(sessionUrl);
  await expect(bo.page.getByText("Waiting for Ada's clue", { exact: true })).toBeVisible();
  const boHtml = await bo.page.content();
  expect(boHtml).not.toContain("Your secret spot is");
  expect(boHtml).toMatch(/target\\?":null/);
  expect(boHtml).not.toMatch(/target\\?":\s*\d/);

  await ada.page.getByPlaceholder("Your clue").fill("Sunday pancakes");
  await ada.page.getByRole("button", { name: "Send clue" }).click();
  await expect(ada.page.getByText(/Waiting for Bo to guess/)).toBeVisible();

  // Bo sees the clue after polling, still without the target.
  await expect(bo.page.getByText("Sunday pancakes")).toBeVisible({ timeout: 20_000 });
  expect(await bo.page.content()).not.toMatch(/target\\?":\s*\d/);
  await shot(bo.page, "guesser");
  const slider = bo.page.getByRole("slider", { name: "Your guess" });
  await slider.focus();
  for (let i = 0; i < 10; i += 1) await bo.page.keyboard.press("ArrowRight");
  await bo.page.getByRole("button", { name: /Lock in 60/ }).click();

  // Reveal happens automatically for both players.
  await expect(bo.page.getByText("Shared score")).toBeVisible({ timeout: 20_000 });
  await expect(ada.page.getByText("Shared score")).toBeVisible({ timeout: 20_000 });
  const expected = Math.max(0, 100 - 2 * Math.abs(target - 60));
  await expect(bo.page.getByText(String(expected), { exact: true }).first()).toBeVisible();
  await expect(ada.page.getByText(`Target ${target}`)).toBeVisible();
  await shot(ada.page, "reveal");

  // Refreshing keeps the result, and home lists it as revealed.
  await bo.page.reload();
  await expect(bo.page.getByText("Shared score")).toBeVisible();
  await bo.page.goto(`/g/${gardenId}`);
  await expect(bo.page.getByText("Recently revealed")).toBeVisible();
  await expect(bo.page.getByText("1 of 3 little moments this week.")).toBeVisible();
  await shot(bo.page, "home-after");

  // Ada plants a second garden and switches between the two. Each keeps its own state.
  const secondId = await createGarden(ada.page, "Second patch", "group");
  expect(secondId).not.toBe(gardenId);
  await expect(ada.page.getByText("0 of 3 little moments this week.")).toBeVisible();
  await ada.page.getByRole("button", { name: "Switch garden" }).click();
  await ada.page.getByRole("link", { name: /Our little patch/ }).click();
  await ada.page.waitForURL(`**/g/${gardenId}`);
  await expect(ada.page.getByText("1 of 3 little moments this week.")).toBeVisible();
  // Visiting the root returns to the last garden.
  await ada.page.goto("/");
  await ada.page.waitForURL(`**/g/${gardenId}`);

  // Cy cannot open the session even with the URL.
  await createProfile(cy.page, "Cy");
  await cy.page.goto(sessionUrl);
  await expect(cy.page).toHaveURL(/\/start\?missing=1/);
  expect(await cy.page.content()).not.toContain("Sunday pancakes");
});
