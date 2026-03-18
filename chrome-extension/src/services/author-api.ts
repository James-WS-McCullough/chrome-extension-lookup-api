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
  const url = `${import.meta.env.VITE_API_BASE_URL}/author-data?author=${encodeURIComponent(authorName)}`;

  const response = await fetch(url);

  if (response.status === 404) {
    throw new Error("Author not found");
  }

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json() as Promise<AuthorData>;
};
