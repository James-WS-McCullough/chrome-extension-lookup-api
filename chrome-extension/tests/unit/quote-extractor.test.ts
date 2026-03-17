import { beforeEach, describe, expect, it } from "vitest";
import { extractFirstAuthor } from "../../src/extractors/quote-extractor";

describe("extractFirstAuthor", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    Object.defineProperty(window, "location", {
      value: { pathname: "/" },
      writable: true,
    });
  });

  it("extracts the first author from the quotes page", () => {
    document.body.innerHTML = `
      <div class="quote">
        <span class="text">"The world is a book."</span>
        <small class="author">Albert Einstein</small>
      </div>
      <div class="quote">
        <span class="text">"It is our choices."</span>
        <small class="author">J.K. Rowling</small>
      </div>
    `;

    expect(extractFirstAuthor()).toBe("Albert Einstein");
  });

  it("extracts author from an author detail page", () => {
    Object.defineProperty(window, "location", {
      value: { pathname: "/author/J-K-Rowling/" },
      writable: true,
    });

    document.body.innerHTML = `
      <div class="author-details">
        <h3 class="author-title">J.K. Rowling</h3>
        <p><strong>Born:</strong> <span class="author-born-date">July 31, 1965</span></p>
      </div>
    `;

    expect(extractFirstAuthor()).toBe("J.K. Rowling");
  });

  it("returns null when no author element exists", () => {
    document.body.innerHTML = "<div>No quotes here</div>";

    expect(extractFirstAuthor()).toBeNull();
  });

  it("trims whitespace from author text", () => {
    document.body.innerHTML = '<small class="author">  Jane Austen  </small>';

    expect(extractFirstAuthor()).toBe("Jane Austen");
  });

  it("returns null for an empty author element", () => {
    document.body.innerHTML = '<small class="author"></small>';

    expect(extractFirstAuthor()).toBe("");
  });
});
