import { describe, expect, it } from "vitest";
import { toUserMessage } from "../../src/utils/error-message";

describe("toUserMessage", () => {
  it("returns a network error message for failed fetch", () => {
    const error = new TypeError("Failed to fetch");
    expect(toUserMessage(error, "Einstein")).toBe(
      "Could not connect to the local API. Is the local API running?",
    );
  });

  it("returns a not found message for author not found", () => {
    const error = new Error("Author not found");
    expect(toUserMessage(error, "Unknown Author")).toBe(
      'The author name "Unknown Author" was not found in the database.',
    );
  });

  it("returns a generic message for other errors", () => {
    const error = new Error("Server timeout");
    expect(toUserMessage(error, "Einstein")).toBe("Something went wrong: Server timeout");
  });

  it("returns an unexpected error message for non-Error values", () => {
    expect(toUserMessage("string error", "Einstein")).toBe("An unexpected error occurred.");
  });

  it("returns an unexpected error message for null", () => {
    expect(toUserMessage(null, "Einstein")).toBe("An unexpected error occurred.");
  });
});
