---
tags: [type/bug, area/packages]
status: completed
priority: p1
created: 2026-01-04
completed: 2026-01-04
branch: fix/BUG-2026-003-peer-deps
---

# Bug: Plugin packages have stale peer dependencies causing install failures

## Bug Details

**Bug ID**: BUG-2026-003
**Status**: completed
**Priority**: p1
**Created**: 2026-01-04

## Description

The floimg plugin packages (`@teamflojo/floimg-mermaid`, `@teamflojo/floimg-qr`, and likely others) have stale peer dependencies on `@teamflojo/floimg@^0.2.0` instead of the current version `^0.8.0`. This causes npm install to fail with peer dependency conflicts.

## Steps to Reproduce

1. Create a new project: `npm init -y`
2. Install floimg: `npm install @teamflojo/floimg`
3. Try to install a plugin: `npm install @teamflojo/floimg-mermaid`
4. Observe: npm fails with peer dependency conflict

## Error Message

```
Could not resolve dependency:
peer @teamflojo/floimg@"^0.2.0" from @teamflojo/floimg-mermaid@0.2.1
```

## Expected Behavior

Plugin packages should install cleanly alongside the current floimg version.

## Actual Behavior

npm refuses to install due to peer dependency mismatch. Users must use `--legacy-peer-deps` workaround.

## Affected Packages (12 total, all confirmed)

All have peer dep `@teamflojo/floimg@^0.2.0` (or `^0.4.0` for claude), need `^0.8.0`:

- [x] `@teamflojo/floimg-mermaid` (0.2.1 → 0.2.2)
- [x] `@teamflojo/floimg-qr` (0.2.1 → 0.2.2)
- [x] `@teamflojo/floimg-quickchart` (0.2.1 → 0.2.2)
- [x] `@teamflojo/floimg-d3` (0.2.1 → 0.2.2)
- [x] `@teamflojo/floimg-screenshot` (0.2.1 → 0.2.2)
- [x] `@teamflojo/floimg-openai` (0.2.0 → 0.2.1)
- [x] `@teamflojo/floimg-stability` (0.2.1 → 0.2.2)
- [x] `@teamflojo/floimg-google` (0.4.0 → 0.4.1)
- [x] `@teamflojo/floimg-replicate` (0.1.0 → 0.1.1)
- [x] `@teamflojo/floimg-ollama` (0.2.1 → 0.2.2)
- [x] `@teamflojo/floimg-xai` (0.1.0 → 0.1.1)
- [x] `@teamflojo/floimg-claude` (0.2.0 → 0.2.1)

## Fix

1. Update `peerDependencies` in each affected package.json to `"@teamflojo/floimg": "^0.8.0"`
2. Bump patch versions for all affected packages
3. Release with updated peer deps

## Technical Notes

This is a release process gap - peer dependencies should be updated as part of major/minor releases of the core package. Consider adding a pre-release check.
