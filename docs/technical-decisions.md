# Technical Decisions & Trade-offs

This document captures the reasoning behind key technical decisions in the project, along with counterpoints for when a different choice might be more appropriate.

---

## Language & Tooling

### TypeScript with Strict Mode

**Decision:** Use TypeScript throughout the project (backend and extension) with `strict: true` enabled.

**Reasoning:** TypeScript provides clear communication — anyone picking up the project can more easily understand what the code is doing. It also limits developer mistakes caused by misremembering the types of object values, function parameters, or return types. Strict mode enforces this discipline consistently.

**Counterpoint:** Adding strict typing takes time and introduces verbosity. For a simple automation, a quick prototype, or a throwaway script, the overhead may not be justified.

---

### Hexagonal Architecture (Ports & Adapters)

**Decision:** Organise the backend into three root layers — `domain/`, `application/`, and `infrastructure/` — following classic DDD structure, with dependencies pointing inward only.

- **Domain** contains `entities/` (pure types) and `repositories/` (interface contracts).
- **Application** contains `use-cases/` that depend only on domain interfaces.
- **Infrastructure** contains `repositories/` (concrete implementations), `mappers/`, `controllers/`, and `factories/`.

**Reasoning:** Hexagonal architecture is a good blueprint for keeping large API projects clean. Although this is a toy example, the API is built as if it would be expanded into a full-scale project. The layer separation makes it straightforward to swap implementations (e.g. replace the file-based data source with a database) without touching business logic. Placing repository interfaces in the domain ensures the dependency flow is strictly inward — application and infrastructure depend on domain, never the reverse.

**Counterpoint:** If the project is guaranteed to remain a simple automation or single use case, this level of layer separation adds unnecessary complexity. A single route handler with inline logic would be faster to build and easier to follow for a small scope.

---

### Biome over ESLint + Prettier

**Decision:** Use Biome as a single tool for both linting and formatting, configured via a single `biome.json` file.

**Reasoning:** Having a formatter is valuable for enforcing consistent naming conventions for functions and files across a project. ESLint and Prettier can have conflicting configurations, and these conflicts can differ between devices, causing crashes. Biome provides a more stable experience as a single tool — the one-stop `biome.json` makes it easy to configure all rules in one place without managing compatibility between separate tools.

**Counterpoint:** Biome is newer and has a smaller ecosystem than ESLint. ESLint has a vast plugin library (e.g. framework-specific rules for React, Angular) and wider community support. For projects that need highly specialised lint rules or rely on specific ESLint plugins, the mature ESLint ecosystem may be the better choice.

---

### Vitest for Testing

**Decision:** Use Vitest as the test framework for both the backend and the Chrome extension.

**Reasoning:** Vitest has been faster than Jest in practice. It also has native ESM support, which avoids the configuration friction that Jest can introduce with ES module projects.

**Counterpoint:** This is a flexible choice — Jest, Mocha, or other frameworks would work equally well. Jest has a larger ecosystem and is the default in many project scaffolds. For teams already familiar with Jest, switching to Vitest offers marginal benefit.

---

### Manual Constructor Injection (No IoC Container)

**Decision:** Use manual constructor injection to wire dependencies. A factory layer (`infrastructure/factories/`) handles constructing use cases and their dependencies (e.g. selecting and instantiating the repository, injecting it into the use case). The composition root (`app.ts`) only imports from factories and controllers — it never touches repositories or domain directly.

**Reasoning:** Manual wiring is explicit and easy to trace — there's no hidden resolution logic. The factory layer keeps use case construction contained in one place, so if the repository implementation changes (e.g. switching from file-based to database-backed), only the factory needs updating. Meanwhile `app.ts` remains a thin layer that maps controllers to routes, keeping the dependency graph visible without introducing decorator-based "magic" from a DI container.

**Counterpoint:** For large projects with many interdependent services, manually wiring every dependency becomes tedious and error-prone. A DI container (e.g. InversifyJS, tsyringe) can automate resolution and manage lifecycles (singletons, scoped instances). However, for most small-to-medium APIs, manual injection is simpler and sufficient.

---

### Explicit Field-by-Field Mapper

**Decision:** The `toAuthor` mapper explicitly maps each property from `RawAuthorEntry` to the domain `Author` type, rather than using a type assertion (`as Author`) or object spread.

**Reasoning:** This ensures we fail fast, not silently. If the data source structure changes, the TypeScript compiler will flag mismatches at build time rather than allowing malformed data to slip through into production. Manually typing the mapper minimises the possibility of shape mismatches going unnoticed. It also makes field renames straightforward — if a field name changes in the data source, only the mapper needs updating and the change is clearly visible in one place.

**Counterpoint:** For data sources with a stable, well-defined schema (e.g. a versioned API with contract tests), this level of explicit mapping adds boilerplate without much benefit. A type assertion or spread would be simpler and sufficient when the raw data is guaranteed to match the domain shape.

---

### Express 5

**Decision:** Use Express as the HTTP framework for the backend API.

**Reasoning:** Express is a familiar, well-documented framework with the largest Node.js ecosystem. For a single-endpoint local API, framework performance is not a concern. Version 5 adds native async error handling, which was the biggest pain point of earlier versions.

