import { expect, test } from "@playwright/test";
import { createGarden, createProfile, inviteUrlFor, newPlayer, shot } from "./helpers";

test("the creator designs the invite card and friends see it on the link and in the preview image", async ({ browser, request }) => {
  const ada = await newPlayer(browser, "Ada");
  await createProfile(ada.page, "Ada");
  const gardenId = await createGarden(ada.page, "Porch club", "group");
  const invite = await inviteUrlFor(ada.page, gardenId);

  // Default card is visible in Settings, then the creator redesigns it.
  await ada.page.goto(`/g/${gardenId}/settings`);
  await expect(ada.page.getByRole("heading", { name: "Come grow a garden with me" })).toBeVisible();
  await ada.page.getByRole("button", { name: "Design the card" }).click();
  const dialog = ada.page.getByRole("dialog");
  await dialog.getByRole("radio", { name: "Ticket" }).click();
  await dialog.getByLabel("Headline").fill("Thursday nights are for the porch");
  await dialog.getByLabel(/A note from you/).fill("Bring snacks. Lose gracefully.");
  await dialog.getByRole("radio", { name: "Hue Clue" }).click();
  await dialog.getByRole("radio", { name: "Violet" }).click();
  await expect(dialog.getByText("Admit one · Porch club")).toBeVisible();
  await shot(ada.page, "invite-editor");
  await dialog.getByRole("button", { name: "Save card" }).click();
  await expect(dialog).toBeHidden();
  await expect(ada.page.getByRole("heading", { name: "Thursday nights are for the porch" })).toBeVisible();

  // A friend opens the link and lands on the same card.
  const bo = await newPlayer(browser, "Bo");
  await bo.page.goto(invite);
  await expect(bo.page.getByText("Thursday nights are for the porch").first()).toBeVisible();
  await expect(bo.page.getByText("Bring snacks. Lose gracefully.")).toBeVisible();
  await expect(bo.page.getByText("Admit one · Porch club")).toBeVisible();
  await shot(bo.page, "invite-landing-ticket");

  // The link preview image renders as a PNG and the page advertises it.
  const html = await bo.page.content();
  expect(html).toContain('property="og:image"');
  expect(html).toContain("/opengraph-image");
  const image = await request.get(`${invite}/opengraph-image`);
  expect(image.status()).toBe(200);
  expect(image.headers()["content-type"]).toContain("image/png");
  expect((await image.body()).length).toBeGreaterThan(10_000);

  // A dead link gets a clear image too, never a server error.
  const dead = await request.get("/join/notarealtokennotarealtokennotareal/opengraph-image");
  expect(dead.status()).toBe(200);
  expect(dead.headers()["content-type"]).toContain("image/png");

  // Other layouts, for the archive.
  for (const layout of ["Poster", "Postcard"] as const) {
    await ada.page.getByRole("button", { name: "Design the card" }).click();
    await ada.page.getByRole("dialog").getByRole("radio", { name: layout }).click();
    await ada.page.getByRole("dialog").getByRole("button", { name: "Save card" }).click();
    await expect(ada.page.getByRole("dialog")).toBeHidden();
    await bo.page.goto(invite);
    await shot(bo.page, `invite-landing-${layout.toLowerCase()}`);
  }
  if (process.env.E2E_SHOTS) {
    const png = await request.get(`${invite}/opengraph-image`);
    const { writeFileSync } = await import("node:fs");
    writeFileSync(`${process.env.E2E_SHOTS}/invite-preview-image.png`, await png.body());
  }
});
