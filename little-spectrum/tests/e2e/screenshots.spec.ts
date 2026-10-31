import { test } from "@playwright/test";
import { createGarden, createProfile, newPlayer, shot } from "./helpers";

// Archive-only captures of pages the journeys do not already photograph. Runs only when E2E_SHOTS is set.
test.skip(!process.env.E2E_SHOTS, "archive captures only run with E2E_SHOTS");

test("captures onboarding, settings, style guide, and dark appearance", async ({ browser }) => {
  const light = await newPlayer(browser, "Archive");
  await light.page.goto("/");
  await shot(light.page, "landing");
  await light.page.goto("/welcome?next=%2Fstart");
  await light.page.getByLabel("Display name").fill("Archive");
  await shot(light.page, "welcome");
  await createProfile(light.page, "Archive");
  await light.page.goto("/start");
  await shot(light.page, "start");
  const gardenId = await createGarden(light.page, "Archive garden", "group");
  await light.page.goto(`/g/${gardenId}/settings`);
  await shot(light.page, "settings");
  await light.page.goto("/signin");
  await shot(light.page, "signin");
  await light.page.goto("/styleguide");
  await shot(light.page, "styleguide");

  const dark = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: "dark" });
  const page = await dark.newPage();
  await createProfile(page, "Night");
  const darkGarden = await createGarden(page, "Night garden", "two");
  await shot(page, "dark-home");
  await page.goto(`/g/${darkGarden}/games`);
  await shot(page, "dark-games");
  await page.goto(`/g/${darkGarden}/memories`);
  await shot(page, "dark-memories");
});
