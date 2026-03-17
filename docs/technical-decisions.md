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

**Decision:** Organise the backend into distinct layers — domain, repositories (interfaces), use cases, controllers, infrastructure, and mappers — with dependencies pointing inward only.

**Reasoning:** Hexagonal architecture is a good blueprint for keeping large API projects clean. Although this is a toy example, the API is built as if it would be expanded into a full-scale project. The layer separation makes it straightforward to swap implementations (e.g. replace the file-based data source with a database) without touching business logic.

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

**Decision:** Use manual constructor injection to wire dependencies. A factory layer (`src/factories/`) handles constructing use cases and their dependencies (e.g. selecting and instantiating the repository, injecting it into the use case). The composition root (`app.ts`) only imports from factories and controllers — it never touches repositories or infrastructure directly.

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
