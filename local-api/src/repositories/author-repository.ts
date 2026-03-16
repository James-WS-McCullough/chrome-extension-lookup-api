import type { Author } from "../domain/author.ts";

export interface AuthorRepository {
  findByName(name: string): Author | undefined;
}
