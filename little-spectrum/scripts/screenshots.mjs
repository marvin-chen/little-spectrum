#!/usr/bin/env node
// Archives a labeled set of screenshots of every page and game so the design can be compared over time.
// Usage: pnpm shots [label] [Playwright test paths/options]   (needs a running server on E2E_BASE_URL or http://localhost:3000)
import { execSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const base = process.env.E2E_BASE_URL ?? "http://localhost:3000";
try {
  const res = await fetch(`${base}/welcome`);
  if (!res.ok) throw new Error(String(res.status));
} catch {
  console.error(`No server at ${base}. Start \`pnpm dev\` (or set E2E_BASE_URL) and run again.`);
  process.exit(1);
}

const sha = (() => {
  try {
    return execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim();
  } catch {
    return "nogit";
  }
})();
const date = new Date().toISOString().slice(0, 10);
const label = process.argv[2] ?? `${date}-${sha}`;
const dir = path.resolve("screenshots", label);
if (existsSync(dir)) {
  console.error(`${dir} already exists. Pass a different label.`);
  process.exit(1);
}
mkdirSync(dir, { recursive: true });

const result = spawnSync(
  "pnpm",
  ["exec", "playwright", "test", "--project=mobile-chromium", ...process.argv.slice(3)],
  {
    stdio: "inherit",
    env: { ...process.env, E2E_SHOTS: dir, E2E_BASE_URL: base },
  },
);

const files = readdirSync(dir)
  .filter((f) => f.endsWith(".png"))
  .sort();
const total = files.reduce((n, f) => n + statSync(path.join(dir, f)).size, 0);
const lines = [
  `# Screenshots ${label}`,
  "",
  `Captured ${new Date().toISOString()} from commit ${sha} at 390px CSS width (1x) unless labelled otherwise. layout-* captures include 820px tablet, 1280px desktop, and 200% text; production desktop captures use 1440px. Full-page captures draw the fixed tab bar mid-page, use the -viewport files for exact framing.`,
  "",
  ...files.map((f) => `- ![${f}](./${f})`),
  "",
  `${files.length} files, ${(total / 1024 / 1024).toFixed(1)} MB.`,
];
writeFileSync(path.join(dir, "README.md"), lines.join("\n") + "\n");
console.log(`\nArchived ${files.length} screenshots in screenshots/${label} (${(total / 1024 / 1024).toFixed(1)} MB).`);
process.exit(result.status ?? 1);
