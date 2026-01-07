# No Backwards Compatibility (Pre-1.0)

FloImg is a pre-1.0 project. We do not optimize for backwards compatibility.

## Principle

**Delete, don't deprecate.** When changing APIs, schemas, or interfaces:

1. Remove the old code entirely
2. Update all internal usage to the new API
3. Let downstream users adapt when they upgrade

## Rationale

Backwards compatibility is premature optimization for early-stage projects:

- **Technical debt compounds** - Legacy code paths accumulate, making the codebase harder to understand and modify
- **Mental overhead** - Developers must understand both old and new patterns
- **Testing burden** - Each legacy path requires ongoing test coverage
- **False kindness** - Supporting old APIs signals they're still valid, discouraging migration

## When This Applies

- Pre-1.0 versions (current state)
- Internal APIs between FloImg packages
- Schema definitions (generators, transforms)
- CLI arguments and configuration

## When This Changes

After 1.0, we commit to semantic versioning:

- Breaking changes require major version bumps
- Deprecation warnings before removal
- Migration guides for significant changes

## Examples

### Bad: Legacy Migration Code

```typescript
// DON'T: Keep legacy parameters around
const shapesSchema = {
  parameters: {
    shapeType: { ... }, // New
    type: { ... },      // Legacy - "for backwards compatibility"
  }
};

function generate(params) {
  const migrated = migrateLegacyParams(params); // Legacy cruft
  // ...
}
```

### Good: Clean Break

```typescript
// DO: Remove old patterns entirely
const shapesSchema = {
  parameters: {
    shapeType: { ... },
    fillType: { ... },
  }
};

function generate(params) {
  const { shapeType, fillType } = params; // Clean
  // ...
}
```

## Related

- [[End-to-End-Consistency]] - Changes flow through all layers
- [[Versioning-Strategy]] - Release and versioning practices
