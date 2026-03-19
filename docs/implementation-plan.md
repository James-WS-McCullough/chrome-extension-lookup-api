# Implementation Plan

## Phase 1: Local API (`local-api/`)

### Step 1 — Project scaffolding

- `npm init` inside `local-api/`.
- Install dependencies: `express`, `tsx` (for running TS directly), `typescript`.
- Install dev dependencies: `vitest`, `@types/express`, `@types/node`.
- Create `tsconfig.json` with `strict: true`, `module: "ESNext"`, `moduleResolution: "bundler"`, `outDir: "dist"`.
- Add scripts: `"dev": "tsx src/server.ts"`, `"test": "vitest run"`, `"test:watch": "vitest"`.

### Step 2 — Domain layer (`src/domain/author.ts`)

Define the `Author` domain entity as a TypeScript type. This mirrors the full raw dataset shape — the API returns the complete author object and the Chrome extension decides which fields to display.

```ts
type Author = {
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
```

### Step 3 — Repository interface (`src/domain/repositories/author-repository.ts`)

Define the contract. No implementation.

```ts
interface AuthorRepository {
  findByName(name: string): Author | undefined;
}
```

Single method. Case-insensitive matching is the repository's responsibility since it owns data access.

### Step 4 — Mappers (`src/infrastructure/mappers/author-mapper.ts`)

**`toAuthor`** — casts a raw dataset entry to the domain `Author` type. Since the domain mirrors the dataset shape, this is a type-level assertion only.

### Step 5 — Infrastructure: `FileAuthorRepository` (`src/infrastructure/repositories/file-author-repository.ts`)

- Imports the raw dataset from `../../authors- JM.js` (using `createRequire` or a typed import).
- On construction, maps all raw entries to domain `Author` objects using `toAuthor`.
- `findByName(name)`: compares `name.toLowerCase().trim()` against stored `entry.author.toLowerCase()`. Returns first match or `undefined`.

### Step 6 — Infrastructure: `InMemoryAuthorRepository` (`src/infrastructure/repositories/in-memory-author-repository.ts`)

- Constructor accepts `Author[]`.
- `findByName(name)`: same case-insensitive lookup as `FileAuthorRepository`.
- Used exclusively in tests — allows injecting controlled data.

### Step 7 — Use case (`src/application/use-cases/find-author.ts`)

```ts
class FindAuthorUseCase {
  constructor(private authorRepository: AuthorRepository) {}
  execute(name: string): Author | undefined {
    return this.authorRepository.findByName(name);
  }
}
```

Pure orchestration. Takes a repository via constructor injection. Returns domain `Author` or `undefined`.

### Step 8 — Controller (`src/infrastructure/controllers/author-controller.ts`)

- Receives `FindAuthorUseCase` via constructor injection.
- Exposes a `handle(req, res)` method compatible with Express route handlers.
- Logic:
  1. Read `req.query.author`. If missing/empty → `400 { error: "Missing author query parameter" }`.
  2. Call `findAuthorUseCase.execute(author)`.
  3. If `undefined` → `404 { error: "Author not found" }`.
  4. Otherwise → `200` with the full author object.

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
  - `GET /author-data?author=Albert Einstein` → `200` with full author object.
  - `GET /author-data?author=j.k. rowling` → `200` (case-insensitive dataset match).
  - `GET /author-data?author=unknown` → `404` with `{ error: "Author not found" }`.
  - `GET /author-data` (no query param) → `400` with `{ error: "Missing author query parameter" }`.
  - Response body contains the complete author object structure (`author`, `profile`, `recommendedActions`, `integrationHints`, `samplePayloads`).

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
function isQuotesPage(url: string): boolean;
```

Returns `true` if the URL starts with `https://quotes.toscrape.com`. Pure function, no Chrome API dependency — easy to unit test.

### Step 3 — Quote extractor (`src/extractors/quote-extractor.ts`)

```ts
function extractFirstAuthor(): string | null;
```

This function runs **inside the page context** via `chrome.scripting.executeScript`. It:

- Selects the first `.author` element on the page (quotes.toscrape.com uses `<small class="author">`).
- Returns the `textContent` trimmed, or `null` if not found.

