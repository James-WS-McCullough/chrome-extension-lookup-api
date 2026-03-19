import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HttpError, httpGet } from "../../src/services/http-client";

describe("httpGet", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns parsed JSON on success", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ name: "test" }),
    } as Response);

    const result = await httpGet("/test");
    expect(result).toEqual({ name: "test" });
  });

  it("builds URL with query params", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    } as Response);

    await httpGet("/search", { q: "hello world" });

    const calledUrl = vi.mocked(fetch).mock.calls[0][0] as string;
    expect(calledUrl).toContain("/search");
    expect(calledUrl).toContain("q=hello+world");
  });

  it("throws HttpError on non-OK response", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500,
    } as Response);

    await expect(httpGet("/fail")).rejects.toThrow(HttpError);
    await expect(httpGet("/fail")).rejects.toThrow("Request failed with status 500");
  });

  it("propagates network errors", async () => {
    vi.mocked(fetch).mockRejectedValue(new TypeError("Failed to fetch"));

    await expect(httpGet("/offline")).rejects.toThrow("Failed to fetch");
  });
});
