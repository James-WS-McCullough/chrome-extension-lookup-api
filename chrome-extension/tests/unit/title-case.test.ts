import { describe, expect, it } from "vitest";
import { toTitleCase } from "../../src/utils/title-case";

describe("toTitleCase", () => {
  it("capitalizes lowercase names", () => {
    expect(toTitleCase("jane austen")).toBe("Jane Austen");
  });

  it("preserves already capitalized names", () => {
    expect(toTitleCase("Albert Einstein")).toBe("Albert Einstein");
  });

  it("handles initials with periods", () => {
    expect(toTitleCase("j.k. rowling")).toBe("J.k. Rowling");
  });

  it("handles single word", () => {
    expect(toTitleCase("plato")).toBe("Plato");
  });

  it("handles empty string", () => {
    expect(toTitleCase("")).toBe("");
  });
});
