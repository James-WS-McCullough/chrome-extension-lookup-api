import { createRequire } from "node:module";
import type { Author } from "../domain/author";
import type { RawAuthorEntry } from "../mappers/author-mapper";
import { toAuthor } from "../mappers/author-mapper";
import type { AuthorRepository } from "../repositories/author-repository";

const require = createRequire(import.meta.url);

export class FileAuthorRepository implements AuthorRepository {
  private readonly authors: Author[];

  constructor() {
    const rawData: RawAuthorEntry[] = require("../../../authors- JM.js");
    this.authors = rawData.map(toAuthor);
  }

  findByName(name: string): Author | undefined {
    const normalized = name.toLowerCase().trim();
    return this.authors.find((entry) => entry.author.toLowerCase() === normalized);
  }
}
