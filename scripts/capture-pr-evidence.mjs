import { chromium } from "@playwright/test";
import { createServer } from "vite";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const EVIDENCE_DIR = path.resolve(".github/pr-evidence");
if (!fs.existsSync(EVIDENCE_DIR)) {
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
}

function getRawGitHubBaseUrl() {
  let repoSlug = "yq-web-studio/faizane-madina-frontend";
  let ref = "main";

  try {
    const remoteUrl = execSync("git remote get-url origin", { encoding: "utf8" }).trim();
    const match = remoteUrl.match(/github\.com[:/]([^/]+\/[^/.]+?)(?:\.git)?$/i);
    if (match) {
      repoSlug = match[1];
    }
  } catch {
    // Fall back to default repository slug
  }

  try {
    const branch = execSync("git rev-parse --abbrev-ref HEAD", { encoding: "utf8" }).trim();
    if (branch && branch !== "HEAD") {
      ref = branch;
    } else {
      ref = execSync("git rev-parse HEAD", { encoding: "utf8" }).trim();
    }
  } catch {
    // Fall back to default ref
  }

  return `https://raw.githubusercontent.com/${repoSlug}/${ref}`;
}

async function run() {
  console.log("Starting in-process Vite server...");
  const server = await createServer({
    server: { port: 5173, strictPort: true },
  });
  await server.listen();
  console.log("Vite server listening on http://localhost:5173");

  let browser;
  try {
    browser = await chromium.launch({ channel: "chrome", headless: true });
    const page = await browser.newPage({
      viewport: { width: 1280, height: 900 },
    });

    await page.goto("http://localhost:5173", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);

    const announcements = page.locator("section#announcements").first();
    await announcements.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    const filename = "announcements-reposition.png";
    const screenshotPath = path.join(EVIDENCE_DIR, filename);
    await page.screenshot({ path: screenshotPath });

    console.log(`Saved screenshot to ${screenshotPath}`);

    const rawUrl = `${getRawGitHubBaseUrl()}/.github/pr-evidence/${filename}`;
    console.log("\n| Change Demonstrated | Preview |");
    console.log("| :--- | :--- |");
    console.log(
      `| Announcements repositioned immediately before Services | <img src="${rawUrl}" width="650" /> |`
    );
  } catch (err) {
    console.error("Evidence capture error:", err);
    process.exitCode = 1;
  } finally {
    if (browser) {
      await browser.close();
    }
    await server.close();
  }
}

run();
