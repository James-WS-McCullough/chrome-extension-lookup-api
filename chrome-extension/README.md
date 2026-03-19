# Chrome Extension — Vue.js + Atomic Design

## Architecture Overview

Built with Vue 3 (Composition API), Vite, Tailwind CSS, and atomic design. The extension detects when the user is on `quotes.toscrape.com`, extracts the first author from the page, and looks up their data via the local API.

## Directory Structure

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
│   │   ├── organisms/           # Feature-level components
│   │   │   ├── AuthorCard.vue
│   │   │   ├── ErrorMessage.vue
│   │   │   └── UnsupportedPage.vue
│   │   ├── pages/               # State wiring and layout composition
│   │   │   └── LookupPage.vue
│   │   └── templates/           # Structural layout slots
│   │       └── PopupLayout.vue
│   ├── extractors/              # DOM scraping logic, isolated and testable
│   │   └── quote-extractor.ts
│   ├── gateways/                # Domain-specific API access
│   │   └── author-gateway.ts
│   ├── services/                # Generic HTTP client
│   │   └── http-client.ts
│   ├── stores/                  # Reactive state management
│   │   └── lookup-store.ts
│   ├── utils/                   # Shared helpers
│   │   ├── active-tab.ts
│   │   ├── error-message.ts
│   │   ├── title-case.ts
│   │   └── url-matcher.ts
│   ├── App.vue                  # Root component (renders LookupPage)
│   ├── app.css                  # Tailwind entry point (theme tokens, custom utilities)
│   ├── env.d.ts                 # Type declarations for Vite env and Vue modules
│   └── main.ts                  # Vue app entry point
├── tests/
│   ├── unit/
│   │   ├── atoms/               # Atom component tests
│   │   │   ├── base-card.test.ts
│   │   │   ├── icon-badge.test.ts
│   │   │   └── lookup-button.test.ts
│   │   ├── molecules/           # Molecule component tests
│   │   │   └── status-card.test.ts
│   │   ├── organisms/           # Organism component tests
│   │   │   ├── author-card.test.ts
│   │   │   ├── error-message.test.ts
│   │   │   └── unsupported-page.test.ts
│   │   ├── active-tab.test.ts
│   │   ├── author-gateway.test.ts
│   │   ├── error-message.test.ts
│   │   ├── http-client.test.ts
│   │   ├── quote-extractor.test.ts
│   │   ├── title-case.test.ts
│   │   └── url-matcher.test.ts
│   └── e2e/
│       ├── popup.pw.ts          # Playwright E2E tests
│       └── popup.test.ts        # Vitest integration tests
├── icons/
│   ├── icon-16.png
│   ├── icon-48.png
│   └── icon-128.png
├── background.js
├── popup.html
├── manifest.json
├── vite.config.ts
├── playwright.config.ts
├── tsconfig.json
└── package.json
```

## Component Responsibilities

- **Atoms** (`components/atoms/`): Smallest visual building blocks. Purely presentational — no business logic, no API calls. Accept props and emit events. Examples: `BaseCard`, `IconBadge`, `LookupButton`.
- **Molecules** (`components/molecules/`): Compose multiple atoms into a reusable unit that serves a single UI purpose. Still no business logic. Example: `StatusCard` combines `BaseCard` + `IconBadge`.
- **Organisms** (`components/organisms/`): Feature-level components that may contain domain-specific content or wire up to services. Composed from atoms and molecules. Examples: `AuthorCard`, `ErrorMessage`, `UnsupportedPage`.
- **Pages** (`components/pages/`): Wire state (from the store) to organisms and handle user interactions. Thin orchestration layer — no direct API calls or DOM logic. Example: `LookupPage`.
- **Templates** (`components/templates/`): Define structural layout using named slots. No logic or state. Example: `PopupLayout`.
- **Gateways** (`gateways/`): Domain-specific API access. Translates between the HTTP client and domain types, handling error mapping. No Vue dependency.
- **Services** (`services/`): Generic HTTP client for making fetch requests. No domain knowledge or Vue dependency.
- **Stores** (`stores/`): Centralised reactive state using Vue composables. Manages the lookup lifecycle (idle, loading, success, error, unsupported).
- **Extractors** (`extractors/`): Pure functions for DOM scraping, executed in the page context. No Vue dependency.
- **Utils** (`utils/`): Shared pure helpers. No Vue or DOM dependency.

## Composition Rule

```
pages → templates → organisms → molecules → atoms
  ↓
stores → gateways → services
  ↓
extractors / utils
```

Atoms never import molecules or organisms. Molecules never import organisms. Services, extractors, and utils are standalone — they may be imported by any component layer but never import from the component tree.

## Testing

- **Component tests**: Use Vue Test Utils to mount and assert components in isolation.
  - Atom tests: verify props, slots, emitted events.
  - Molecule tests: verify atom composition and slot rendering.
  - Organism tests: verify rendered data, user interactions, and emitted events.
- **Non-UI tests**: Pure function tests for services, gateways, extractors, and utils (no Vue dependency).
- **E2E tests**: Playwright tests that load the extension in a real browser, and Vitest integration tests that exercise the full component tree.
- Test file naming: `*.test.ts` in the `tests/` directory, mirroring the component hierarchy.

## Scripts

- `npm run dev` — Vite build in watch mode for development.
- `npm run build` — Type-check with `vue-tsc` then production build with Vite.
- `npm test` — Run all unit tests with Vitest.
- `npm run test:watch` — Run tests in watch mode.
- `npm run test:e2e` — Run Playwright E2E tests.

## Loading the Extension

1. Run `npm run build` to generate the `dist/` folder.
2. Open `chrome://extensions` in Chrome.
3. Enable "Developer mode".
4. Click "Load unpacked" and select the `chrome-extension/` directory.
