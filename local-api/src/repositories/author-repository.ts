import type { Author } from "@/domain/author";

export interface AuthorRepository {
  findByName(name: string): Author | undefined;
}
