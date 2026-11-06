import { expect, test, type Page } from "@playwright/test";
import { GAME_KEYS } from "../../src/lib/games";
import { shot } from "./helpers";

async function checkLayout(page: Page, columns: boolean, count: number) {
  const layout = page.getByTestId("game-session-layout");
  const interaction = layout.getByRole("region", { name: "Game interaction" });
  const guide = layout.getByRole("complementary", { name: "Round guide" });
  await expect(interaction).toBeVisible();
  await expect(guide.getByRole("heading", { name: "How to play" })).toBeVisible();
  await expect(guide.getByRole("list", { name: "Players" }).getByRole("listitem")).toHaveCount(count);
  await expect.poll(async () => layout.evaluate((element, sideBySide) => {
    const a = element.querySelector('[aria-label="Game interaction"]')!.getBoundingClientRect();
    const b = element.querySelector('[aria-label="Round guide"]')!.getBoundingClientRect();
    return {
      arranged: sideBySide ? b.x >= a.right && b.y < a.y + 60 : b.y >= a.bottom && Math.abs(b.x - a.x) < 2,
      fits: document.documentElement.scrollWidth <= innerWidth,
    };
  }, columns)).toEqual({ arranged: true, fits: true });
}

for (const game of GAME_KEYS) {
  test(`${game} shares a responsive round guide across roles and states`, async ({ page }) => {
    const external: string[] = [];
    page.on("request", (r) => {
      if (!["GET", "HEAD"].includes(r.method()) || /\/auth\/v1|\/rest\/v1|\/storage\/v1/.test(r.url())) external.push(r.url());
    });
    page.on("websocket", (socket) => { if (!socket.url().includes("/_next/hmr")) external.push(socket.url()); });
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const width of [390, 820, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ colorScheme: width === 820 ? "dark" : "light" });
      for (const scenario of ["initial", "answering", "waiting", "early", "revealed"]) {
        const count = scenario === "initial" ? 2 : 8;
        await page.goto(`/styleguide/games?game=${game}&scenario=${scenario}&players=${count}&viewer=${scenario === "initial" ? "first" : "last"}`);
        await checkLayout(page, width >= 1280, count);
        const players = page.getByRole("list", { name: "Players", exact: true });
        await expect(players).toContainText((scenario === "revealed" || scenario === "early") ? "Round finished" : scenario === "waiting" ? "Submitted" : "Pending");
        if (scenario === "answering" || scenario === "revealed") {
          await page.getByTestId("game-session-layout").scrollIntoViewIfNeeded();
          await shot(page, `layout-${game}-${width}-${scenario}`);
        }
      }
      // Larger text must reflow into a single column even in a desktop viewport.
      await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
      await checkLayout(page, false, 8);
      if (width === 1280) await shot(page, `layout-${game}-200-percent-text`);
      await page.evaluate(() => { document.documentElement.style.fontSize = ""; });
    }
    expect(external).toEqual([]);
  });
}

test("resizing preserves keyboard input, focus and instruction access", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "dark" });
  await page.goto("/styleguide/games?game=hue-knew&scenario=initial&players=8");
  const clue = page.getByPlaceholder("Your clue", { exact: true });
  await clue.focus();
  await page.keyboard.type("A long summer evening with friends");
  for (const width of [1280, 820, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(clue).toBeFocused();
    await expect(clue).toHaveValue("A long summer evening with friends");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "Send clue", exact: true })).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(clue).toBeFocused();
    await checkLayout(page, width >= 1280, 8);
    await shot(page, `layout-keyboard-dark-${width}`);
  }
});