Note: This function cannot import other modules since it executes in the page's isolated world.

### Step 4 — API service (`src/services/author-api.ts`)

```ts
type AuthorData = {
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

async function fetchAuthorData(authorName: string): Promise<AuthorData>;
```

- Calls `GET http://localhost:3000/author-data?author=${encodeURIComponent(authorName)}`.
- On success → parses JSON and returns typed `AuthorData`.
- On 404 → throws an error with message "Author not found".
- On network error / non-OK status → throws an error with a descriptive message.

### Step 5 — Renderer (`src/ui/renderer.ts`)

Pure DOM manipulation functions. Each takes an element reference and data:

```ts
function showLoading(container: HTMLElement): void;
function showError(container: HTMLElement, message: string): void;
function showAuthorData(container: HTMLElement, data: AuthorData): void;
function showUnsupportedPage(container: HTMLElement): void;
```

- `showLoading` — displays a spinner or "Loading..." text.
- `showError` — displays the error message with a retry-friendly message.
- `showAuthorData` — receives the full author object but renders only `category`, `difficulty`, and `rateLimitPerMinute`.
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

---

## Phase 3: Vue.js Migration (`chrome-extension/`)

Replace raw DOM manipulation with Vue.js and switch the build toolchain from esbuild to Vite.

### Step 1 — Replace esbuild with Vite + Vue

- Remove `esbuild` from devDependencies.
- Install: `vue`, `vite`, `@vitejs/plugin-vue`, `vue-tsc`.
- Create `vite.config.ts` at the extension root:
  - Use `@vitejs/plugin-vue`.
  - Set `build.outDir` to `dist`.
  - Set `build.rollupOptions.input` to `popup.html` so Vite treats the popup as the entry point.
  - Configure `build.rollupOptions.output` to produce a single chunk (Chrome extensions load local files, no code-splitting needed).
- Update `package.json` scripts:
  - `"dev": "vite build --watch"` — rebuilds on file changes during development.
  - `"build": "vue-tsc --noEmit && vite build"` — type-check then build for production.
- Update `tsconfig.json`: add `"jsx": "preserve"` and `"jsxImportSource": "vue"` if using TSX, or keep SFCs and ensure `vue-tsc` handles `.vue` files.

### Step 2 — Create the Vue app entry point

- Create `src/main.ts` as the new entry point:
  - Import `createApp` from `vue`.
  - Import the root `App.vue` component.
  - Mount to `#app`.
- Update `popup.html`:
  - Replace the `<button>`, `<section id="results">`, and `<script src="dist/popup.js">` with a single `<div id="app"></div>`.
  - Add `<script type="module" src="src/main.ts"></script>` (Vite handles the TS compilation).

### Step 3 — Create the root `App.vue` component (`src/App.vue`)

This replaces `popup.ts` as the orchestrator. It manages the application state and delegates to child components.

- **Reactive state** (using `ref`):
  - `status`: `"idle" | "loading" | "success" | "error" | "unsupported"` — drives which child component renders.
  - `authorData`: `AuthorData | null` — holds the fetched result.
  - `errorMessage`: `string` — holds the current error message.
- **`onMounted`**: query the active tab URL via `chrome.tabs.query`. If `isQuotesPage` returns `false`, set `status` to `"unsupported"`. Otherwise remain `"idle"`.
- **`handleLookup` method**: contains the same logic currently in `popup.ts` `handleLookup` — extract author, fetch data, update reactive state. No direct DOM manipulation.
- **Template**: uses `v-if`/`v-else-if` to conditionally render the correct child component based on `status`.

### Step 4 — Extract child components using atomic design

Use atomic design to build a component hierarchy. The current CSS shows that `.error-card`, `.info-card`, and `.author-card` all share the same `background`, `border`, `border-radius`, `padding`, and `animation`. The error and info cards go further — identical flex layout with an icon circle and a message. This shared structure maps naturally to atoms, molecules, and organisms.

#### Atoms (`src/components/atoms/`)

Smallest building blocks. No business logic, purely presentational.

