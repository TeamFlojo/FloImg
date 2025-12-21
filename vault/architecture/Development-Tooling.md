# Development Tooling

Code quality and automation tooling for the floimg monorepo.

## Overview

The floimg monorepo uses a consistent set of tools to enforce code quality before commits reach the repository. Since floimg is published to npm (not deployed via Docker), the tooling focuses on local development workflows.

## Tools

| Tool        | Purpose                | Config File                      |
| ----------- | ---------------------- | -------------------------------- |
| TypeScript  | Type checking          | `tsconfig.json` per package      |
| ESLint      | Linting                | `eslint.config.js` (flat config) |
| Prettier    | Formatting             | `.prettierrc`                    |
| Husky       | Git hooks              | `.husky/`                        |
| lint-staged | Staged file processing | `package.json`                   |

## Pre-commit Workflow

Every commit triggers:

```
pnpm -r typecheck    # TypeScript across all packages
pnpm lint-staged     # ESLint + Prettier on staged files
```

This catches type errors and enforces consistent code style before code enters the repository.

## ESLint Configuration

The ESLint config (`eslint.config.js`) uses flat config format (ESLint 9+):

- `@typescript-eslint/parser` for TypeScript parsing
- `@typescript-eslint/eslint-plugin` for TS-specific rules
- `eslint-config-prettier` to disable formatting rules (Prettier handles formatting)

Key rules:

- Unused variables error (with `_` prefix exception)
- `no-explicit-any` warns (not errors) for gradual typing
- Console logging allowed (CLI tool)

## Prettier Configuration

Standard formatting (`.prettierrc`):

- Semicolons
- Double quotes
- 2-space indentation
- Trailing commas (ES5)
- 100 character line width

## Package Scripts

```bash
pnpm typecheck      # Type check all packages
pnpm lint           # Lint all packages
pnpm lint:fix       # Lint and auto-fix
pnpm format         # Format all source files
pnpm format:check   # Check formatting without writing
```

## Adding New Packages

New packages in the monorepo automatically inherit:

- Pre-commit hooks (via root Husky)
- Lint-staged processing (via root config)

Each package needs its own `tsconfig.json` with a `typecheck` script:

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit"
  }
}
```

## CI Considerations

The `prepare` script runs `husky` on install. In CI environments where git hooks are unnecessary, use `--ignore-scripts`:

```bash
pnpm install --ignore-scripts
```

## Related

- [[Plugin-Architecture]] - How plugins are structured
- [[Monorepo-Guide]] - Package development workflow
