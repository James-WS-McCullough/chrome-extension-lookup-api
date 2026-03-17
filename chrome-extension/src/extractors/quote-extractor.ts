export function extractFirstAuthor(): string | null {
  const authorElement = document.querySelector(".author");
  if (!authorElement) {
    return null;
  }
  return authorElement.textContent?.trim() ?? null;
}
