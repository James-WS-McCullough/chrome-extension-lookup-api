import cors from "cors";
import express from "express";
import { AuthorController } from "./controllers/author-controller";
import { FileAuthorRepository } from "./infrastructure/file-author-repository";
import { FindAuthorUseCase } from "./use-cases/find-author";

const repository = new FileAuthorRepository();
const findAuthorUseCase = new FindAuthorUseCase(repository);
const authorController = new AuthorController(findAuthorUseCase);

const app = express();

app.use(cors());
app.get("/author-data", authorController.handle);

export { app };
