# Generator Strategy

## Philosophy

imgflo is **glue, not the engine**. We orchestrate existing libraries and services, we don't reimplement them.

### Core Principles

1. **Minimal Abstraction** - Generators accept native library formats, not imgflo abstractions
2. **Thin Wrappers** - We execute and return ImageBlob, nothing more
3. **Opt-In Complexity** - Users only install generators they need
4. **No Neutering** - Full library capabilities available through pass-through params

## What imgflo Does

```typescript
// imgflo's job:
const blob: ImageBlob = await generator.generate(params);  // Execute
await upload(blob);                                         // Upload
return url;                                                 // Return URL
```

That's it. We're a pipeline orchestrator, not a charting/AI/image library.

## Generator Types

### Built-In (Core Package)

**Included in `imgflo` package:**
- `shapes` - Simple SVG shapes (no dependencies)
- `openai` - DALL-E integration (openai SDK dependency)

**Why these are built-in:**
- `shapes`: Essential, zero dependencies, always useful
- `openai`: Commonly needed, acceptable dependency size

### Separate Packages

**Community/official packages:**
- `imgflo-quickchart` - Chart.js charts via QuickChart API (no deps, just fetch)
- `imgflo-mermaid` - Diagrams via Mermaid (mermaid dependency ~2MB)
- `imgflo-qr` - QR code generation
- `imgflo-d3` - D3 visualizations
- `imgflo-screenshot` - Website screenshots via Playwright

**Why separate:**
- Users only install what they need
- Keeps core lean
- Community can contribute generators
- Different update cycles

## Pass-Through Pattern

Generators accept **native library formats**, not imgflo abstractions.

### Example: QuickChart Generator

```typescript
// User uses Chart.js format directly
await imgflo.generate({
  generator: 'quickchart',
  params: {
    // This IS Chart.js config, verbatim
    type: 'bar',
    data: {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [{
        label: 'Revenue',
        data: [12, 19, 3, 5]
      }]
    },
    options: {
      // Full Chart.js options available
      scales: { y: { beginAtZero: true } }
    }
  }
});
```

**Implementation:**
```typescript
export class QuickChartGenerator implements ImageGenerator {
  name = 'quickchart';

  async generate(params: Record<string, unknown>): Promise<ImageBlob> {
    // Just pass through to QuickChart API
    const url = `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(params))}`;
    const response = await fetch(url);
    const bytes = Buffer.from(await response.arrayBuffer());

    return { bytes, mime: 'image/png' };
  }
}
```

**Documentation approach:**
> "For `params` format, see [Chart.js documentation](https://www.chartjs.org/docs/). imgflo passes your config directly to QuickChart."

No imgflo-specific abstraction layer to document.

### Example: Mermaid Generator

```typescript
await imgflo.generate({
  generator: 'mermaid',
  params: {
    // This IS Mermaid syntax, verbatim
    code: `
      graph TD
        A[Start] --> B[Process]
        B --> C[End]
    `,
    theme: 'dark'
  }
});
```

**Documentation approach:**
> "For `code` syntax, see [Mermaid documentation](https://mermaid.js.org/). imgflo renders your Mermaid diagram to PNG."

## Plugin System

Making it trivial to add generators:

```typescript
import createClient from 'imgflo';
import quickchart from 'imgflo-quickchart';
import mermaid from 'imgflo-mermaid';

const imgflo = createClient();

// Register plugins
imgflo.registerGenerator(quickchart());
imgflo.registerGenerator(mermaid());

// Use immediately
await imgflo.generate({ generator: 'quickchart', params: {...} });
await imgflo.generate({ generator: 'mermaid', params: {...} });
```

## Creating a Generator

**Minimal generator template:**

```typescript
// imgflo-mygenerator/index.ts
import type { ImageGenerator, ImageBlob } from 'imgflo';

export default function myGenerator(config = {}) {
  return {
    name: 'mygenerator',

    async generate(params: Record<string, unknown>): Promise<ImageBlob> {
      // 1. Take params (native library format)
      // 2. Generate/fetch image
      // 3. Return ImageBlob

      const bytes = Buffer.from(/* ... */);
      return {
        bytes,
        mime: 'image/png',
        width: 800,
        height: 600
      };
    }
  } satisfies ImageGenerator;
}
```

**That's it.** ~20 lines of code per generator.

## What We DON'T Do

**Don't abstract away the underlying library**
```typescript
// BAD: imgflo-specific abstraction
params: {
  chartType: 'line',  // imgflo's abstraction
  xAxis: [...],       // imgflo's abstraction
  yAxis: [...]        // imgflo's abstraction
}
```

**Do pass through native format**
```typescript
// GOOD: native library format
params: {
  type: 'line',       // Chart.js format
  data: {             // Chart.js format
    labels: [...],
    datasets: [...]
  }
}
```

## Benefits of This Approach

### For Users
- Full power of underlying libraries
- One source of truth for docs (the actual library)
- Choose generators based on library familiarity
- Not locked into imgflo's abstraction
- Small bundle size (only install what they use)

### For imgflo
- Minimal maintenance burden
- Don't need to document library features
- Don't need to keep up with library updates
- Easy for community to contribute
- Core stays lean and focused

### For Generators
- ~20 lines of code each
- Just fetch/render and return bytes
- No complex abstraction logic
- Easy to test
- Easy to maintain

## Use Cases

### Data Visualization
- **QuickChart**: Simple charts, no dependencies
- **Vega-Lite**: Complex visualizations, declarative
- **Chart.js**: Offline rendering with canvas
- **Plotly**: Scientific/statistical charts

### Diagrams
- **Mermaid**: Flowcharts, sequence diagrams, etc.
- **PlantUML**: UML diagrams
- **Graphviz**: Graph layouts

### AI Generation
- **OpenAI**: General images, photos, illustrations
- **Stability AI**: Alternative AI provider
- **Midjourney**: Via API

### Other
- **QR codes**: via qrcode library
- **Barcodes**: via bwip-js library
- **Patterns**: generative art libraries

## Official Generator Packages

Guidelines for official packages:

1. Publish as `imgflo-{name}` (e.g., `imgflo-quickchart`)
2. Follow pass-through pattern
3. Link to upstream docs
4. Keep implementations minimal (~20-50 lines)
5. Version independently
6. Let community contribute

## What Stays in Core

- `ImageGenerator` interface
- `ImageBlob` type
- `registerGenerator()` method
- `shapes` generator (zero deps)
- `openai` generator (acceptable dep)
- Transform pipeline (Sharp/Resvg)
- Storage providers (S3, filesystem)
- MCP server

**Core remains focused:** Generate -> Transform -> Upload -> Return URL

That's imgflo's job. We're the glue that makes this pipeline trivial.

---

## Related Documents

- [[Plugin-Architecture]] - How plugins extend imgflo
- [[Core-vs-Plugins]] - Decision framework for what belongs where
- [[Design-Principles]] - Overall philosophy
