import cors from "cors";
import express from "express";
import { AuthorController } from "@/infrastructure/controllers/author-controller";
import { findAuthorUseCase } from "@/infrastructure/factories/find-author-use-case";

const authorController = new AuthorController(findAuthorUseCase);

const app = express();

app.use(cors());
app.get("/author-data", authorController.handle);

export { app };
