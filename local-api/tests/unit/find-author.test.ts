import { describe, expect, it } from "vitest";
import type { Author } from "../../src/domain/author";
import { InMemoryAuthorRepository } from "../../src/infrastructure/in-memory-author-repository";
import { FindAuthorUseCase } from "../../src/use-cases/find-author";

const TEST_AUTHORS: Author[] = [
  {
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
  },
  {
    author: "j.k. rowling",
    profile: {
      category: "Storytelling & Product UX",
      personaTags: ["choices", "abilities", "growth"],
      difficulty: "easy",
    },
    recommendedActions: [
      "Design the happy path first (then error states)",
      "Make UI feedback obvious (loading, success, retry)",
    ],
    integrationHints: {
      preferredAuth: "OAuth (mocked)",
      rateLimitPerMinute: 30,
      notes: "If auth is complex, stub it and document the intended approach",
    },
    samplePayloads: [
      {
        type: "insight",
        title: "UX tip",
        value: "Users trust fast feedback more than perfect visuals.",
      },
      { type: "metric", title: "Delight score", value: 84 },
    ],
  },
];

describe("FindAuthorUseCase", () => {
  const repository = new InMemoryAuthorRepository(TEST_AUTHORS);
  const useCase = new FindAuthorUseCase(repository);

  it("returns author for exact match", () => {
    const result = useCase.execute("Albert Einstein");
    expect(result).toEqual(TEST_AUTHORS[0]);
  });

  it("returns author for case-insensitive match", () => {
    const result = useCase.execute("albert einstein");
    expect(result).toEqual(TEST_AUTHORS[0]);
  });

  it("returns author with trimmed whitespace", () => {
    const result = useCase.execute("  Albert Einstein  ");
    expect(result).toEqual(TEST_AUTHORS[0]);
  });

  it("returns undefined for unknown author", () => {
    const result = useCase.execute("Unknown Author");
    expect(result).toBeUndefined();
  });
});
