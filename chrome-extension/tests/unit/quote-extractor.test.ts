import { beforeEach, describe, expect, it } from "vitest";
import { extractFirstAuthor } from "../../src/extractors/quote-extractor";

describe("extractFirstAuthor", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("extracts the first author from the page", () => {
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
