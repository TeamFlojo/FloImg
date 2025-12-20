# Migration Notes

The vault structure is the canonical location for imgflo documentation.

## Completed Migrations

The following files from the legacy `context/` folder have been processed:

| Original File | Action | New Location |
|--------------|--------|--------------|
| `PROJECT_VISION.md` | **Deleted** | Core concepts migrated to `vault/Why-imgflo-Exists.md` and `vault/Design-Principles.md`. Business model content removed (not appropriate for OSS). |
| `PRODUCT_TECHNICAL_STRATEGY.md` | **Deleted** | Business/product strategy - not appropriate for OSS repo |
| `imgflo-core-concept.md` | **Deleted** | Content migrated to `vault/Why-imgflo-Exists.md` |
| `monetization-ideas.md` | **Deleted** | Business model content - not appropriate for OSS repo |
| `strategy-analysis.md` | **Deleted** | Business strategy - not appropriate for OSS repo |
| `CURRENT_STATE_AND_NEXT_STEPS.md` | **Deleted** | Temporal/outdated session planning |
| `imgflo-testing/imgflo-feedback.md` | **Migrated** | `vault/pm/_context/User-Feedback.md` |
| `imgflo-testing/` (test files) | **Deleted** | Test artifacts |

The following files from `docs/development/` have been migrated:

| Original File | New Location | Status |
|--------------|--------------|--------|
| `GENERATOR_STRATEGY.md` | `vault/architecture/Generator-Strategy.md` | Original kept for public docs |
| `CORE_VS_PLUGINS.md` | `vault/architecture/Core-vs-Plugins.md` | Original kept for public docs |

## Vault Structure

The vault now contains:

```
vault/
├── Why-imgflo-Exists.md         # Core problem/solution narrative
├── Design-Principles.md         # Philosophy and design decisions
├── Roadmap.md                   # Focus areas
├── _meta/
│   ├── Vault-Writing-Guidelines.md
│   ├── Code-Conventions.md
│   ├── Task-Classification.md
│   └── Migration-Notes.md       # This file
├── _templates/
│   ├── Task.md
│   ├── Bug.md
│   └── Context.md
├── architecture/
│   ├── Generator-Strategy.md    # Plugin development philosophy
│   ├── Core-vs-Plugins.md       # Decision framework
│   ├── Plugin-Architecture.md   # Plugin system design
│   ├── Workflow-Abstraction.md  # Generate/transform/save
│   ├── Pipeline-Execution-Engine.md
│   └── Schema-Capability-System.md
└── pm/
    ├── tasks/
    ├── bugs/
    └── _context/
        └── User-Feedback.md     # Collected user feedback
```

## Guidelines

The `context/` folder has been removed. All documentation should now live in:

- **vault/** - Internal documentation, architecture, tasks
- **docs/** - Public documentation for users
- **packages/*/README.md** - Package-specific documentation
