import { expect, test } from "@playwright/test";
import { shot } from "./helpers";
import sharp from "sharp";

test("clue-giver errors retry locally and completed games restart in the fixture route", async ({ page }) => {
  const writes: string[] = [];
  page.on("request", (r) => {
    if (!["GET", "HEAD"].includes(r.method())) writes.push(r.url());
  });
  await page.goto("/styleguide/games?game=hue-knew&scenario=error&players=2");
  await expect(page.getByRole("region", { name: "Play preview" }).getByRole("alert")).toContainText(
    "Simulated request failed",
  );
  await page.getByPlaceholder("Your clue").fill("Warm breeze");
  await page.getByRole("button", { name: "Send clue", exact: true }).click();
  await expect(
    page.getByRole("region", { name: "Play preview" }).getByText("Warm breeze", { exact: false }),
  ).toBeVisible();
  await page.goto("/styleguide/games?game=true-colors&scenario=revealed&players=2");
  await page.getByRole("button", { name: "Play another question", exact: true }).click();
  await expect(page).toHaveURL(/scenario=initial/);
  await expect(page.getByRole("radiogroup", { name: "Your answer", exact: true })).toBeVisible();
  expect(writes).toEqual([]);
});

for (const game of ["hue-knew", "hue-clue", "true-colors", "same-wavelength", "palette-picks", "color-quest"]) {
  test(`${game} preview holds, fails, and retries real controls without writes`, async ({ page }) => {
    const writes: string[] = [];
    page.on("request", (request) => {
      if (!["GET", "HEAD"].includes(request.method())) writes.push(request.url());
    });
    await page.goto(`/styleguide/games?game=${game}&scenario=answering&players=8&viewer=last`);
    if (game === "palette-picks") await expect.poll(() => page.getByRole("status").count()).toBeGreaterThan(1);
    await page.getByLabel("Fail next action", { exact: true }).check();
    await page.getByLabel("Hold next action pending", { exact: true }).check();
    const play = page.getByRole("region", { name: "Play preview" });
    let action;
    if (game === "true-colors") {
      await play.getByRole("radiogroup").nth(0).getByRole("radio").nth(1).check();
      await play.getByRole("radiogroup").nth(1).getByRole("radio").nth(2).check();
      action = play.getByRole("button", { name: "Lock in both", exact: true });
    } else if (game === "same-wavelength") {
      await play.getByRole("textbox").fill("Moon");
      action = play.getByRole("button", { name: "Lock in", exact: true });
    } else if (game === "hue-clue") {
      await play.getByRole("gridcell", { name: /^C3,/ }).click();
      action = play.getByRole("button", { name: "Confirm C3", exact: true });
    } else if (game === "hue-knew") {
      action = play.getByRole("button", { name: /^Lock in \d+$/ });
    } else if (game === "palette-picks") {
      await play
        .getByRole("button", { name: /Move .* down/ })
        .first()
        .click();
      action = play.getByRole("button", { name: "Confirm ranking", exact: true });
    } else {
      const buffer = await sharp({ create: { width: 40, height: 30, channels: 3, background: "#b1d5b6" } })
        .png()
        .toBuffer();
      await play
        .getByLabel("Choose a photo", { exact: true })
        .setInputFiles({ name: "fixture.png", mimeType: "image/png", buffer });
      await page.getByPlaceholder("A few words about it").fill("Local only");
      action = page.getByRole("button", { name: "Share photo", exact: true });
    }
    await action.click();
    await expect(action).toBeDisabled();
    await shot(page, `interactive-${game}-pending`);
    const dialog = page.getByRole("dialog");
    if (game === "color-quest")
      await dialog.getByRole("button", { name: "Finish pending action", exact: true }).click();
    else await page.getByRole("button", { name: "Finish pending action", exact: true }).click();
    await expect(page.getByRole("alert").filter({ hasText: "Simulated request failed" })).toBeVisible();
    await shot(page, `interactive-${game}-error`);
    if (game === "same-wavelength") await expect(play.getByRole("textbox")).toHaveValue("Moon");
    if (game === "color-quest") await expect(page.getByPlaceholder("A few words about it")).toHaveValue("Local only");
    await action.click();
    await expect(page.getByRole("status", { name: "Preview action status", exact: true })).toContainText(
      "Your preview submission is in",
    );
    await page.getByText("Viewer-safe fixture data", { exact: true }).click();
    const data = JSON.parse((await page.getByTestId("fixture-data").textContent())!);
    expect(data.turn.needsYou).toBe(false);
    expect(data.view.result ?? null).toBeNull();
    expect(data).not.toHaveProperty("secret");
    if (game === "true-colors") expect(data.view).toMatchObject({ myAnswer: 1, myPrediction: 2 });
    if (game === "color-quest") {
      expect(data.view.myPhoto.url).toMatch(/^blob:/);
      await play.getByRole("button", { name: "Delete my photo", exact: true }).click();
      await page.getByRole("button", { name: "Delete photo", exact: true }).click();
      await expect(play.locator("button").filter({ hasText: "Choose a photo" })).toBeVisible();
    }
    await shot(page, `interactive-${game}`);
    expect(writes).toEqual([]);
  });
}

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
    await page
      .getByRole("navigation", { name: "Fixture state" })
      .getByRole("link", { name: "initial", exact: true })
      .click();
    await expect(page.getByRole("region", { name: "Reveal preview" })).toHaveCount(0);
    await page.getByRole("link", { name: "Switch viewer" }).click();
    await expect(page.getByText(/Viewing as Harper/)).toBeVisible();
    await page.getByText("Viewer-safe fixture data", { exact: true }).click();
    const active = JSON.parse((await page.getByTestId("fixture-data").textContent())!);
    expect(active.view.myPhoto).toBeNull();
    expect(active.view.gallery).toBeNull();
    await page
      .getByRole("navigation", { name: "Fixture state" })
      .getByRole("link", { name: "early", exact: true })
      .click();
    await expect(page.getByRole("region", { name: "Reveal preview" })).toBeVisible();
    await expect(page.getByText("Didn't play this round", { exact: true })).toHaveCount(6);
    await page.getByRole("link", { name: "2 players", exact: true }).click();
    await expect(page.getByText(/· early · 2 players/)).toBeVisible();
    expect(errors).toEqual([]);
    expect(writes).toEqual([]);
  });
}

