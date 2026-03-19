import type { Author } from "@/domain/entities/author";
import type { AuthorRepository } from "@/domain/repositories/author-repository";

export class InMemoryAuthorRepository implements AuthorRepository {
  private readonly authors: Author[];

  constructor(authors: Author[]) {
    this.authors = authors;
  }

  findByName(name: string): Author | undefined {
    const normalized = name.toLowerCase().trim();
    return this.authors.find((entry) => entry.author.toLowerCase() === normalized);
  }
}
