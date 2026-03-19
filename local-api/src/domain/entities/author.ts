export type SamplePayload = {
  type: string;
  title: string;
  value: string | number;
};

export type Author = {
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
  samplePayloads: SamplePayload[];
};
