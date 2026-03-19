import type { Request, Response } from "express";
import { z } from "zod";
import type { FindAuthorUseCase } from "@/use-cases/find-author";

const authorQuerySchema = z.object({
  author: z.string().min(1),
});

export class AuthorController {
  private readonly findAuthorUseCase: FindAuthorUseCase;

  constructor(findAuthorUseCase: FindAuthorUseCase) {
    this.findAuthorUseCase = findAuthorUseCase;
  }

  handle = async (req: Request, res: Response): Promise<void> => {
    const delayMs = Number(process.env.SIMULATED_DELAY_MS) || 0;
    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    const result = authorQuerySchema.safeParse(req.query);

    if (!result.success) {
      res.status(400).json({ error: "Missing author query parameter" });
      return;
    }

    const author = this.findAuthorUseCase.execute(result.data.author);

    if (!author) {
      res.status(404).json({ error: "Author not found" });
      return;
    }

    res.json(author);
  };
}
