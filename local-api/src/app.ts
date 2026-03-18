import cors from "cors";
import express from "express";
import { AuthorController } from "@/controllers/author-controller";
import { findAuthorUseCase } from "@/factories/find-author-use-case";

const authorController = new AuthorController(findAuthorUseCase);

const app = express();

app.use(cors());
app.get("/author-data", authorController.handle);

export { app };
