import { expect, test } from "@playwright/test";
import { createGarden, createProfile } from "./helpers";

test("fields expose help text as an accessible description", async ({ page }) => {
  await page.goto("/styleguide");
  await expect(page.getByRole("textbox", { name: "Garden name", exact: true })).toHaveAccessibleDescription("Up to 40 characters.");
});

test("settings confirmations cancel safely, return focus, and perform the selected action", async ({ page }) => {
  await createProfile(page, "UI reviewer");
  const gardenId = await createGarden(page, "UI garden", "two");
  await page.goto(`/g/${gardenId}/settings`);
  const opener = page.getByRole("button", { name: "Pause invites", exact: true });
  await opener.click();
  const dialog = page.getByRole("dialog", { name: "Pause invites?" });
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(opener).toBeFocused();
  await opener.click();
  await dialog.getByRole("button", { name: "Pause invites", exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expect(page.getByText(/Invites are paused/)).toBeVisible();
});
