import { FileAuthorRepository } from "@/infrastructure/file-author-repository";
import { FindAuthorUseCase } from "@/use-cases/find-author";

const repository = new FileAuthorRepository();

export const findAuthorUseCase = new FindAuthorUseCase(repository);
