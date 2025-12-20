# floimg - Claude Code Quick Reference

Universal image workflow engine for developers and AI agents.

## Project Overview

- **Type**: Open-source monorepo
- **Stack**: TypeScript, pnpm workspaces
- **Packages**: 6 (core + 5 plugins)
- **npm**: @teamflojo/*

## Quick Start

```bash
pnpm install          # Install all dependencies
pnpm -r build         # Build all packages
pnpm -r test          # Test all packages
pnpm -r typecheck     # TypeScript validation
```

## Workflow Commands

### Task Lifecycle
- `/p [description]` - Plan new work (creates vault task)
- `/s T-YYYY-NNN` - Start task (creates branch, updates status)
- `/c` - Close current task (validates, optionally creates PR)
- `/ctx [note]` - Update context doc with decisions/notes
- `/st` - Quick status check (~500 tokens)
- `/w` - End-of-session wrap (saves context)

### GitHub Integration (OSS)
- `/gh link T-YYYY-NNN #123` - Link vault task to GitHub Issue
- `/gh create T-YYYY-NNN` - Create GitHub Issue from vault task
- `/gh sync` - Sync status between vault and GitHub Issues
- `/gh import #123` - Create vault task from GitHub Issue

### Escape Hatch
- `/x [request]` - Bypass PM workflow for quick tasks

## File Locations

```
packages/
├── floimg/             # Core library (exports: lib, CLI, MCP)
├── floimg-d3/          # D3 visualization plugin
├── floimg-mermaid/     # Mermaid diagram plugin
├── floimg-qr/          # QR code generator plugin
├── floimg-quickchart/  # QuickChart plugin
└── floimg-screenshot/  # Screenshot/Playwright plugin

vault/
├── _meta/              # Guidelines and conventions
├── _templates/         # Task/bug templates
├── architecture/       # Technical docs (evergreen)
└── pm/
    ├── tasks/          # Task files (T-YYYY-NNN)
    ├── bugs/           # Bug files (BUG-YYYY-NNN)
    └── _context/       # Working context docs
```

## Key Principles

1. **Read PROJECT_STATUS.md first** - Before scanning vault or asking questions
2. **Use /p before starting work** - Multi-step work needs task tracking
3. **Evergreen docs have no temporal language** - No "will", "recently", "soon"
4. **Link GitHub Issues to vault tasks** - Vault is source of truth, GH is public interface

## Plugin Development

See `vault/architecture/Monorepo-Guide.md` for plugin creation guide. Quick pattern:

```typescript
// packages/floimg-{name}/src/index.ts
import { createGenerator, GeneratorSchema } from '@teamflojo/floimg';

const schema: GeneratorSchema = {
  name: 'my-generator',
  description: 'What it does',
  parameters: {
    // Define parameters
  }
};

export const myGenerator = createGenerator(schema, async (params, ctx) => {
  // Implementation
  return ctx.createImageFromBuffer(buffer, 'output.png');
});
```

## Agents

- `coordinator` - Multi-package work spanning core + plugins
- `full-stack-dev` - Plugin development and core library work
- `code-reviewer` - PR reviews and code quality
- `vault-organizer` - Documentation maintenance

## External Contributors

External contributors use GitHub Issues. When triaging:
1. Simple bug fix -> Direct PR welcome
2. Complex work -> Create vault task, link with `/gh link`
3. Feature request -> Discuss in issue, then vault task if approved

## Resources

- [[MONOREPO]] - Development guide
- [[README]] - Public docs
- [[CHANGELOG]] - Version history
- [[vault/architecture/Plugin-Architecture]] - Plugin system design
