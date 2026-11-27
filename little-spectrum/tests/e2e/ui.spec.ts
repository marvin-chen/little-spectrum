import { expect, test } from "@playwright/test";
import { createGarden, createProfile } from "./helpers";

test("fields expose help text as an accessible description", async ({ page }) => {
  await page.goto("/styleguide");
  await expect(page.getByRole("textbox", { name: "Garden name", exact: true })).toHaveAccessibleDescription(
    "Up to 40 characters.",
  );
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

for (const appearance of ["light", "dark"] as const) {
  test(`component examples work in ${appearance} appearance with reduced motion`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.emulateMedia({ colorScheme: appearance, reducedMotion: "reduce" });
    await page.goto("/styleguide");
    await page.getByRole("button", { name: "Save example", exact: true }).click();
    const name = page.getByRole("textbox", { name: "Example garden name", exact: true });
    await expect(name).toHaveAttribute("aria-invalid", "true");
    await expect(name).toHaveAccessibleDescription("Up to 40 characters. Enter a garden name.");
    await name.fill("A garden with a longer name");
    await page.getByRole("button", { name: "Save example", exact: true }).click();
    await expect(name).not.toHaveAttribute("aria-invalid");
    await expect(page.getByRole("status").filter({ hasText: "Example saved." })).toBeVisible();
    await expect(page.getByLabel("Disabled example", { exact: true })).toBeDisabled();
    await expect(page.getByLabel("Read-only example", { exact: true })).not.toBeEditable();

    const group = page.getByRole("radiogroup", { name: "Example activity" });
    const choices = group.getByRole("radio");
    await choices.first().click();
    await choices.first().press("ArrowDown");
    await expect(choices.nth(1)).toBeDisabled();
    await expect(choices.nth(2)).toBeChecked();
    await expect(choices.nth(2)).toBeFocused();
    await choices.nth(2).press("ArrowDown");
    await expect(choices.first()).toBeChecked();

    await page.getByLabel("Simulate request failure").check();
    const opener = page.getByRole("button", { name: "Open confirmation example" });
    await opener.click();
    const dialog = page.getByRole("dialog", { name: "Confirm example?" });
    await expect(dialog.getByRole("button", { name: "Close", exact: true })).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(dialog.getByRole("button", { name: "Cancel" })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(dialog.getByRole("button", { name: "Close", exact: true })).toBeFocused();
    const confirm = dialog.getByRole("button", { name: "Confirm example", exact: true });
    await confirm.click();
    await expect(confirm).toBeDisabled();
    await expect(confirm).toHaveAttribute("aria-busy", "true");
    await page.keyboard.press("Escape");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("alert")).toContainText("Example request failed");
    await dialog.getByRole("button", { name: "Cancel" }).click();
    await expect(opener).toBeFocused();
    await page.getByLabel("Simulate request failure").uncheck();
    await opener.click();
    await confirm.click();
    await expect(dialog).not.toBeVisible();
    await expect(page.getByRole("status").filter({ hasText: "Example confirmed." })).toBeVisible();
    await expect(opener).toBeFocused();

    const icon = page.getByRole("button", { name: "Example settings", exact: true });
    const box = await icon.boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    expect(errors).toEqual([]);

    if (process.env.E2E_SHOTS) {
      await page
        .locator("#forms")
        .screenshot({ path: `${process.env.E2E_SHOTS}/ui-forms-${appearance}.png`, scale: "css" });
      await page
        .locator("#selection")
        .screenshot({ path: `${process.env.E2E_SHOTS}/ui-selection-${appearance}.png`, scale: "css" });
      await opener.click();
      await dialog.screenshot({ path: `${process.env.E2E_SHOTS}/ui-confirmation-${appearance}.png`, scale: "css" });
    }
  });
}