**Counterpoint:** Fastify offers better performance (~2-3x faster in benchmarks) and built-in schema validation for production APIs under load. Hono is lighter and designed for edge deployment (Cloudflare Workers, Deno, Bun). Either would be worth evaluating for a project with real performance requirements or deployment beyond localhost.

---

### Zod for Input Validation

**Decision:** Use Zod schemas to validate incoming request parameters in controllers, rather than manual conditional checks.

**Reasoning:** Zod provides a clear, consistent framework for validation. Schemas can be defined once and reused — if multiple endpoints expect the same input shape, keeping them consistent is straightforward. It also gives type-safe parsed output, so the validated data is correctly typed downstream without additional assertions.

**Counterpoint:** For a single endpoint with one query parameter, a simple `if (!req.query.author)` check is fewer lines and introduces no dependency. Zod adds a runtime library to the bundle. Manual checks may be more appropriate when validation logic is trivial and unlikely to be reused.

---

## Chrome Extension

### Tailwind CSS

**Decision:** Use Tailwind CSS for all popup styling via utility classes applied directly in Vue component templates. The custom colour palette (blue and cool grey ladders, plus semantic error tokens) is defined in a `@theme` block inside `src/app.css`, alongside custom animation utilities. No scoped `<style>` blocks are used in Vue components.

**Reasoning:** Tailwind is a commonly used, clean CSS framework that enforces design consistency through a constrained set of utility classes. It eliminates the need to maintain separate CSS files or scoped style blocks — styles live directly in the template where they're used, making it easy to see what a component looks like without switching between files. The `@theme` configuration provides a single source of truth for the colour palette, and custom `@utility` definitions handle project-specific animations. Since Vite already handles the build, adding the `@tailwindcss/vite` plugin integrates cleanly with no additional tooling.

**Counterpoint:** Utility classes can make templates verbose and harder to read when many styles are applied to a single element. For teams unfamiliar with Tailwind, there is a learning curve in mapping CSS properties to utility class names. Vanilla CSS with scoped styles offers better encapsulation per component and avoids the Tailwind dependency entirely — for a small popup with few states, the framework overhead may not pay for itself.

---

### Vue.js with Atomic Design

**Decision:** Use Vue.js to build the popup UI, organised using atomic design across five levels: atoms, molecules, organisms, templates, and pages. State management is centralised in a composable store (`stores/lookup-store.ts`) with a `LookupStatus` enum. API communication is separated into a generic HTTP client (`services/http-client.ts`) and a domain-specific gateway (`gateways/author-gateway.ts`).

**Reasoning:** The initial prototype used direct DOM manipulation to get something working quickly, but was then refactored to Vue.js for a cleaner frontend developer experience. Vue's component model enabled atomic design, which makes future additions to the extension straightforward — new UI features can be composed from existing atoms and molecules without touching unrelated code. The full atomic design hierarchy (templates for layout, pages for state wiring) keeps each component focused on a single responsibility. Extracting state into a store avoids prop-drilling and makes the page component a thin wiring layer. The HTTP client / gateway split mirrors the backend's hexagonal approach, keeping fetch concerns separate from domain logic.

**Counterpoint:** Vue adds a runtime dependency and increases the bundle size compared to vanilla DOM manipulation. For an extension popup that will never grow beyond a few states, the framework overhead may not pay for itself. React or Svelte would offer similar component-based benefits — Vue's advantage here is primarily familiarity and its lightweight single-file component model, not a clear technical differentiator.

---

### Frontend-Side Field Filtering

**Decision:** The API returns the full author object. The Chrome extension selects which fields to display (category, difficulty, rate limit per minute).

**Reasoning:** This was specified in the project requirements. The spec explicitly requested that filtering happens on the frontend side.

**Counterpoint:** In a typical production setup, filtering would happen on the backend — either at the controller level by mapping to a response DTO, or at the domain entity level if certain fields aren't needed at all. Returning only the relevant fields reduces payload size, limits data exposure, and keeps the frontend from needing to know the full data shape. Backend filtering is generally the preferred approach unless the API is designed to serve multiple consumers with different display needs.

---

### Vite for Bundling

**Decision:** Use Vite to bundle the Chrome extension's Vue.js frontend.

**Reasoning:** Once the extension moved to Vue.js, Vite was the natural choice. It is built by the same team as Vue, has first-class support via `@vitejs/plugin-vue`, and provides hot module replacement, fast builds, and a plugin ecosystem that integrates cleanly with the Vue toolchain.

**Counterpoint:** Webpack offers more granular control over the build pipeline (code splitting, asset management, loader chains) and has wider adoption in Chrome extension projects with established community templates. For a simple popup with a single entry point, Vite's dev server and HMR capabilities go largely unused — the extension is built once and loaded statically. esbuild alone would produce a smaller, faster build if Vue were not in the picture.

---

## Project Standards

### Lefthook for Git Hooks

**Decision:** Use Lefthook to run Biome checks on pre-commit (linting and formatting staged files) and TypeScript type-checking plus tests on pre-push.

