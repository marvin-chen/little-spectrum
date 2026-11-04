import { expect, test } from "@playwright/test";

test("fields expose help text as an accessible description", async ({ page }) => {
  await page.goto("/styleguide");
  await expect(page.getByRole("textbox", { name: "Garden name", exact: true })).toHaveAccessibleDescription("Up to 40 characters.");
});
