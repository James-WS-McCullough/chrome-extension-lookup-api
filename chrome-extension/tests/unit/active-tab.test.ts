import { afterEach, describe, expect, it, vi } from "vitest";
import { getActiveTab } from "../../src/utils/active-tab";

const stubChromeTabs = (tabs: Partial<chrome.tabs.Tab>[]) => {
  vi.stubGlobal("chrome", {
    tabs: {
      query: vi.fn().mockImplementation(({ active }: { active?: boolean }) => {
        const filtered = active ? tabs.filter((t) => t.active) : tabs;
        return Promise.resolve(filtered);
      }),
    },
  });
};

describe("getActiveTab", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns the active tab when it is browsable", async () => {
    stubChromeTabs([
      { id: 1, url: "https://example.com", active: false },
      { id: 2, url: "https://quotes.toscrape.com/", active: true },
    ]);

    const tab = await getActiveTab();
    expect(tab?.id).toBe(2);
  });

  it("queries only the active tab in the current window", async () => {
    stubChromeTabs([{ id: 1, url: "https://example.com", active: true }]);

    await getActiveTab();
    expect(chrome.tabs.query).toHaveBeenCalledWith({ active: true, currentWindow: true });
  });

  it("returns undefined when the active tab is a chrome:// page", async () => {
    stubChromeTabs([
      { id: 1, url: "chrome://extensions/", active: true },
      { id: 2, url: "https://example.com", active: false },
    ]);

    const tab = await getActiveTab();
    expect(tab).toBeUndefined();
  });

  it("returns undefined when the active tab is about:blank", async () => {
    stubChromeTabs([
      { id: 1, url: "about:blank", active: true },
      { id: 2, url: "https://example.com", active: false },
    ]);

    const tab = await getActiveTab();
    expect(tab).toBeUndefined();
  });

  it("returns undefined when the active tab is a chrome-extension:// page", async () => {
    stubChromeTabs([
      { id: 1, url: "chrome-extension://abc123/popup.html", active: true },
      { id: 2, url: "https://example.com", active: false },
    ]);

    const tab = await getActiveTab();
    expect(tab).toBeUndefined();
  });

  it("returns undefined when the active tab has no url property", async () => {
    stubChromeTabs([
      { id: 1, active: true },
      { id: 2, url: "https://example.com", active: false },
    ]);

    const tab = await getActiveTab();
    expect(tab).toBeUndefined();
  });

  it("returns undefined when no tabs exist", async () => {
    stubChromeTabs([]);

    const tab = await getActiveTab();
    expect(tab).toBeUndefined();
  });

  it("returns the active tab for http:// URLs", async () => {
    stubChromeTabs([{ id: 1, url: "http://localhost:3000", active: true }]);

    const tab = await getActiveTab();
    expect(tab?.id).toBe(1);
  });
});
