# Implementation Plan

## Phase 1: Local API (`local-api/`)

### Step 1 — Project scaffolding
- `npm init` inside `local-api/`.
- Install dependencies: `express`, `tsx` (for running TS directly), `typescript`.
- Install dev dependencies: `vitest`, `@types/express`, `@types/node`.
- Create `tsconfig.json` with `strict: true`, `module: "ESNext"`, `moduleResolution: "bundler"`, `outDir: "dist"`.
- Add scripts: `"dev": "tsx src/server.ts"`, `"test": "vitest run"`, `"test:watch": "vitest"`.

### Step 2 — Domain layer (`src/domain/author.ts`)
Define the `Author` domain entity as a TypeScript type. This represents the clean, application-level shape — not the raw dataset shape.
```ts
type Author = {
  name: string;
  category: string;
  difficulty: string;
  rateLimitPerMinute: number;
}
```
This is the only data the API ultimately needs to serve. Keep the domain lean — only fields relevant to the business logic.

### Step 3 — Repository interface (`src/repositories/author-repository.ts`)
Define the contract. No implementation.
```ts
interface AuthorRepository {
  findByName(name: string): Author | undefined;
}
```
Single method. Case-insensitive matching is the repository's responsibility since it owns data access.

### Step 4 — Mappers (`src/mappers/author-mapper.ts`)
Two mapper functions:

**`toAuthor`** — converts a raw dataset entry into the domain `Author` type:
- Maps `entry.author` → `name`
- Maps `entry.profile.category` → `category`
- Maps `entry.profile.difficulty` → `difficulty`
- Maps `entry.integrationHints.rateLimitPerMinute` → `rateLimitPerMinute`
- Discards all other fields (`personaTags`, `recommendedActions`, `samplePayloads`, etc.)

**`toAuthorResponse`** — converts domain `Author` to the API response DTO:
- Returns only `{ category, difficulty, rateLimitPerMinute }` (excludes `name` since the caller already knows it).

Also define the raw data type (`RawAuthorEntry`) to type the imported dataset.

### Step 5 — Infrastructure: `FileAuthorRepository` (`src/infrastructure/file-author-repository.ts`)
- Imports the raw dataset from `../../authors- JM.js` (using `createRequire` or a typed import).
- On construction, maps all raw entries to domain `Author` objects using `toAuthor`.
- `findByName(name)`: compares `name.toLowerCase().trim()` against stored `author.name.toLowerCase()`. Returns first match or `undefined`.

### Step 6 — Infrastructure: `InMemoryAuthorRepository` (`src/infrastructure/in-memory-author-repository.ts`)
- Constructor accepts `Author[]`.
- `findByName(name)`: same case-insensitive lookup as `FileAuthorRepository`.
- Used exclusively in tests — allows injecting controlled data.

### Step 7 — Use case (`src/use-cases/find-author.ts`)
```ts
class FindAuthorUseCase {
  constructor(private authorRepository: AuthorRepository) {}
  execute(name: string): Author | undefined {
    return this.authorRepository.findByName(name);
  }
}
```
Pure orchestration. Takes a repository via constructor injection. Returns domain `Author` or `undefined`.

### Step 8 — Controller (`src/controllers/author-controller.ts`)
- Receives `FindAuthorUseCase` via constructor injection.
- Exposes a `handle(req, res)` method compatible with Express route handlers.
- Logic:
  1. Read `req.query.author`. If missing/empty → `400 { error: "Missing author query parameter" }`.
  2. Call `findAuthorUseCase.execute(author)`.
  3. If `undefined` → `404 { error: "Author not found" }`.
  4. Otherwise → `200` with `toAuthorResponse(author)` (only `category`, `difficulty`, `rateLimitPerMinute`).

### Step 9 — Composition root (`src/server.ts`)
- Import `FileAuthorRepository`, `FindAuthorUseCase`, `AuthorController`.
- Instantiate: `repository → useCase → controller`.
- Create Express app, register `GET /author-data` → `controller.handle`.
- Add CORS middleware (extension needs cross-origin access to localhost).
- Listen on port 3000.
- Export the `app` for E2E tests (so tests can import it without starting a listener).

### Step 10 — Unit tests (`tests/unit/find-author.test.ts`)
- Create `InMemoryAuthorRepository` with known test data.
- Inject into `FindAuthorUseCase`.
- Test cases:
  - Exact match returns correct `Author`.
  - Case-insensitive match (e.g. `"albert einstein"` matches `"Albert Einstein"`).
  - Whitespace-trimmed match.
  - Unknown author returns `undefined`.

### Step 11 — E2E tests (`tests/e2e/author-endpoint.test.ts`)
- Import the `app` from `server.ts` (or create a test server helper).
- Use `fetch` or `supertest` to make real HTTP requests.
- Test cases:
  - `GET /author-data?author=Albert Einstein` → `200` with `{ category, difficulty, rateLimitPerMinute }`.
  - `GET /author-data?author=j.k. rowling` → `200` (case-insensitive dataset match).
  - `GET /author-data?author=unknown` → `404` with `{ error: "Author not found" }`.
  - `GET /author-data` (no query param) → `400` with `{ error: "Missing author query parameter" }`.
  - Response body contains exactly 3 keys — no extra fields leaked.

