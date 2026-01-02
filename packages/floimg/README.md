# @teamflojo/floimg

> Composable image workflow engine — any source, any transforms, any destination

[![npm version](https://img.shields.io/npm/v/@teamflojo/floimg.svg?style=flat)](https://www.npmjs.com/package/@teamflojo/floimg)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**FloImg** unifies image generation, transformation, and delivery into composable pipelines. Whether you're generating AI images, resizing for social media, or building complex multi-step workflows, FloImg handles it through one consistent interface.

## Why FloImg?

1. **The Probabilistic Editing Problem** — AI image "editing" is probabilistic. "Change the colors" might give you a different composition. FloImg applies deterministic transforms: adjust hue mathematically, guaranteed to preserve everything else.

2. **The Tool Fragmentation Problem** — Stop wrangling remove.bg, Photoshop, format converters, and cloud services. FloImg consolidates into one pipeline.

3. **Multiple Modalities** — SDK, CLI, YAML config, MCP for AI agents, visual builder. Use whichever fits how you think.

## Installation

```bash
npm install @teamflojo/floimg

# Add generators you need
npm install @teamflojo/floimg-openai      # DALL-E + GPT-4 Vision
npm install @teamflojo/floimg-stability   # Stability AI (SDXL, SD3)
npm install @teamflojo/floimg-quickchart  # Chart.js charts
npm install @teamflojo/floimg-qr          # QR codes
```

## Library API

### Fluent API (Recommended)

Chain operations with a clean, fluent syntax:

```typescript
import { floimg } from "@teamflojo/floimg";

// Load → Transform → Save
await floimg
  .from("./input.png")
  .transform("resize", { width: 800 })
  .transform("blur", { sigma: 2 })
  .to("./output.png");

// Generate → Transform → Save to cloud
await floimg
  .generate("openai", { prompt: "A sunset over mountains" })
  .transform("resize", { width: 1920 })
  .to("s3://bucket/sunset.png");

// Get the final image as a blob
const blob = await floimg
  .from("./photo.jpg")
  .transform("resize", { width: 400 })
  .transform("convert", { to: "webp" })
  .toBlob();
```

### Client API (Fine-grained Control)

For custom configurations and AI providers:

```typescript
import createClient from "@teamflojo/floimg";
import openai from "@teamflojo/floimg-openai";

const floimg = createClient();
floimg.registerGenerator(openai({ apiKey: process.env.OPENAI_API_KEY }));

// Generate → Transform → Save
const image = await floimg.generate({
  generator: "openai",
  params: {
    prompt: "A serene mountain landscape at sunset",
    model: "dall-e-3",
    size: "1024x1024",
  },
});

const resized = await floimg.transform({
  blob: image,
  op: "resize",
  params: { width: 800 },
});

await floimg.save(resized, "./landscape.png");
// Or: await floimg.save(resized, 's3://bucket/landscape.png');
```

## CLI

```bash
# Resize and convert
npx @teamflojo/floimg resize hero.png 1200x630 -o og-image.png
npx @teamflojo/floimg convert image.png -o image.webp

# Generate charts and QR codes
npx @teamflojo/floimg chart bar --labels "Q1,Q2,Q3,Q4" --values "10,20,30,40" -o chart.png
npx @teamflojo/floimg qr "https://floimg.com" -o qr.png

# Interactive mode
npx @teamflojo/floimg
```

Plugins auto-install on first use. See [QUICK_START.md](./QUICK_START.md) for full CLI documentation.

## Plugin Ecosystem

| Package                                                                                    | Description                              |
| ------------------------------------------------------------------------------------------ | ---------------------------------------- |
| [@teamflojo/floimg-openai](https://www.npmjs.com/package/@teamflojo/floimg-openai)         | DALL-E + GPT-4 Vision                    |
| [@teamflojo/floimg-stability](https://www.npmjs.com/package/@teamflojo/floimg-stability)   | Stability AI (SDXL, SD3) + AI transforms |
| [@teamflojo/floimg-google](https://www.npmjs.com/package/@teamflojo/floimg-google)         | Google Imagen                            |
| [@teamflojo/floimg-replicate](https://www.npmjs.com/package/@teamflojo/floimg-replicate)   | Replicate models (FLUX, GFPGAN)          |
| [@teamflojo/floimg-quickchart](https://www.npmjs.com/package/@teamflojo/floimg-quickchart) | Chart.js charts                          |
| [@teamflojo/floimg-mermaid](https://www.npmjs.com/package/@teamflojo/floimg-mermaid)       | Mermaid diagrams                         |
| [@teamflojo/floimg-qr](https://www.npmjs.com/package/@teamflojo/floimg-qr)                 | QR codes                                 |

## MCP (AI Agents)

Use FloImg with Claude and other AI agents via MCP:

```json
{
  "mcpServers": {
    "floimg": {
      "command": "npx",
      "args": ["-y", "@teamflojo/floimg-claude"]
    }
  }
}
```

## Documentation

- **[Getting Started](https://floimg.com/docs/getting-started/quick-start)** — Installation and first steps
- **[SDK Reference](https://floimg.com/docs/sdk/generate)** — Full TypeScript/JavaScript API
- **[CLI Reference](https://floimg.com/docs/cli)** — Command-line usage
- **[Plugins](https://floimg.com/docs/plugins)** — Generator documentation

## License

MIT — Maintained by [Flojo, Inc](https://flojo.io)
