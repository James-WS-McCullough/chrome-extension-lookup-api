import supertest from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "@/app";

const request = supertest(app);

describe("GET /author-data", () => {
  it("returns full author object for a valid author", async () => {
    const response = await request.get("/author-data").query({ author: "Albert Einstein" });

    expect(response.status).toBe(200);
    expect(response.body.author).toBe("Albert Einstein");
    expect(response.body.profile.category).toBe("Science & Philosophy");
    expect(response.body.profile.difficulty).toBe("medium");
    expect(response.body.integrationHints.rateLimitPerMinute).toBe(60);
  });

  it("matches authors case-insensitively", async () => {
    const response = await request.get("/author-data").query({ author: "j.k. rowling" });

    expect(response.status).toBe(200);
    expect(response.body.author).toBe("j.k. rowling");
    expect(response.body.profile.category).toBe("Storytelling & Product UX");
  });

  it("returns 404 for unknown author", async () => {
    const response = await request.get("/author-data").query({ author: "unknown" });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "Author not found" });
  });

  it("returns 400 when author query param is missing", async () => {
    const response = await request.get("/author-data");

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Missing author query parameter" });
  });

  it("returns the complete author object structure", async () => {
    const response = await request.get("/author-data").query({ author: "Albert Einstein" });

    expect(response.body).toHaveProperty("author");
    expect(response.body).toHaveProperty("profile");
    expect(response.body).toHaveProperty("recommendedActions");
    expect(response.body).toHaveProperty("integrationHints");
    expect(response.body).toHaveProperty("samplePayloads");
  });
});
