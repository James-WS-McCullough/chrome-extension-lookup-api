import { HttpError, httpGet } from "../services/http-client";

export type AuthorData = {
  author: string;
  profile: {
    category: string;
    personaTags: string[];
    difficulty: string;
  };
  recommendedActions: string[];
  integrationHints: {
    preferredAuth: string;
    rateLimitPerMinute: number;
    notes: string;
  };
  samplePayloads: { type: string; title: string; value: string | number }[];
};

export const fetchAuthorData = async (authorName: string): Promise<AuthorData> => {
  try {
    return await httpGet<AuthorData>("/author-data", { author: authorName });
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) {
      throw new Error("Author not found");
    }
    throw error;
  }
};
