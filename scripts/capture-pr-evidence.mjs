import { chromium } from "@playwright/test";
import { createServer } from "vite";
import fs from "fs";
import path from "path";

const EVIDENCE_DIR = path.resolve(".github/pr-evidence");
if (!fs.existsSync(EVIDENCE_DIR)) {
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
}

async function run() {
  console.log("Starting in-process Vite server...");
  const server = await createServer({
    server: { port: 5173 },
  });
  await server.listen();
  console.log("Vite server listening on http://localhost:5173");

  try {
    const browser = await chromium.launch({ channel: "chrome", headless: true });
    const page = await browser.newPage({
      viewport: { width: 1280, height: 900 },
    });

    await page.goto("http://localhost:5173", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);

    const announcements = page.locator("section#announcements").first();
    await announcements.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    const screenshotPath = path.join(EVIDENCE_DIR, "announcements-reposition.png");
    await page.screenshot({ path: screenshotPath });

    console.log(`Saved screenshot to ${screenshotPath}`);
    await browser.close();

    console.log("\n| Change Demonstrated | Preview |");
    console.log("| :--- | :--- |");
    console.log("| Announcements repositioned immediately before Services | ![Announcements Relocated](.github/pr-evidence/announcements-reposition.png) |");
  } catch (err) {
    console.error("Evidence capture error:", err);
  } finally {
    await server.close();
  }
}

run();
