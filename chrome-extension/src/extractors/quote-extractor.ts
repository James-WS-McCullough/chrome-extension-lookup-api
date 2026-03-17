const extractListPageAuthor = (): string | null => {
  const authorElement = document.querySelector(".author");
  return authorElement?.textContent?.trim() ?? null;
};

const extractAuthorPageAuthor = (): string | null => {
  const authorTitle = document.querySelector(".author-title");
  return authorTitle?.textContent?.trim() ?? null;
};

export const extractFirstAuthor = (): string | null => {
  const isAuthorPage = window.location.pathname.startsWith("/author/");
  return isAuthorPage ? extractAuthorPageAuthor() : extractListPageAuthor();
};
