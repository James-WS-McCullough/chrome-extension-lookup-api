import type { Server } from "node:http";
import { flushPromises, mount, type VueWrapper } from "@vue/test-utils";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { app } from "../../../local-api/src/app";
import App from "../../src/App.vue";
import { useLookupStore } from "../../src/stores/lookup-store";

let server: Server;
let apiPort: number;

beforeAll(async () => {
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => {
      const address = server.address();
      apiPort = typeof address === "object" && address ? address.port : 0;
      resolve();
    });
  });
});

afterAll(async () => {
  await new Promise<void>((resolve) => {
    server.close(() => resolve());
  });
});

const waitFor = async (assertion: () => void, timeout = 3000, interval = 50) => {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      await flushPromises();
      assertion();
      return;
    } catch {
      await new Promise((r) => setTimeout(r, interval));
    }
  }
  await flushPromises();
  assertion();
};

const completeButtonTransition = async (wrapper: VueWrapper) => {
  const transition = wrapper.findComponent({ name: "Transition" });
  if (transition.exists()) {
    transition.props("onAfterLeave")?.();
    await flushPromises();
  }
};

const stubChrome = (url: string, scrapedAuthor: string | null = "Albert Einstein") => {
  vi.stubGlobal("chrome", {
    tabs: {
      query: vi.fn().mockResolvedValue([{ id: 1, url }]),
    },
    scripting: {
      executeScript: vi.fn().mockResolvedValue([{ result: scrapedAuthor }]),
    },
  });
};

vi.mock("../../src/gateways/author-gateway", async (importOriginal) => {
  const original = await importOriginal<typeof import("../../src/gateways/author-gateway")>();
  return {
    ...original,
    fetchAuthorData: async (authorName: string) => {
      const url = `http://localhost:${apiPort}/author-data?author=${encodeURIComponent(authorName)}`;
      const response = await fetch(url);

      if (response.status === 404) {
        throw new Error("Author not found");
      }

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      return response.json();
    },
  };
});

describe("popup e2e", () => {
  afterEach(() => {
    useLookupStore().$reset();
    vi.restoreAllMocks();
  });

  describe("on unsupported page", () => {
    beforeEach(() => {
      stubChrome("https://example.com");
    });

    it("shows the unsupported page message", async () => {
      const wrapper = mount(App);
      await flushPromises();

      expect(wrapper.text()).toContain("quotes.toscrape.com");
      expect(wrapper.findComponent({ name: "IconBadge" }).exists()).toBe(true);
    });

    it("does not show the lookup button", async () => {
      const wrapper = mount(App);
      await flushPromises();

      expect(wrapper.find("button").exists()).toBe(false);
    });

    it("still shows the title", async () => {
      const wrapper = mount(App);
      await flushPromises();

      expect(wrapper.find("h1").text()).toContain("Author Lookup");
    });
  });

  describe("on supported page", () => {
    it("shows the idle info card and lookup button", async () => {
      stubChrome("https://quotes.toscrape.com/");
      const wrapper = mount(App);
      await flushPromises();

      expect(wrapper.text()).toContain("Press the button");
      expect(wrapper.find("button").exists()).toBe(true);
    });
  });

  describe("successful lookup", () => {
    beforeEach(() => {
      stubChrome("https://quotes.toscrape.com/");
    });

    it("scrapes the page, calls the real API, and displays author data", async () => {
      const wrapper = mount(App);
      await flushPromises();

      await wrapper.find("button").trigger("click");
      await flushPromises();

      expect(vi.mocked(chrome.scripting.executeScript)).toHaveBeenCalledWith(
        expect.objectContaining({ target: { tabId: 1 } }),
      );

      await waitFor(() => {
        const btn = wrapper.findComponent({ name: "LookupButton" });
        expect(btn.exists()).toBe(false);
      });

      await completeButtonTransition(wrapper);
      await flushPromises();

      expect(wrapper.text()).toContain("Albert Einstein");

      expect(wrapper.text()).toContain("Science & Philosophy");
      expect(wrapper.text()).toContain("medium");
      expect(wrapper.text()).toContain("60 req/min");
    });
  });

  describe("author not found", () => {
    beforeEach(() => {
      stubChrome("https://quotes.toscrape.com/", "Nonexistent Author ZZZZZ");
    });

    it("displays an error when the API returns 404", async () => {
      const wrapper = mount(App);
      await flushPromises();

      await wrapper.find("button").trigger("click");

      await waitFor(() => {
        expect(wrapper.text()).toContain(
          '"Nonexistent Author ZZZZZ" was not found in the database',
        );
      });

      expect(wrapper.findComponent({ name: "IconBadge" }).exists()).toBe(true);
    });
  });

  describe("no author on page", () => {
    beforeEach(() => {
      stubChrome("https://quotes.toscrape.com/", null);
    });

    it("displays an error when no author is found on the page", async () => {
      const wrapper = mount(App);
      await flushPromises();

      await wrapper.find("button").trigger("click");
      await flushPromises();

      expect(wrapper.text()).toContain("Could not find an author on this page");
    });
  });
});