---

## Phase 2: Chrome Extension (`chrome-extension/`)

### Step 1 — Manifest (`manifest.json`)
```json
{
  "manifest_version": 3,
  "name": "Author Lookup",
  "version": "1.0",
  "description": "Look up author data from quotes.toscrape.com",
  "permissions": ["activeTab", "scripting"],
  "host_permissions": ["https://quotes.toscrape.com/*"],
  "action": {
    "default_popup": "popup.html"
  }
}
```
- `activeTab` — access to the current tab when user clicks the extension.
- `scripting` — needed for `chrome.scripting.executeScript`.
- `host_permissions` — restrict content script injection to the target site.

### Step 2 — URL matcher (`src/utils/url-matcher.ts`)
```ts
function isQuotesPage(url: string): boolean
```
Returns `true` if the URL starts with `https://quotes.toscrape.com`. Pure function, no Chrome API dependency — easy to unit test.

### Step 3 — Quote extractor (`src/extractors/quote-extractor.ts`)
```ts
function extractFirstAuthor(): string | null
```
This function runs **inside the page context** via `chrome.scripting.executeScript`. It:
- Selects the first `.author` element on the page (quotes.toscrape.com uses `<small class="author">`).
- Returns the `textContent` trimmed, or `null` if not found.

Note: This function cannot import other modules since it executes in the page's isolated world.

### Step 4 — API service (`src/services/author-api.ts`)
```ts
type AuthorData = {
  category: string;
  difficulty: string;
  rateLimitPerMinute: number;
}

async function fetchAuthorData(authorName: string): Promise<AuthorData>
```
- Calls `GET http://localhost:3000/author-data?author=${encodeURIComponent(authorName)}`.
- On success → parses JSON and returns typed `AuthorData`.
- On 404 → throws an error with message "Author not found".
- On network error / non-OK status → throws an error with a descriptive message.

### Step 5 — Renderer (`src/ui/renderer.ts`)
Pure DOM manipulation functions. Each takes an element reference and data:
```ts
function showLoading(container: HTMLElement): void
function showError(container: HTMLElement, message: string): void
function showAuthorData(container: HTMLElement, data: AuthorData): void
function showUnsupportedPage(container: HTMLElement): void
```
- `showLoading` — displays a spinner or "Loading..." text.
- `showError` — displays the error message with a retry-friendly message.
- `showAuthorData` — renders `category`, `difficulty`, and `rateLimitPerMinute` in a clean layout.
- `showUnsupportedPage` — displays the message directing users to quotes.toscrape.com.

### Step 6 — Popup orchestrator (`src/ui/popup.ts`)
Entry point loaded by `popup.html`. Wires everything together:
1. On load, query the active tab URL using `chrome.tabs.query`.
2. Call `isQuotesPage(url)`.
3. If **not** a quotes page → call `showUnsupportedPage()` and return.
4. If **is** a quotes page → show the "Get Author Data" button.
5. On button click:
   a. Call `showLoading()`.
   b. Execute `extractFirstAuthor()` on the active tab via `chrome.scripting.executeScript`.
   c. If no author found → `showError("Could not find an author on this page")`.
   d. Call `fetchAuthorData(authorName)`.
   e. On success → `showAuthorData(data)`.
   f. On error → `showError(error.message)`.

### Step 7 — Popup HTML & CSS (`popup.html`, `popup.css`)
- Minimal semantic HTML: a `<main>` container, a `<button>`, and a results `<section>`.
- CSS: clean, compact popup (around 350px wide). Style the three data fields as a small card/table.
- States: default (button visible), loading (spinner), results (data card), error (error message), unsupported (instruction message).

### Step 8 — Build step
Since the extension uses TypeScript in `src/`, add a build step:
- Install `esbuild` as a dev dependency.
- Add script `"build": "esbuild src/ui/popup.ts --bundle --outfile=dist/popup.js"`.
- Update `popup.html` to reference `dist/popup.js`.
- The `manifest.json`, `popup.html`, and `popup.css` live at the extension root — Chrome loads from there.
- Load the `chrome-extension/` folder as an unpacked extension in Chrome.

### Step 9 — Extension unit tests (`tests/unit/`)
- **`url-matcher.test.ts`**: test `isQuotesPage` with `https://quotes.toscrape.com/`, subpaths, `http://`, other domains, empty strings.
- **`author-api.test.ts`**: mock `globalThis.fetch`, test success response parsing, 404 handling, network error handling.
- **`quote-extractor.test.ts`**: use JSDOM or string-based DOM to test `extractFirstAuthor` against sample HTML from quotes.toscrape.com.