**Reasoning:** Git hooks keep the repository clean and well-formatted by catching issues before they're committed or pushed. Lefthook has worked well alongside Biome, with a simple YAML configuration and parallel hook execution.

**Counterpoint:** Husky is more widely adopted and would work just as well. There isn't a significant difference between the two for this use case. The choice is largely a matter of preference and prior experience.

---

### No Code Comments

**Decision:** Avoid comments in code as a default. Rely on intention-revealing names for functions, variables, and files. If logic requires a comment to be understood, extract it into a named function instead. Exceptions are made where a comment adds contextual value that the code alone cannot convey — for example, explaining the architectural purpose of a layer boundary or to offer some context missing in this single endpoint implementation.

**Reasoning:** Comments, if not updated alongside the code, can become more misleading than helpful. Using clear names to explain the code means there are no legacy comments that contradict what the code actually does. If something is complex enough to need a comment, extracting it as a separately named function makes the intent self-evident and keeps the explanation tied to the code itself. Allowing targeted exceptions ensures that genuinely useful context — the _why_ behind a decision — is preserved where it matters most.

**Counterpoint:** Some teams prefer a more liberal commenting approach, especially in codebases with high contributor turnover. The risk of stale comments can also be mitigated through code review discipline rather than a near-blanket ban. The line between "adds contextual value" and "unnecessary" is subjective, so consistency depends on team judgement.

---

## Testing

### Supertest for E2E Tests

**Decision:** Use Supertest to make HTTP requests against the Express app in E2E tests, without starting a server.

**Reasoning:** Supertest makes writing test cases easy with a fluent API and clearer assertions than raw fetch. It also removes the need to manage a running server during tests — it handles the lifecycle internally.

**Counterpoint:** Playwright or other HTTP testing tools would work equally well. For tests that need to verify behaviour across a real network boundary (e.g. testing CORS, timeouts, or load balancers), a real running server with fetch or an HTTP client would be more representative of production conditions. You could also ensure a freshly seeded database schema for each test to allow for realistic but easily reproducible conditions.

---

### Separate `app.ts` and `server.ts`

**Decision:** Split the composition root (`app.ts`, which wires dependencies and routes) from the server listener (`server.ts`, which calls `app.listen()`).

**Reasoning:** If the server starts listening on a port when imported, it will conflict with a pre-existing running instance during testing. By separating the responsibilities, E2E tests can import the app and pass it to Supertest without starting a real server, avoiding port conflicts and keeping tests isolated.

**Counterpoint:** For projects that don't need E2E tests against the app object, or where tests spin up the server on a random port, a single file is simpler and avoids the extra indirection.

---

### In-Memory Dataset (No Database)

**Decision:** Load author data from a hardcoded JavaScript file into memory at startup, rather than connecting to a database.

**Reasoning:** This was part of the project specification. The dataset is small and static, so an in-memory lookup is sufficient.

**Counterpoint:** In a real project, a database with an ORM like Prisma would provide type-safe, efficient data access with support for querying, migrations, and scaling. The hexagonal architecture already accommodates this — the `FileAuthorRepository` could be replaced with a database-backed implementation without changing any other layer.

---

### Environment Variables for Configuration

**Decision:** Use `.env` files to configure the server port (`PORT`), an optional simulated delay (`SIMULATED_DELAY_MS`), and the API base URL (`VITE_API_BASE_URL`), rather than hardcoding values. The backend parses and validates all environment variables at startup through a Zod schema in `env.ts`, which coerces types and applies defaults. The Chrome extension uses Vite's `import.meta.env` to inline `VITE_API_BASE_URL` at build time, since extensions run in the browser and have no access to `process.env`.

**Reasoning:** Even though this project only runs locally, using environment variables demonstrates the standard approach for separating configuration from code. Centralising the parsing in `env.ts` with Zod validation means invalid configuration fails fast at startup with a clear error, rather than silently producing `NaN` or `undefined` results deep in the application. It also means changing the port or API URL requires editing a single `.env` file rather than searching through source files.

**Counterpoint:** For a project that will genuinely never leave localhost, `.env` files add a layer of indirection. A new developer must check the `.env` file to understand what URL the extension is hitting, whereas a hardcoded value is immediately visible in the source. The build-time inlining also means the value is still a static string in the output — it just lives in a different place.

---

### Multi-Package Structure

**Decision:** Use three `package.json` files — one each for `local-api/` and `chrome-extension/`, plus a root-level one. The root provides shared tooling (Biome, Lefthook) and delegation scripts (`api:dev`, `api:test`, `ext:build`, `ext:test`) for convenience.

**Reasoning:** The API and the Chrome extension are separate concerns with different dependencies, so they deserve their own `package.json`. The root level serves a different purpose — it handles cross-project tooling (linting, formatting, git hooks) and provides ease-of-use commands to interact with the other layers without having to `cd` into each directory.

**Counterpoint:** For larger multi-package projects, a monorepo tool like Nx or Turborepo would add dependency graph awareness, caching, and parallel task execution. For two packages with no shared code, the overhead of a monorepo tool isn't justified. Conversely, if the projects were truly independent with no shared tooling, separate repositories would provide cleaner isolation.

---
