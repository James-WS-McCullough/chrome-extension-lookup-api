import type { AuthorData } from "../services/author-api";
import { toTitleCase } from "../utils/title-case";

export function showError(container: HTMLElement, message: string): void {
  container.innerHTML = `
    <div class="error-card">
      <p class="error-icon">!</p>
      <p class="error-message">${message}</p>
    </div>
  `;
}

export function showAuthorData(
  container: HTMLElement,
  data: AuthorData,
  onRefresh: () => void,
): void {
  container.innerHTML = `
    <div class="author-card">
      <h2>${toTitleCase(data.author)}</h2>
      <dl>
        <dt>Category</dt>
        <dd>${data.profile.category}</dd>
        <dt>Difficulty</dt>
        <dd>${data.profile.difficulty}</dd>
        <dt>Rate Limit</dt>
        <dd>${data.integrationHints.rateLimitPerMinute} req/min</dd>
      </dl>
      <button class="refresh-btn" type="button" aria-label="Refresh">&#x21bb;</button>
    </div>
  `;
  container.querySelector(".refresh-btn")?.addEventListener("click", onRefresh);
}

export function showUnsupportedPage(container: HTMLElement): void {
  container.innerHTML =
    '<p class="unsupported">Navigate to <a href="https://quotes.toscrape.com" target="_blank">quotes.toscrape.com</a> to use this extension.</p>';
}