test("Palette Picks keeps server-rendered drag instructions and keyboard sorting accessible", async ({ page }) => {
  const hydrationErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error" && /hydrat|didn.t match/i.test(message.text())) hydrationErrors.push(message.text());
  });
  // A fresh browser load after another render exposes server-global ID counters.
  for (let visit = 0; visit < 2; visit++) {
    await page.goto("/styleguide/games?game=palette-picks&scenario=answering&players=8&viewer=last");
    const ranking = page.getByRole("list", { name: "Your ranking", exact: true });
    const handle = ranking.getByRole("button", { name: "Reorder Flight", exact: true });
    await handle.focus();
    const descriptionId = await handle.getAttribute("aria-describedby");
    expect(descriptionId).toBeTruthy();
    expect(await page.evaluate((id) => Boolean(document.getElementById(id!)), descriptionId)).toBe(true);
    await page.keyboard.press("Space");
    await expect(handle).toHaveAttribute("aria-pressed", "true");
    const dragStatus = page.getByRole("status", { name: "", exact: true });
    await expect(dragStatus).toContainText("over droppable area 0");
    await page.keyboard.press("ArrowDown");
    await expect(dragStatus).toContainText("over droppable area 1");
    await page.keyboard.press("Space");
    await expect(ranking.getByRole("listitem").nth(1)).toContainText("Flight");
    await expect(handle).toBeFocused();
    await expect(page.getByRole("status", { name: "Preview action status", exact: true })).toContainText(
      "Your ranking is needed",
    );
  }
  expect(hydrationErrors).toEqual([]);
});
