import { expect, test, type Page } from "@playwright/test";
import { createGarden, createProfile } from "./helpers";

// Walks the main navigation at the current viewport, watching for application errors and unreachable controls.
function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "error" && !/favicon|Download the React DevTools/i.test(m.text())) errors.push(`console: ${m.text()}`);
  });
  return errors;
}

test("main navigation, catalog, garden, memories, and settings work without errors", async ({ page, isMobile }) => {
  const errors = watchErrors(page);
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Get started" })).toBeVisible();
  await createProfile(page, "Smoke");
  const gardenId = await createGarden(page, "Smoke garden", "two");

  // Primary navigation is reachable and every tab renders its title.
  for (const [name, heading] of [
    ["Games", "Games"],
    ["Garden", "Garden"],
    ["Memories", "Memories"],
    ["Home", "Smoke garden"],
  ] as const) {
    await page.getByRole("link", { name, exact: true }).first().click();
    await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
  }

  // The last catalog row must be clickable, not hidden behind the floating tab bar.
  await page.goto(`/g/${gardenId}/games`);
  const rows = page.getByRole("button", { name: /Clue game|Everyone answers/ });
  const last = rows.last();
  await last.scrollIntoViewIfNeeded();
  await last.click({ timeout: 5_000 });
  await expect(page.getByRole("dialog")).toBeVisible();
  // The dialog traps focus and closes with Escape.
  await expect(page.getByRole("dialog").getByRole("button", { name: /Invite a friend first|Start with/ })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();

  // Forms: the settings page shows the invite link and the account controls.
  await page.goto(`/g/${gardenId}/settings`);
  await expect(page.getByText(/\/join\//)).toBeVisible();
  await expect(page.getByRole("button", { name: /Keep this account/ })).toBeVisible();

  if (isMobile) {
    // The bottom tab bar never covers the primary action on Home.
    await page.goto(`/g/${gardenId}`);
    const share = page.getByRole("button", { name: /Share invite link/ });
    await share.scrollIntoViewIfNeeded();
    await expect(share).toBeVisible();
    await share.click({ trial: true });
  }

  expect(errors, errors.join("\n")).toEqual([]);
});
