import { FindAuthorUseCase } from "@/application/use-cases/find-author";
import { FileAuthorRepository } from "@/infrastructure/repositories/file-author-repository";

const repository = new FileAuthorRepository();

export const findAuthorUseCase = new FindAuthorUseCase(repository);
