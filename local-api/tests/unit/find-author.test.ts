import { describe, expect, it } from "vitest";
import { InMemoryAuthorRepository } from "../../src/infrastructure/in-memory-author-repository.ts";
import { FindAuthorUseCase } from "../../src/use-cases/find-author.ts";

const TEST_AUTHORS = [
  {
    name: "Albert Einstein",
    category: "Science & Philosophy",
    difficulty: "medium",
    rateLimitPerMinute: 60,
  },
  {
    name: "j.k. rowling",
    category: "Storytelling & Product UX",
    difficulty: "easy",
    rateLimitPerMinute: 30,
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