- **`BaseCard.vue`**
  - Props: none (or optional `class` passthrough via `$attrs`).
  - Template: a single `<div>` wrapper applying the shared card styles (background, border, border-radius, padding, zoom-fade-in animation).
  - Uses a default `<slot>` for content.
  - Replaces the duplicated `.error-card`, `.info-card`, and `.author-card` container styles with one component.

- **`IconBadge.vue`**
  - Props: `icon: string`, `variant: "error" | "info"`.
  - Template: the circular icon element (36×36, centered text, border-radius 50%).
  - Uses `variant` to switch background/text colour (`error` → red tones, `info` → blue tones).
  - Replaces the duplicated `.error-icon` / `.info-icon` styles.

- **`LookupButton.vue`**
  - Props: `loading: boolean`.
  - Emits: `click`.
  - Template: the button with conditional spinner or label, replacing the `setButtonLoading` logic in `popup.ts`.

#### Molecules (`src/components/molecules/`)

Combine atoms into small, reusable units.

- **`StatusCard.vue`**
  - Props: `icon: string`, `variant: "error" | "info"`.
  - Uses a default `<slot>` for the message content.
  - Template: composes `BaseCard` + `IconBadge` in the shared flex layout (icon on the left, message on the right).
  - This single molecule replaces both `showError` and `showUnsupportedPage` — they differ only by icon character, colour variant, and message content.

#### Organisms (`src/components/organisms/`)

Feature-level components composed from atoms and molecules.

- **`AuthorCard.vue`**
  - Props: `data: AuthorData`.
  - Emits: `refresh`.
  - Template: composes `BaseCard` as the container, then renders the author heading, `<dl>` data grid (category, difficulty, rate limit), and a refresh button inside it.

- **`ErrorMessage.vue`**
  - Props: `message: string`.
  - Template: `<StatusCard icon="!" variant="error">` with the error message in the slot.

- **`UnsupportedPage.vue`**
  - Template: `<StatusCard icon="i" variant="info">` with the "Navigate to quotes.toscrape.com" message in the slot.

### Step 5 — Delete replaced files

- Delete `src/ui/renderer.ts` — replaced by Vue components.
- Delete `src/ui/popup.ts` — replaced by `App.vue` + `main.ts`.
- The `src/ui/` directory is no longer needed.

### Step 6 — Keep non-UI modules unchanged

These modules have no DOM dependency and remain as-is:

- `src/services/author-api.ts` — imported directly by `App.vue`.
- `src/extractors/quote-extractor.ts` — still passed to `chrome.scripting.executeScript`.
- `src/utils/url-matcher.ts` — imported directly by `App.vue`.
- `src/utils/title-case.ts` — imported by `AuthorCard.vue`.

### Step 7 — Switch to Vue Test Utils for unit tests

- Remove `jsdom` from devDependencies (Vitest can use jsdom via config).
- Install: `@vue/test-utils`.
- Configure Vitest environment in `vite.config.ts` or `vitest.config.ts`: set `test.environment` to `"jsdom"`.
- Rewrite component tests in `tests/unit/`:
  - **Atoms:**
    - **`base-card.test.ts`**: mount `BaseCard` with slot content, assert content renders inside the card wrapper.
    - **`icon-badge.test.ts`**: mount `IconBadge` with each variant, assert correct icon text and colour classes.
    - **`lookup-button.test.ts`**: mount with `loading: false`, assert label text. Mount with `loading: true`, assert spinner renders. Simulate click and assert emit.
  - **Molecules:**
    - **`status-card.test.ts`**: mount `StatusCard` with icon, variant, and slot content. Assert `IconBadge` renders with correct props and slot message appears.
  - **Organisms:**
    - **`author-card.test.ts`**: mount `AuthorCard` with props, assert rendered text contains category/difficulty/rate limit, simulate refresh click and assert emit.
    - **`error-message.test.ts`**: mount `ErrorMessage` with a message prop, assert `StatusCard` renders with error variant and the message.
    - **`unsupported-page.test.ts`**: mount `UnsupportedPage`, assert `StatusCard` renders with info variant and the quotes.toscrape.com link.
