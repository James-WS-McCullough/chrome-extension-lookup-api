import type { Author } from "../domain/author";
import type { AuthorRepository } from "../repositories/author-repository";

export class FindAuthorUseCase {
  private readonly authorRepository: AuthorRepository;

  constructor(authorRepository: AuthorRepository) {
    this.authorRepository = authorRepository;
  }

  execute(name: string): Author | undefined {
    return this.authorRepository.findByName(name);
  }
}
