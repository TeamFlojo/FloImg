# Vault Writing Guidelines

Standards for documentation in the imgflo vault.

## Document Types

### Evergreen Documents (architecture/, product/)
- Describe current state, not future plans
- No temporal language: avoid "will", "recently", "soon", "currently", "now"
- Update when reality changes, not when plans change
- Use wiki links: `[[Document Name]]`

### PM Documents (pm/)
- Temporal language allowed
- Track with task IDs (T-YYYY-NNN, BUG-YYYY-NNN)
- Link to relevant evergreen docs
- Include dates and status

### Context Documents (pm/_context/)
- Working notes during task execution
- Decisions, challenges, open questions
- Can be messy - distill to evergreen docs when done

## Formatting Standards

### Frontmatter
All task/bug files use YAML frontmatter:

```yaml
---
tags: [type/task]
status: backlog
priority: p2
created: 2025-12-08
updated: 2025-12-08
parent:
children: []
github_issue:
---
```

### Status Values
- `backlog` - Not yet started, in queue
- `in-progress` - Actively being worked on
- `paused` - Started but temporarily stopped
- `completed` - Done and verified
- `deferred` - Postponed indefinitely
- `cancelled` - Will not be done

### Priority Values
- `p0` - Critical, drop everything
- `p1` - High priority, do soon
- `p2` - Normal priority (default)
- `p3` - Low priority, nice to have

## Wiki Links

Use double-bracket links for internal references:
- `[[Task-Classification]]` - Links to document
- `[[T-2025-001-feature-name]]` - Links to task

## File Naming

- Use kebab-case: `My-Document-Name.md`
- Tasks: `T-YYYY-NNN-short-description.md`
- Bugs: `BUG-YYYY-NNN-short-description.md`
- Context: `T-YYYY-NNN-context.md`

## Temporal Language Examples

**Wrong** (in evergreen docs):
- "We will add support for..."
- "Recently implemented..."
- "Currently working on..."
- "Soon we'll have..."

**Right**:
- "The system supports..."
- "Implemented in v0.4.0..."
- "The architecture uses..."
- "Planned for future versions (see roadmap)..."
