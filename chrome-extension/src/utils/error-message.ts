export const toUserMessage = (error: unknown, authorName: string): string => {
  if (!(error instanceof Error)) {
    return "An unexpected error occurred.";
  }

  if (error instanceof TypeError && error.message === "Failed to fetch") {
    return "Could not connect to the local API. Is the local API running?";
  }

  if (error.message === "Author not found") {
    return `The author name "${authorName}" was not found in the database.`;
  }

  return `Something went wrong: ${error.message}`;
};
