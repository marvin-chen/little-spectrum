import { expect, type Browser, type BrowserContext, type Page } from "@playwright/test";

export type Player = { context: BrowserContext; page: Page; name: string };

export async function newPlayer(browser: Browser, name: string, options: { width?: number } = {}): Promise<Player> {
  const context = await browser.newContext(
    options.width ? { viewport: { width: options.width, height: 900 } } : undefined,
  );
  const page = await context.newPage();
  return { context, page, name };
}

export async function createProfile(page: Page, name: string, next = "/start") {
  await page.goto(`/welcome?next=${encodeURIComponent(next)}`);
  await page.getByLabel("Display name").fill(name);
  await page.getByRole("button", { name: /Continue/ }).click();
  await page.waitForURL((url) => !url.pathname.startsWith("/welcome"));
}

export async function createGarden(page: Page, name: string, size: "two" | "group") {
  await page.goto("/start");
  await page.getByRole("radio", { name: size === "two" ? "Just us two" : "A group of friends" }).click();
  await page.getByLabel("Garden name").fill(name);
  await page.getByRole("button", { name: "Create garden" }).click();
  await page.waitForURL(/\/g\/[0-9a-f-]{36}/);
  const gardenId = page.url().match(/\/g\/([0-9a-f-]{36})/)![1];
  return gardenId;
}

export async function inviteUrlFor(page: Page, gardenId: string): Promise<string> {
  await page.goto(`/g/${gardenId}/settings`);
  const text = await page.locator("text=/\\/join\\//").first().textContent();
  const match = text?.match(/https?:\/\/\S+\/join\/[A-Za-z0-9_-]+/);
  expect(match, "invite url visible in settings").toBeTruthy();
  return match![0].replace(/^https?:\/\/[^/]+/, "");
}

export async function joinGarden(page: Page, invitePath: string, name: string) {
  await page.goto(invitePath);
  await page.getByRole("link", { name: "Pick a name to join" }).click();
  await page.getByLabel("Display name").fill(name);
  await page.getByRole("button", { name: /Continue/ }).click();
  await page.waitForURL(/\/join\//);
  await page.getByRole("button", { name: /^Join / }).click();
  await page.waitForURL(/\/g\/[0-9a-f-]{36}/);
}

// Saves a full-page screenshot when E2E_SHOTS points at a directory.
export async function shot(page: Page, name: string) {
  const dir = process.env.E2E_SHOTS;
  if (!dir) return;
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${dir}/${name}.png`, fullPage: true });
  await page.screenshot({ path: `${dir}/${name}-viewport.png` });
}