- Existing non-UI tests (`url-matcher.test.ts`, `title-case.test.ts`, `author-api.test.ts`, `quote-extractor.test.ts`) remain unchanged — they test pure functions with no DOM framework dependency.

### Step 8 — Add Playwright E2E tests

- Install: `playwright`, `@playwright/test`.
- Add script: `"test:e2e": "playwright test"`.
- Create `playwright.config.ts` at the extension root.
- Create `tests/e2e/popup.test.ts`:
  - Load the extension as an unpacked extension using Playwright's Chrome extension support (`--load-extension` flag via `chromium.launchPersistentContext`).
  - **Test: unsupported page** — navigate to a non-quotes page, open the popup, assert the unsupported page message is visible.
  - **Test: successful lookup** — navigate to `https://quotes.toscrape.com`, open the popup, click "Get Author Data", assert the author card renders with category, difficulty, and rate limit fields.
  - **Test: author not found** — requires the local API to be running. Mock or use a page with an author name not in the dataset, assert the error card renders.
  - **Test: API unreachable** — stop the local API, click lookup, assert the "Could not connect" error message renders.

### Step 9 — Document atomic design in CLAUDE.md

Update the "Chrome Extension" section of `CLAUDE.md` to reflect the Vue.js migration and atomic design structure, mirroring the style used for the backend hexagonal architecture section.

- Replace the **Directory Structure** block with the updated tree (components/atoms, molecules, organisms).
- Replace the **Principles** subsection with a new **Component Responsibilities** subsection using the same bullet-per-layer format as "Layer Responsibilities" in the backend section:
  - **Atoms** (`components/atoms/`): Smallest visual building blocks. Purely presentational — no business logic, no API calls. Accept props and emit events. Examples: `BaseCard`, `IconBadge`, `LookupButton`.
  - **Molecules** (`components/molecules/`): Compose multiple atoms into a reusable unit that serves a single UI purpose. Still no business logic. Example: `StatusCard` combines `BaseCard` + `IconBadge`.
  - **Organisms** (`components/organisms/`): Feature-level components that may contain domain-specific content or wire up to services. Composed from atoms and molecules. Examples: `AuthorCard`, `ErrorMessage`, `UnsupportedPage`.
  - **Services** (`services/`): Handle all fetch calls and response transformation. No DOM or Vue dependency.
  - **Extractors** (`extractors/`): Pure functions for DOM scraping, executed in the page context. No Vue dependency.
  - **Utils** (`utils/`): Shared pure helpers. No Vue or DOM dependency.
- Add a **Composition Rule** subsection with an ASCII dependency diagram, matching the backend's "Dependency Rule" style:
  ```
  organisms → molecules → atoms
      ↓
  services / extractors / utils
  ```
  Atoms never import molecules or organisms. Molecules never import organisms. Services, extractors, and utils are standalone — they may be imported by any component layer but never import from the component tree.
- Update the **Testing** subsection to reflect Vue Test Utils for component tests and Playwright for E2E, with test directories mirroring the component hierarchy (atoms/, molecules/, organisms/).

### Updated directory structure after Phase 3

```
chrome-extension/
├── src/
│   ├── components/
│   │   ├── atoms/               # Smallest building blocks
│   │   │   ├── BaseCard.vue
│   │   │   ├── IconBadge.vue
│   │   │   └── LookupButton.vue
│   │   ├── molecules/           # Compositions of atoms
│   │   │   └── StatusCard.vue
│   │   └── organisms/           # Feature-level components
│   │       ├── AuthorCard.vue
│   │       ├── ErrorMessage.vue
│   │       └── UnsupportedPage.vue
│   ├── services/                # Unchanged
│   │   └── author-api.ts
│   ├── extractors/              # Unchanged
│   │   └── quote-extractor.ts
│   ├── utils/                   # Unchanged
│   │   ├── url-matcher.ts
│   │   └── title-case.ts
│   ├── App.vue                  # Root component (replaces popup.ts)
│   └── main.ts                  # Vue app entry point
├── popup.html                   # Updated to mount Vue app
├── popup.css
├── manifest.json
├── vite.config.ts
├── playwright.config.ts
├── tests/
│   ├── unit/
│   │   ├── atoms/
│   │   │   ├── base-card.test.ts
│   │   │   ├── icon-badge.test.ts
│   │   │   └── lookup-button.test.ts
│   │   ├── molecules/
│   │   │   └── status-card.test.ts
│   │   ├── organisms/
│   │   │   ├── author-card.test.ts
│   │   │   ├── error-message.test.ts
│   │   │   └── unsupported-page.test.ts
│   │   ├── url-matcher.test.ts
│   │   ├── title-case.test.ts
│   │   ├── author-api.test.ts
│   │   └── quote-extractor.test.ts
│   └── e2e/
│       └── popup.test.ts        # Playwright tests
├── tsconfig.json
└── package.json
```

