import type { Server } from "node:http";
import path from "node:path";
import { type BrowserContext, chromium, expect, type Page, test } from "@playwright/test";
import { app } from "../../../local-api/src/app";

const QUOTES_PAGE_HTML = `
<!DOCTYPE html>
<html>
<body>
  <div class="quote">
    <span class="text">"The world as we have created it is a process of our thinking."</span>
    <small class="author">Albert Einstein</small>
  </div>
  <div class="quote">
    <span class="text">"It is our choices that show what we truly are."</span>
    <small class="author">J.K. Rowling</small>
  </div>
</body>
</html>
`;

const QUOTES_PAGE_NO_AUTHOR_HTML = `
<!DOCTYPE html>
<html>
<body>
  <div>No quotes on this page</div>
</body>
</html>
`;

let server: Server;
let context: BrowserContext;
let extensionId: string;

const extensionPath = path.resolve(import.meta.dirname, "../..");

test.beforeAll(async () => {
  await new Promise<void>((resolve) => {
    server = app.listen(3000, () => resolve());
  });

  context = await chromium.launchPersistentContext("", {
    headless: false,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
      "--no-first-run",
      "--disable-gpu",
      "--headless=new",
    ],
  });

  let serviceWorker = context.serviceWorkers()[0];
  if (!serviceWorker) {
    serviceWorker = await context.waitForEvent("serviceworker");
  }
  extensionId = serviceWorker.url().split("/")[2];
});

test.afterAll(async () => {
  await context.close();
  await new Promise<void>((resolve) => {
    server.close(() => resolve());
  });
});

const popupUrl = () => `chrome-extension://${extensionId}/popup.html`;

const openPopupOnPage = async (url: string, html?: string): Promise<{ popup: Page; tab: Page }> => {
  const tab = await context.newPage();

  if (html) {
    await tab.route(url, (route) => route.fulfill({ contentType: "text/html", body: html }));
  }
  await tab.goto(url);

  const popup = await context.newPage();
  await popup.goto(popupUrl());
  await popup.waitForLoadState("domcontentloaded");

  return { popup, tab };
};

test.describe("unsupported page", () => {
  test("shows the info card directing user to quotes.toscrape.com", async () => {
    const { popup, tab } = await openPopupOnPage("https://example.com");

    await expect(popup.locator("h1")).toContainText("Author Lookup");
    await expect(popup.locator(".icon-badge--info")).toBeVisible();
    await expect(popup.getByText("quotes.toscrape.com")).toBeVisible();
    await expect(popup.locator("button")).toBeHidden();

    await popup.close();
    await tab.close();
  });
});

test.describe("supported page — successful lookup", () => {
  test("scrapes the author, calls the real API, and displays the author card", async () => {
    const { popup, tab } = await openPopupOnPage("https://quotes.toscrape.com/", QUOTES_PAGE_HTML);

    await expect(popup.getByText("Press the button")).toBeVisible({ timeout: 5000 });
    await popup.locator("button").click();

    await expect(popup.getByText("Albert Einstein")).toBeVisible({ timeout: 5000 });
    await expect(popup.getByText("Science & Philosophy")).toBeVisible();
    await expect(popup.getByText("medium")).toBeVisible();
    await expect(popup.getByText("60 req/min")).toBeVisible();

    await popup.close();
    await tab.close();
  });
});

test.describe("supported page — author not found", () => {
  test("displays an error when the author is not in the database", async () => {
    const unknownAuthorHtml = `
      <html><body><small class="author">Nonexistent Author ZZZZZ</small></body></html>
    `;
    const { popup, tab } = await openPopupOnPage("https://quotes.toscrape.com/", unknownAuthorHtml);

    await expect(popup.locator("button")).toBeVisible({ timeout: 5000 });
    await popup.locator("button").click();

    await expect(popup.locator(".icon-badge--error")).toBeVisible({ timeout: 5000 });
    await expect(popup.getByText("was not found in the database")).toBeVisible();

    await popup.close();
    await tab.close();
  });
});

test.describe("supported page — no author on page", () => {
  test("displays an error when no author element exists", async () => {
    const { popup, tab } = await openPopupOnPage(
      "https://quotes.toscrape.com/",
      QUOTES_PAGE_NO_AUTHOR_HTML,
    );

    await expect(popup.locator("button")).toBeVisible({ timeout: 5000 });
    await popup.locator("button").click();

    await expect(popup.locator(".icon-badge--error")).toBeVisible({ timeout: 5000 });
    await expect(popup.getByText("Could not find an author on this page")).toBeVisible();

    await popup.close();
    await tab.close();
  });
});
