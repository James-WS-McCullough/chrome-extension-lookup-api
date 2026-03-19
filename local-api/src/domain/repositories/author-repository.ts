import type { Author } from "@/domain/entities/author";

export interface AuthorRepository {
  findByName(name: string): Author | undefined;
}