---

## Phase 4: Tailwind CSS Migration (`chrome-extension/`)

Replace raw CSS (CSS custom properties, scoped `<style>` blocks, and global stylesheets) with Tailwind CSS utility classes.

### Step 1 — Install and configure Tailwind

- Install dependencies: `tailwindcss`, `@tailwindcss/vite`.
- Add the Tailwind Vite plugin to `vite.config.ts`:
  ```ts
  import tailwindcss from "@tailwindcss/vite";
  // add tailwindcss() to the plugins array
  ```
- Create `src/app.css` as the Tailwind entry point:
  ```css
  @import "tailwindcss";
  ```
- Import `./app.css` in `src/main.ts`.

### Step 2 — Configure the custom theme

The current design uses a custom colour palette defined in `styles/tokens.css` (CSS custom properties for `blue-*`, `grey-*`, and `error-*`). Map these to Tailwind's theme system.

- Add a `@theme` block in `src/app.css` to define custom colours:
  ```css
  @import "tailwindcss";

  @theme {
    --color-blue-50: #f0f0fb;
    --color-blue-100: #c4d8f5;
    --color-blue-200: #96bfee;
    --color-blue-300: #6ba0e5;
    --color-blue-400: #3f83dc;
    --color-blue-500: #1d62dd;
    --color-blue-600: #1752ba;
    --color-blue-700: #124297;
    --color-blue-800: #003274;
    --color-blue-900: #082351;

    --color-grey-50: #f0f2f5;
    --color-grey-100: #d8dce3;
    --color-grey-200: #bec4ce;
    --color-grey-300: #a1a9b0;
    --color-grey-400: #7e879a;
    --color-grey-500: #5e677c;
    --color-grey-600: #4a5264;
    --color-grey-700: #373e4d;
    --color-grey-800: #262b37;
    --color-grey-900: #161a22;

    --color-error-bg: #3f1a1a;
    --color-error-text: #f87171;
  }
  ```
- This replaces the CSS custom properties in `styles/tokens.css` with Tailwind theme tokens accessible via utility classes (e.g. `bg-grey-800`, `text-blue-300`, `border-grey-700`).

### Step 3 — Define custom utilities for animations

The extension uses three custom animations: `zoom-fade-in` (card entrance), `spin` (loading spinner), and `fade-out` (button exit). Tailwind includes a `spin` animation by default. Define the other two as custom utilities in `src/app.css`:

```css
@utility animate-zoom-fade-in {
  animation: zoom-fade-in 0.4s ease-out;
}

@utility animate-fade-out {
  animation: fade-out 0.4s ease-out forwards;
}

@keyframes zoom-fade-in {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes fade-out {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.95);
  }
}
```

### Step 4 — Migrate global styles (`popup.css`)

Replace `styles/popup.css` content with Tailwind utilities applied directly in templates:

- **`body`** styles → move `w-[350px] h-[220px] p-4 bg-grey-900 text-grey-100 font-['Open_Sans',system-ui,sans-serif]` to the `<body>` or `<main>` tag in `popup.html`, or apply via a `@layer base` block in `src/app.css`.
- **`main`** flex layout → `flex flex-col h-full` on `<main>` in `popup.html`.
- **`#app`** gap → `flex flex-col gap-3 h-full` applied in `App.vue` or `popup.html`.
- **`h1`** styles → `flex items-center gap-2 text-lg text-grey-50` applied in `PopupLayout.vue`.
- Remove `styles/popup.css` once all styles are migrated.

