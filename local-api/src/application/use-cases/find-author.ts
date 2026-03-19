import type { Author } from "@/domain/entities/author";
import type { AuthorRepository } from "@/domain/repositories/author-repository";

export class FindAuthorUseCase {
  private readonly authorRepository: AuthorRepository;

  constructor(authorRepository: AuthorRepository) {
    this.authorRepository = authorRepository;
  }

  execute(name: string): Author | undefined {
    return this.authorRepository.findByName(name);
  }
}
