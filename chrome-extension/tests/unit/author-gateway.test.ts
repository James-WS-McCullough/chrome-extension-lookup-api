import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchAuthorData } from "../../src/gateways/author-gateway";
import { HttpError } from "../../src/services/http-client";

vi.mock("../../src/services/http-client", async (importOriginal) => {
  const original = await importOriginal<typeof import("../../src/services/http-client")>();
  return {
    ...original,
    httpGet: vi.fn(),
  };
});

import { httpGet } from "../../src/services/http-client";

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
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns author data on success", async () => {
    vi.mocked(httpGet).mockResolvedValue(mockAuthorResponse);

    const result = await fetchAuthorData("Albert Einstein");

    expect(result).toEqual(mockAuthorResponse);
    expect(httpGet).toHaveBeenCalledWith("/author-data", { author: "Albert Einstein" });
  });

  it("throws 'Author not found' on 404", async () => {
    vi.mocked(httpGet).mockRejectedValue(new HttpError(404));

    await expect(fetchAuthorData("unknown")).rejects.toThrow("Author not found");
  });

  it("re-throws non-404 HttpErrors", async () => {
    vi.mocked(httpGet).mockRejectedValue(new HttpError(500));

    await expect(fetchAuthorData("test")).rejects.toThrow("Request failed with status 500");
  });

  it("re-throws network errors", async () => {
    vi.mocked(httpGet).mockRejectedValue(new TypeError("Failed to fetch"));

    await expect(fetchAuthorData("test")).rejects.toThrow("Failed to fetch");
  });
});
