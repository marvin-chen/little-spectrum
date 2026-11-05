import { expect, test } from "@playwright/test";
import { shot } from "./helpers";

for (const appearance of ["light", "dark"] as const) {
  test(`game fixtures are safe and usable in ${appearance} appearance`, async ({ page }) => {
    const errors: string[] = [];
    const writes: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("request", (request) => {
      if (!["GET", "HEAD"].includes(request.method())) writes.push(request.url());
    });
    await page.emulateMedia({ colorScheme: appearance, reducedMotion: "reduce" });
    await page.goto("/styleguide/games?players=8");
    await expect(page.getByRole("heading", { name: "Game fixtures", exact: true })).toBeVisible();
    const games = page.getByRole("navigation", { name: "Fixture game", exact: true }).getByRole("link");
    expect(await games.count()).toBe(6);
    for (let i = 0; i < 6; i++) {
      await games.nth(i).click();
      await expect(page.getByRole("region", { name: "Reveal preview" })).toBeVisible();
      await page.getByText("Viewer-safe fixture data", { exact: true }).click();
      const data = JSON.parse((await page.getByTestId("fixture-data").textContent())!);
      expect(data.status).toBe("revealed");
      expect(data.participants).toHaveLength(8);
      expect(data).not.toHaveProperty("secret");
      expect(JSON.stringify(data)).not.toContain("fixture-only/");
      await page.getByText("Viewer-safe fixture data", { exact: true }).click();
      await shot(page, `game-fixture-${i}-${appearance}`);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    }
    await page.getByRole("navigation", { name: "Fixture state" }).getByRole("link", { name: "initial", exact: true }).click();
    await expect(page.getByRole("region", { name: "Reveal preview" })).toHaveCount(0);
    await page.getByRole("link", { name: "Switch viewer" }).click();
    await expect(page.getByText(/Viewing as Harper/)).toBeVisible();
    await page.getByText("Viewer-safe fixture data", { exact: true }).click();
    const active = JSON.parse((await page.getByTestId("fixture-data").textContent())!);
    expect(active.view.myPhoto).toBeNull();
    expect(active.view.gallery).toBeNull();
    await page.getByRole("navigation", { name: "Fixture state" }).getByRole("link", { name: "early", exact: true }).click();
    await expect(page.getByRole("region", { name: "Reveal preview" })).toBeVisible();
    await expect(page.getByText("Didn't play this round", { exact: true })).toHaveCount(6);
    await page.getByRole("link", { name: "2 players", exact: true }).click();
    await expect(page.getByText(/· early · 2 players/)).toBeVisible();
    expect(errors).toEqual([]);
    expect(writes).toEqual([]);
  });
}
