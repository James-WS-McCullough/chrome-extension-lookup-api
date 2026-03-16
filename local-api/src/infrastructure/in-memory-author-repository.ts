import type { Author } from "../domain/author.ts";
import type { AuthorRepository } from "../repositories/author-repository.ts";

export class InMemoryAuthorRepository implements AuthorRepository {
  private readonly authors: Author[];

  constructor(authors: Author[]) {
    this.authors = authors;
  }

  findByName(name: string): Author | undefined {
    const normalizedName = name.toLowerCase().trim();
    return this.authors.find((author) => author.name.toLowerCase() === normalizedName);
  }
}
