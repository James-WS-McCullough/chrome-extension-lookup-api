# Chrome Extension — Vue.js + Atomic Design

## Architecture Overview

Built with Vue 3 (Composition API), Vite, and atomic design. The extension detects when the user is on `quotes.toscrape.com`, extracts the first author from the page, and looks up their data via the local API.

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
│   │   └── organisms/           # Feature-level components
│   │       ├── AuthorCard.vue
│   │       ├── ErrorMessage.vue
│   │       └── UnsupportedPage.vue
│   ├── services/                # API client, data transformation
│   │   └── author-api.ts
│   ├── extractors/              # DOM scraping logic, isolated and testable
│   │   └── quote-extractor.ts
│   ├── utils/                   # Shared helpers (URL matching, etc.)
│   │   ├── url-matcher.ts
│   │   └── title-case.ts
│   ├── App.vue                  # Root component (orchestrator)
│   └── main.ts                  # Vue app entry point
├── popup.html
├── popup.css
├── manifest.json
├── vite.config.ts
├── tests/
│   ├── unit/
│   │   ├── atoms/               # Atom component tests
│   │   ├── molecules/           # Molecule component tests
│   │   ├── organisms/           # Organism component tests
│   │   ├── url-matcher.test.ts
│   │   ├── title-case.test.ts
│   │   ├── author-api.test.ts
│   │   └── quote-extractor.test.ts
├── tsconfig.json
└── package.json
```

## Component Responsibilities

- **Atoms** (`components/atoms/`): Smallest visual building blocks. Purely presentational — no business logic, no API calls. Accept props and emit events. Examples: `BaseCard`, `IconBadge`, `LookupButton`.
- **Molecules** (`components/molecules/`): Compose multiple atoms into a reusable unit that serves a single UI purpose. Still no business logic. Example: `StatusCard` combines `BaseCard` + `IconBadge`.
- **Organisms** (`components/organisms/`): Feature-level components that may contain domain-specific content or wire up to services. Composed from atoms and molecules. Examples: `AuthorCard`, `ErrorMessage`, `UnsupportedPage`.
- **Services** (`services/`): Handle all fetch calls and response transformation. No DOM or Vue dependency.
- **Extractors** (`extractors/`): Pure functions for DOM scraping, executed in the page context. No Vue dependency.
- **Utils** (`utils/`): Shared pure helpers. No Vue or DOM dependency.

## Composition Rule

```
organisms → molecules → atoms
    ↓
services / extractors / utils
```

Atoms never import molecules or organisms. Molecules never import organisms. Services, extractors, and utils are standalone — they may be imported by any component layer but never import from the component tree.

## Testing

- **Component tests**: Use Vue Test Utils to mount and assert components in isolation.
  - Atom tests: verify props, slots, emitted events.
  - Molecule tests: verify atom composition and slot rendering.
  - Organism tests: verify rendered data, user interactions, and emitted events.
- **Non-UI tests**: Pure function tests for services, extractors, and utils (no Vue dependency).
- Test file naming: `*.test.ts` in the `tests/` directory, mirroring the component hierarchy.

## Scripts

- `npm run dev` — Vite build in watch mode for development.
- `npm run build` — Type-check with `vue-tsc` then production build with Vite.
- `npm test` — Run all unit tests with Vitest.
- `npm run test:watch` — Run tests in watch mode.

## Loading the Extension

1. Run `npm run build` to generate the `dist/` folder.
2. Open `chrome://extensions` in Chrome.
3. Enable "Developer mode".
4. Click "Load unpacked" and select the `chrome-extension/` directory.
