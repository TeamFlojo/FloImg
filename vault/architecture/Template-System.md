# Template System Architecture

Templates are pre-built workflow definitions that users can load into FloImg Studio.

## Architecture

**API-first with offline fallback:**

1. **Primary**: Fetch from `api.floimg.com/api/templates`
2. **Cache**: localStorage persists templates for offline use
3. **Seed**: Bundled `seed-templates.json` for cold start / air-gapped

This ensures FloImg Studio works fully offline for self-hosted and air-gapped deployments.

## Template Interface

```typescript
interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  generator: string;
  workflow: { nodes: StudioNode[]; edges: StudioEdge[] };
  tags?: string[];
  requiresCloud?: boolean;
  requiresAuth?: boolean;
  preview?: { imageUrl: string };
  capabilities?: { claudeCodeReady?: boolean; pipeline?: boolean };
}
```

Type definition: `apps/studio/shared/src/types/template.ts`

## Usage in FloImg Studio

The TemplateGallery component fetches templates from the API with fallback:

```typescript
import seedTemplates from "../data/seed-templates.json";

async function fetchTemplates(apiUrl: string): Promise<Template[]> {
  const cacheKey = "floimg-templates-cache";

  try {
    const res = await fetch(`${apiUrl}/api/templates`);
    if (!res.ok) throw new Error("API error");
    const { templates } = await res.json();
    localStorage.setItem(cacheKey, JSON.stringify(templates));
    return templates;
  } catch {
    // Offline: try cache, then seed
    const cached = localStorage.getItem(cacheKey);
    return cached ? JSON.parse(cached) : seedTemplates;
  }
}
```

## Seed Templates

OSS Studio bundles templates in `apps/studio/frontend/src/data/seed-templates.json`:

- `revenue-chart` - QuickChart bar chart
- `branded-qr` - QR code with logo
- `architecture-diagram` - Mermaid diagram
- `screenshot-annotate` - Screenshot with annotations

These work fully offline without API access. They're exported from the cloud database via `floimg-cloud/scripts/export-templates.ts`.

## Cloud Templates

Templates with `requiresCloud: true` require FloImg Studio Cloud:

- AI image generation (DALL-E, etc.)
- Cloud storage integration
- Usage tracking

OSS Studio displays these templates but shows a "Requires Cloud" badge.

## Template Categories

Templates are organized by use case:

| Category     | Examples                         |
| ------------ | -------------------------------- |
| AI Workflows | DALL-E generation, AI variations |
| Data Viz     | Charts, graphs, diagrams         |
| Marketing    | Social media assets, branding    |
| Utilities    | QR codes, format conversion      |

## API Endpoints

| Endpoint                 | Auth | Description                  |
| ------------------------ | ---- | ---------------------------- |
| `GET /api/templates`     | No   | List public templates        |
| `GET /api/templates/:id` | No   | Get single template          |
| `POST /api/templates`    | Yes  | Promote workflow to template |

See floimg-cloud `vault/architecture/API-Reference.md` for full documentation.

## Related Docs

- [[Monorepo-Guide]] - Package development
- `apps/studio/frontend/src/components/TemplateGallery.tsx` - Implementation
