# Documentation Organization

This document explains how documentation is organized in the imgflo monorepo.

## Structure

```
imgflo/
├── docs/                           # Monorepo-wide documentation
│   ├── README.md                   # Documentation index
│   ├── development/
│   │   └── GENERATOR_STRATEGY.md   # Architecture philosophy
│   └── guides/
│       ├── GETTING_STARTED.md      # General getting started
│       └── AI_AGENT_GUIDE.md       # For AI agents
│
├── packages/imgflo/docs/           # Core package documentation
│   ├── guides/
│   │   ├── QUICK_START.md          # Core quick start
│   │   ├── CONFIGURATION.md        # Core configuration
│   │   ├── OPENAI_GENERATOR.md     # OpenAI (built-in)
│   │   ├── MCP_SERVER.md           # MCP server (built-in)
│   │   ├── S3_PROVIDERS.md         # Storage (core)
│   │   └── PUBLISHING.md           # Publishing core
│   └── development/                # Historical dev docs
│
├── packages/imgflo-quickchart/
│   └── README.md                   # Plugin documentation
│
├── packages/imgflo-screenshot/
│   └── README.md                   # Plugin documentation
│
├── packages/imgflo-mermaid/
│   └── README.md                   # Plugin documentation
│
├── examples/
│   └── all-plugins.ts              # Working examples
│
├── README.md                       # Main entry point
├── STATUS.md                       # Project status
└── MONOREPO.md                     # Development guide
```

## Documentation Types

### Root Level (Monorepo-wide)

**When to put docs here**: Documentation that applies to the entire project or multiple packages.

- **README.md** - Main project overview, installation, basic usage
- **STATUS.md** - Current status, roadmap, next steps
- **MONOREPO.md** - Development guide for contributors
- **DOCUMENTATION.md** - This file (meta-documentation)

### `docs/` - Shared Documentation

**When to put docs here**: Conceptual documentation that spans packages.

- **docs/development/GENERATOR_STRATEGY.md** - Architecture philosophy (applies to all generators)
- **docs/guides/GETTING_STARTED.md** - General getting started (covers core + plugins)
- **docs/guides/AI_AGENT_GUIDE.md** - For AI agents (covers all features)

### `packages/imgflo/docs/` - Core Package Docs

**When to put docs here**: Documentation specific to the core package features.

Core package includes:
- Built-in generators (shapes, openai)
- Transform system (Sharp, Resvg)
- Storage system (S3, filesystem)
- MCP server
- CLI

Core-specific documentation:
- **QUICK_START.md** - Quick reference for core features
- **CONFIGURATION.md** - Core configuration system
- **OPENAI_GENERATOR.md** - OpenAI built-in generator
- **MCP_SERVER.md** - MCP server setup and usage
- **S3_PROVIDERS.md** - Storage configuration
- **PUBLISHING.md** - Publishing core package

### `packages/{plugin}/README.md` - Plugin Docs

**When to put docs here**: Documentation specific to a plugin.

Each plugin should have comprehensive README with:
- Installation instructions
- Usage examples
- Configuration options
- All parameters documented
- Links to upstream library docs
- Troubleshooting

Examples:
- **imgflo-quickchart/README.md** - Chart.js integration
- **imgflo-screenshot/README.md** - Playwright screenshots
- **imgflo-mermaid/README.md** - Mermaid diagrams

## Finding Documentation

### I want to...

**Get started quickly**
- → [Main README](./README.md) - Overview
- → [docs/guides/GETTING_STARTED.md](./docs/guides/GETTING_STARTED.md) - Full walkthrough

**Learn about the architecture**
- → [docs/development/GENERATOR_STRATEGY.md](./docs/development/GENERATOR_STRATEGY.md)
- → [MONOREPO.md](./MONOREPO.md)

**Use core features**
- → [packages/imgflo/docs/guides/](./packages/imgflo/docs/guides/)

**Use a specific plugin**
- → Check that plugin's README:
  - [imgflo-quickchart/README.md](./packages/imgflo-quickchart/README.md)
  - [imgflo-screenshot/README.md](./packages/imgflo-screenshot/README.md)
  - [imgflo-mermaid/README.md](./packages/imgflo-mermaid/README.md)

**Develop/contribute**
- → [MONOREPO.md](./MONOREPO.md)
- → [STATUS.md](./STATUS.md)

**See examples**
- → [examples/all-plugins.ts](./examples/all-plugins.ts) - Comprehensive demo
- → [packages/imgflo/examples/](./packages/imgflo/examples/) - More examples

## Contributing Documentation

### When creating new docs:

1. **Is it about a specific plugin?**
   - ✅ Add to that plugin's README
   - ❌ Don't put in shared docs

2. **Is it about core features?**
   - ✅ Add to `packages/imgflo/docs/guides/`
   - ❌ Don't put in root docs

3. **Is it conceptual/architectural?**
   - ✅ Add to `docs/development/`
   - ❌ Don't put in package docs

4. **Is it about the monorepo itself?**
   - ✅ Add to root level
   - ❌ Don't put in package docs

### Documentation Standards

All documentation should:
- Be written in Markdown
- Include a clear title
- Have a table of contents for long docs
- Show code examples
- Link to related documentation
- Be kept up to date with code changes

## Historical Documents

`packages/imgflo/docs/development/` contains historical development documents:
- **SPEC.md** - Original specification
- **PROJECT_SUMMARY.md** - Early project summary
- **SUMMARY_v2.md** - Updated summary
- **FINAL_SUMMARY.md** - Pre-monorepo summary
- **MCP_IMPLEMENTATION.md** - MCP implementation notes
- **STATUS.md** - Old status (superseded by root STATUS.md)

These are kept for historical reference but may be outdated.

## Updating This Guide

When adding new documentation:
1. Create the document in the appropriate location
2. Update the relevant index (docs/README.md, package README, etc.)
3. Update this guide if it changes the organization
4. Link to it from relevant places

---

**Quick Links:**
- [Main README](./README.md)
- [Documentation Index](./docs/README.md)
- [Status & Roadmap](./STATUS.md)
- [Development Guide](./MONOREPO.md)
