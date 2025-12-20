# Code Conventions

Standards for code in the imgflo monorepo.

## TypeScript

### General Rules
- Strict mode enabled (`"strict": true`)
- No `as any` - fix the types properly
- No commented-out code - delete it (git has history)
- No stale TODOs - include task ID or fix immediately
- Comments explain "why", not "what"

### Imports
- Use explicit imports, no barrel re-exports in hot paths
- Group: external deps, internal packages, relative imports
- Prefer named exports over default exports

### Naming
- `camelCase` for variables, functions
- `PascalCase` for types, interfaces, classes
- `SCREAMING_SNAKE_CASE` for constants
- Descriptive names over abbreviations

### Error Handling
- Use custom error types for domain errors
- Always include context in error messages
- Log errors with enough info to debug

## Package Structure

Each package follows:
```
packages/imgflo-{name}/
├── src/
│   └── index.ts      # Main exports
├── dist/             # Built output (gitignored)
├── package.json
├── tsconfig.json
├── README.md
└── vitest.config.ts  # If tests exist
```

## Testing

- Use Vitest for unit tests
- Test files: `*.test.ts` or `*.spec.ts`
- Mock external services (AWS, OpenAI, etc.)
- Focus on behavior, not implementation

## Git Commits

Use conventional commits:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation only
- `refactor:` - Code change that neither fixes nor adds
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Example:
```
feat(imgflo-qr): add custom color support

Allow users to specify foreground and background colors
for generated QR codes.
```

## Plugin Development

See [[MONOREPO]] for full guide. Key conventions:
- Export generators/transforms from `src/index.ts`
- Use `createGenerator` or `createTransform` helpers
- Include comprehensive parameter schemas
- Provide meaningful default values
