import { afterEach, describe, expect, it, vi } from "vitest";
import { getActiveTab } from "../../src/utils/active-tab";

const stubChromeTabs = (tabs: Partial<chrome.tabs.Tab>[]) => {
  vi.stubGlobal("chrome", {
    tabs: {
      query: vi.fn().mockResolvedValue(tabs),
    },
  });
};

describe("getActiveTab", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns the active browsable tab", async () => {
    stubChromeTabs([
      { id: 1, url: "about:blank", active: false },
      { id: 2, url: "https://quotes.toscrape.com/", active: true },
    ]);

    const tab = await getActiveTab();
    expect(tab?.id).toBe(2);
  });

  it("skips chrome-extension:// tabs", async () => {
    stubChromeTabs([
      { id: 1, url: "https://example.com", active: false },
      { id: 2, url: "chrome-extension://abc123/popup.html", active: true },
    ]);

    const tab = await getActiveTab();
    expect(tab?.id).toBe(1);
  });

  it("skips about:blank tabs", async () => {
    stubChromeTabs([
      { id: 1, url: "about:blank", active: false },
      { id: 2, url: "https://example.com", active: false },
    ]);

    const tab = await getActiveTab();
    expect(tab?.id).toBe(2);
  });

  it("skips chrome:// tabs", async () => {
    stubChromeTabs([
      { id: 1, url: "chrome://extensions/", active: true },
      { id: 2, url: "https://example.com", active: false },
    ]);

    const tab = await getActiveTab();
    expect(tab?.id).toBe(2);
  });

  it("prefers the active browsable tab over inactive ones", async () => {
    stubChromeTabs([
      { id: 1, url: "https://other.com", active: false },
      { id: 2, url: "https://quotes.toscrape.com/", active: true },
    ]);

    const tab = await getActiveTab();
    expect(tab?.id).toBe(2);
  });

  it("falls back to the first browsable tab when none are active", async () => {
    stubChromeTabs([
      { id: 1, url: "chrome-extension://abc/popup.html", active: true },
      { id: 2, url: "https://first.com", active: false },
      { id: 3, url: "https://second.com", active: false },
    ]);

    const tab = await getActiveTab();
    expect(tab?.id).toBe(2);
  });

  it("returns undefined when no browsable tabs exist", async () => {
    stubChromeTabs([
      { id: 1, url: "about:blank", active: true },
      { id: 2, url: "chrome://extensions/", active: false },
    ]);

    const tab = await getActiveTab();
    expect(tab).toBeUndefined();
  });

  it("handles tabs with no url property", async () => {
    stubChromeTabs([
      { id: 1, active: true },
      { id: 2, url: "https://example.com", active: false },
    ]);

    const tab = await getActiveTab();
    expect(tab?.id).toBe(2);
  });
});
