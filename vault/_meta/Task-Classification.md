# Task Classification

How to classify work items in imgflo.

## Work Item Types

### Task (Default)
**ID Format**: `T-YYYY-NNN`

Use for:
- Feature implementation
- Technical improvements
- Refactoring work
- Documentation updates
- Plugin development

**When in doubt, choose Task.**

### Bug
**ID Format**: `BUG-YYYY-NNN`

Use for:
- Fixing existing broken behavior
- Correcting incorrect output
- Addressing runtime errors

NOT for:
- Adding new features
- Performance improvements (use Task)
- Refactoring (use Task)

## Subtasks

Use dot notation for subtasks: `T-YYYY-NNN.1`, `T-YYYY-NNN.2`

- Subtasks share parent's context doc
- Subtasks stay in same folder as parent
- Parent cannot close while children are open

## ID Generation

1. Check existing IDs:
```bash
ls vault/pm/tasks/ | grep -o 'T-2025-[0-9]*' | sort -u | tail -1
ls vault/pm/bugs/ | grep -o 'BUG-2025-[0-9]*' | sort -u | tail -1
```

2. Increment by 1 for new ID

## GitHub Issue Linking

For OSS visibility, link vault tasks to GitHub Issues:
- Add `github_issue: #123` to frontmatter
- Use `/gh link T-YYYY-NNN #123` command
- GitHub Issue is public interface, vault task is source of truth

## Examples

**Task**: "Add WebP output support to imgflo-screenshot"
→ T-2025-001-webp-output-support

**Bug**: "QR code generator crashes with empty input"
→ BUG-2025-001-qr-empty-input-crash

**Subtask**: "Write tests for WebP output"
→ T-2025-001.1-webp-output-tests
