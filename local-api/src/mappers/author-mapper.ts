import type { Author } from "@/domain/author";

export type RawAuthorEntry = {
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

// Maps raw dataset entries to domain Author objects.
// Any formatting changes (e.g. case normalisation, field renaming) between
// the external data shape and the domain model should be applied here.
export const toAuthor = (entry: RawAuthorEntry): Author => {
  return {
    author: entry.author,
    profile: {
      category: entry.profile.category,
      personaTags: entry.profile.personaTags,
      difficulty: entry.profile.difficulty,
    },
    recommendedActions: entry.recommendedActions,
    integrationHints: {
      preferredAuth: entry.integrationHints.preferredAuth,
      rateLimitPerMinute: entry.integrationHints.rateLimitPerMinute,
      notes: entry.integrationHints.notes,
    },
    samplePayloads: entry.samplePayloads.map((payload) => ({
      type: payload.type,
      title: payload.title,
      value: payload.value,
    })),
  };
};
