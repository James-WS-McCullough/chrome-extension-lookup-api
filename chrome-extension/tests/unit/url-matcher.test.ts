import { describe, expect, it } from "vitest";
import { isQuotesPage } from "../../src/utils/url-matcher";

describe("isQuotesPage", () => {
  it("returns true for the quotes homepage", () => {
    expect(isQuotesPage("https://quotes.toscrape.com/")).toBe(true);
  });

  it("returns true for a subpath", () => {
    expect(isQuotesPage("https://quotes.toscrape.com/page/2/")).toBe(true);
  });

  it("returns true for the base URL without trailing slash", () => {
    expect(isQuotesPage("https://quotes.toscrape.com")).toBe(true);
  });

  it("returns false for http version", () => {
    expect(isQuotesPage("http://quotes.toscrape.com/")).toBe(false);
  });

  it("returns false for other domains", () => {
    expect(isQuotesPage("https://example.com")).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(isQuotesPage("")).toBe(false);
  });
});
