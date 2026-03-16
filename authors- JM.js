const AUTHOR_DATA = [
  {
    author: "Albert Einstein",
    profile: {
      category: "Science & Philosophy",
      personaTags: ["deep-thoughts", "thinking", "world"],
      difficulty: "medium",
    },
    recommendedActions: [
      "Highlight key assumptions before building automations",
      "Prefer simple models first, then iterate",
    ],
    integrationHints: {
      preferredAuth: "API key",
      rateLimitPerMinute: 60,
      notes: "Use caching for repeated lookups by author",
    },
    samplePayloads: [
      { type: "insight", title: "Reduce complexity", value: "Start with a minimal viable flow." },
      { type: "metric", title: "Clarity score", value: 92 }
    ]
  },
  {
    author: "j.k. rowling",
    profile: {
      category: "Storytelling & Product UX",
      personaTags: ["choices", "abilities", "growth"],
      difficulty: "easy",
    },
    recommendedActions: [
      "Design the happy path first (then error states)",
      "Make UI feedback obvious (loading, success, retry)",
    ],
    integrationHints: {
      preferredAuth: "OAuth (mocked)",
      rateLimitPerMinute: 30,
      notes: "If auth is complex, stub it and document the intended approach",
    },
    samplePayloads: [
      { type: "insight", title: "UX tip", value: "Users trust fast feedback more than perfect visuals." },
      { type: "metric", title: "Delight score", value: 84 }
    ]
  },
  {
    author: "jane austen",
    profile: {
      category: "Content & Data Quality",
      personaTags: ["books", "classic", "humor"],
      difficulty: "hard",
    },
    recommendedActions: [
      "Validate inputs and normalize names (trim, casing)",
      "Return consistent error formats for the frontend",
    ],
    integrationHints: {
      preferredAuth: "None (local dev only)",
      rateLimitPerMinute: 120,
      notes: "Emphasize deterministic responses for easier testing",
    },
    samplePayloads: [
      { type: "insight", title: "Data hygiene", value: "Normalize before comparing or storing." },
      { type: "metric", title: "Consistency score", value: 96 }
    ]
  }
];
