import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchAuthorData } from "../../src/services/author-api";

const mockAuthorResponse = {
  author: "Albert Einstein",
  profile: {
    category: "Science & Philosophy",
    personaTags: ["deep-thoughts", "thinking", "world"],
    difficulty: "medium",
  },
  recommendedActions: [
    "Highlight key assumptions before building automations",
    "Prefer simple models first, then iterate",
  ],
  integrationHints: {
    preferredAuth: "API key",
    rateLimitPerMinute: 60,
    notes: "Use caching for repeated lookups by author",
  },
  samplePayloads: [
    { type: "insight", title: "Reduce complexity", value: "Start with a minimal viable flow." },
    { type: "metric", title: "Clarity score", value: 92 },
  ],
};

describe("fetchAuthorData", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns author data on success", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockAuthorResponse),
    } as Response);

    const result = await fetchAuthorData("Albert Einstein");
    expect(result).toEqual(mockAuthorResponse);
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3000/author-data?author=Albert%20Einstein",
    );
  });

  it("throws on 404 response", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ error: "Author not found" }),
    } as Response);

    await expect(fetchAuthorData("unknown")).rejects.toThrow("Author not found");
  });

  it("throws on non-OK response", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({}),
    } as Response);

    await expect(fetchAuthorData("test")).rejects.toThrow("Request failed with status 500");
  });

  it("throws on network error", async () => {
    vi.mocked(fetch).mockRejectedValue(new TypeError("Failed to fetch"));

    await expect(fetchAuthorData("test")).rejects.toThrow("Failed to fetch");
  });
});
