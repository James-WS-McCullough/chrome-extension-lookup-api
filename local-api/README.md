# Local API — Architecture

The backend follows a **hexagonal architecture** (ports & adapters), organising code into layers with strict dependency rules. Each layer has a single responsibility, and dependencies always point inward toward the domain.

## Layers

### Domain (`src/domain/`)

The innermost layer. Contains pure types and entities with zero imports from other layers. This is the core data shape that the rest of the application works with.

- `author.ts` — Defines the `Author` and `SamplePayload` types

### Repositories / Ports (`src/repositories/`)

Defines the **interface** (contract) for data access. No implementation — just the types and function definitions that will be implimented in the infrastructure layer.

- `AuthorRepository` — A single method: `findByName(name: string): Author | undefined`

Use cases depend on this interface, not on any concrete implementation. This is what makes the architecture swappable.

### Use Cases (`src/use-cases/`)

Application-level business logic. Each use case receives a repository interface via constructor injection and orchestrates a single operation.

- `FindAuthorUseCase` — Takes an `AuthorRepository`, calls `findByName`, returns the result

Use cases never import concrete implementations. They only know about the domain and the repository interface.

### Controllers (`src/controllers/`)

The inbound adapter. Translates HTTP requests into use case calls and use case results into HTTP responses.

- `AuthorController` — Validates the query parameter (via Zod), calls `FindAuthorUseCase`, and returns the appropriate status code and JSON response (200, 400, or 404)

### Factories (`src/factories/`)

Handles constructing use cases and their dependencies. This keeps the composition root thin — `app.ts` only needs to import from factories and controllers.

- `find-author-use-case.ts` — Instantiates `FileAuthorRepository` and injects it into `FindAuthorUseCase`

### Infrastructure (`src/infrastructure/`)

Concrete implementations of the repository interface. This is the only layer that knows about specific data sources.

- `FileAuthorRepository` — Loads data from `authors- JM.js` using `createRequire`, maps it to domain types via the mapper. Used in production.
- `InMemoryAuthorRepository` — Holds authors in a plain array, accepting them via constructor. Used in unit tests as a controllable stub.

### Mappers (`src/mappers/`)

Pure functions that convert between raw data formats and domain entities. Acts as a boundary — if the data source shape changes, only the mapper needs updating.

- `toAuthor` — Maps a `RawAuthorEntry` to an `Author`, field by field

### Composition Root (`src/app.ts`)

The only file that knows about concrete classes. Wires the factory output into the controller and registers routes on the Express app. Separated from `server.ts` so that E2E tests can import the app without starting a listener.

### Server (`src/server.ts`)

Imports the app and calls `app.listen()`. This is the entry point for running the API.

## Dependency Rule

Dependencies flow inward only. No layer may import from a layer above it.

- `server.ts` depends on `app.ts`
- `app.ts` depends on controllers and factories
- Controllers depend on use cases
- Factories depend on use cases and infrastructure
- Use cases depend on repository interfaces and domain
- Infrastructure implements repository interfaces and uses mappers
- Mappers depend on domain
- Domain depends on nothing

## Directory Structure

```
src/
├── app.ts                          # Composition root
├── server.ts                       # HTTP listener
├── domain/
│   └── author.ts                   # Author entity type
├── repositories/
│   └── author-repository.ts        # Repository interface
├── use-cases/
│   └── find-author.ts              # FindAuthorUseCase
├── controllers/
│   └── author-controller.ts        # HTTP handler
├── factories/
│   └── find-author-use-case.ts     # Use case factory
├── infrastructure/
│   ├── file-author-repository.ts   # Production repository
│   └── in-memory-author-repository.ts  # Test repository
└── mappers/
    └── author-mapper.ts            # Raw data → domain mapper
```
