import { expect, test, type Browser } from "@playwright/test";
import { createGarden, createProfile, newPlayer } from "./helpers";

const MAIL_API = process.env.MAILPIT_URL ?? "http://127.0.0.1:54324";

async function latestLinkFor(email: string): Promise<string> {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const list = (await (await fetch(`${MAIL_API}/api/v1/messages?limit=20`)).json()) as {
      messages: Array<{ ID: string; To: Array<{ Address: string }> }>;
    };
    const match = list.messages.find((m) => m.To.some((t) => t.Address.toLowerCase() === email));
    if (match) {
      const message = (await (await fetch(`${MAIL_API}/api/v1/message/${match.ID}`)).json()) as {
        HTML: string;
        Text: string;
      };
      const body = `${message.HTML}\n${message.Text}`;
      const link = body.match(/https?:\/\/[^\s"'<>]+auth\/v1\/verify[^\s"'<>]*type=magiclink[^\s"'<>]*/)?.[0];
      if (link) return link.replace(/&amp;/g, "&");
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`no sign-in email for ${email}`);
}

async function keepAccount(browser: Browser, email: string) {
  const ada = await newPlayer(browser, "Ada");
  await createProfile(ada.page, "Ada");
  const gardenId = await createGarden(ada.page, "Kept garden", "two");

  // Attach the email from Settings. Local Supabase auto-confirms, so the account is kept right away.
  await ada.page.goto(`/g/${gardenId}/settings`);
  await ada.page.getByRole("button", { name: /Keep this account/ }).click();
  await ada.page.getByLabel("Email").fill(email);
  await ada.page.getByRole("button", { name: "Send confirmation" }).click();
  await expect(ada.page.getByText(`Done. ${email} is attached to this account.`)).toBeVisible();
  await ada.page.getByRole("button", { name: "Got it" }).click();
  await expect(ada.page.getByText("Account kept")).toBeVisible();
  return gardenId;
}

test("a sign-in link never sends the person to another site", async ({ browser, baseURL }) => {
  const email = `redirect-${Date.now()}@example.com`;
  await keepAccount(browser, email);

  const phone = await newPlayer(browser, "Ada on a new phone");
  const offsite: string[] = [];
  phone.page.on("request", (request) => {
    if (new URL(request.url()).hostname === "evil.example") offsite.push(request.url());
  });
  await phone.page.goto(`/signin?next=${encodeURIComponent("/\t/evil.example/phish")}`);
  await phone.page.getByLabel("Email").fill(email);
  await phone.page.getByRole("button", { name: "Email me a sign-in link" }).click();
  await expect(phone.page.getByText("Check your email")).toBeVisible();
  // An off-site redirect cannot be resolved here, so the assertions below report it instead of the navigation error.
  await phone.page.goto(await latestLinkFor(email)).catch(() => undefined);

  expect(offsite).toEqual([]);
  expect(new URL(phone.page.url()).origin).toBe(new URL(baseURL!).origin);
});

test("a guest keeps the account with an email and signs in again on a new device", async ({ browser }) => {
  const email = `keeper-${Date.now()}@example.com`;
  const gardenId = await keepAccount(browser, email);

  // A brand new browser asks for a link and lands back in the garden.
  const phone = await newPlayer(browser, "Ada on a new phone");
  await phone.page.goto("/signin");
  await phone.page.getByLabel("Email").fill(email);
  await phone.page.getByRole("button", { name: "Email me a sign-in link" }).click();
  await expect(phone.page.getByText("Check your email")).toBeVisible();
  const link = await latestLinkFor(email);
  await phone.page.goto(link);
  await phone.page.waitForURL(`**/g/${gardenId}`);
  await expect(phone.page.getByRole("heading", { name: "Kept garden" })).toBeVisible();

  // Unknown emails get a clear message instead of a silent no-op.
  const stranger = await newPlayer(browser, "Stranger");
  await stranger.page.goto("/signin");
  await stranger.page.getByLabel("Email").fill(`nobody-${Date.now()}@example.com`);
  await stranger.page.getByRole("button", { name: "Email me a sign-in link" }).click();
  await expect(stranger.page.getByText(/No account uses that email yet/)).toBeVisible();

  // Signing out keeps the data.
  await phone.page.goto(`/g/${gardenId}/settings`);
  await phone.page.getByRole("button", { name: "Sign out on this device" }).click();
  await phone.page.getByRole("button", { name: "Sign out", exact: true }).click();
  await phone.page.waitForURL("**/");
  await expect(phone.page.getByRole("link", { name: "Get started" })).toBeVisible();
});