### Step 5 — Migrate atom components

**`BaseCard.vue`**:
- Replace `<div class="base-card">` with `<div class="bg-grey-800 border border-grey-700 rounded-lg p-4 animate-zoom-fade-in">`.
- Remove the `<style scoped>` block entirely.

**`IconBadge.vue`**:
- Replace the class-based variant logic with dynamic Tailwind classes.
- Base classes: `flex items-center justify-center shrink-0 w-9 h-9 rounded-full text-lg font-bold`.
- Error variant: `bg-error-bg text-error-text`.
- Info variant: `bg-blue-900 text-blue-300 italic`.
- Remove the `<style scoped>` block.

**`LookupButton.vue`**:
- Button base: `inline-flex items-center justify-center gap-2 w-full py-2.5 font-inherit text-sm bg-blue-500 text-grey-50 border-none rounded-md cursor-pointer transition-colors`.
- Hover: `hover:bg-blue-600`.
- Disabled: `disabled:bg-grey-700 disabled:text-grey-400 disabled:cursor-not-allowed`.
- Material icon span: `text-xl`.
- Spinner: `inline-block w-5 h-5 border-2 border-grey-400 border-t-grey-50 rounded-full animate-spin align-middle`.
- Remove the `<style scoped>` block.

### Step 6 — Migrate molecule components

**`StatusCard.vue`**:
- Replace `<div class="status-card">` with `<div class="flex items-center gap-3.5">`.
- Replace `<div class="status-card__message">` with `<div class="text-sm text-grey-100 leading-normal">`.
- Remove the `<style scoped>` block.

### Step 7 — Migrate organism components

**`AuthorCard.vue`**:
- `.author-card` → `relative`.
- `h2` → `text-base mb-3 text-grey-50`.
- `dl` → `grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 mb-2`.
- `dt` → `font-semibold text-sm text-grey-400`.
- `dd` → `text-sm text-grey-200`.
- Refresh button → `absolute bottom-0 right-0 w-8 h-8 p-0 bg-transparent border border-grey-700 rounded-md text-grey-400 text-lg cursor-pointer transition-colors flex items-center justify-center hover:bg-grey-700 hover:text-grey-50`.
- Remove the `<style scoped>` block.

**`UnsupportedPage.vue`**:
- Replace `<a>` styles with `text-blue-300` on the `<a>` tag.
- Remove the `<style scoped>` block.

**`ErrorMessage.vue`**:
- Already has no `<style>` block. No changes needed.

### Step 8 — Migrate template and page components

**`PopupLayout.vue`**:
- `.content-area` → `flex-1 flex items-center [&>*]:w-full`.
- Remove the `<style scoped>` block.

**`LookupPage.vue`**:
- `.fade-leave-active` → apply `animate-fade-out` class via Vue's `<Transition>` `leave-active-class` prop: `<Transition leave-active-class="animate-fade-out">`.
- Remove the `<style scoped>` block.

### Step 9 — Clean up

- Delete `styles/tokens.css` — replaced by Tailwind `@theme`.
- Delete `styles/popup.css` — replaced by utility classes.
- Remove the `styles/` directory.
- Update `popup.html`: remove the `<link>` tags for `styles/tokens.css` and `styles/popup.css`. The Tailwind styles are injected by Vite via the CSS import in `main.ts` and output to `dist/style.css`.
- Verify no `<style>` blocks remain in any `.vue` files.
- Run `npm run build` and confirm the extension works with no visual changes.

### Step 10 — Update tests

- Component tests should still pass as-is since they test behaviour, not CSS classes.
- If any tests assert specific class names, update them to match the new Tailwind utility classes.
- Run `npm test` to confirm all tests pass.

### Step 11 — Update documentation

- Update `chrome-extension/README.md` to mention Tailwind CSS as a styling dependency.
- Update the `CLAUDE.md` Style section to note that Tailwind utility classes are used instead of raw CSS, and that `src/app.css` is the Tailwind entry point containing theme tokens and custom animation utilities.
