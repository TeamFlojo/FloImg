# imgflo

> Image generation and transformation library designed for AI agents and developers

[![npm version](https://img.shields.io/npm/v/imgflo.svg?style=flat)](https://www.npmjs.com/package/imgflo)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## What is imgflo?

`imgflo` is a convenience library that wraps common image generation and manipulation workflows into a simple, unified API. Perfect for AI agents and developers who need to generate images, convert formats, and upload to storage without writing boilerplate.

### Why imgflo?

- **One simple API** for the complete workflow (generate → transform → upload)
- **Plugin architecture** - only install generators you need
- **Pass-through pattern** - use native library formats (Chart.js, etc.)
- **MCP Server** - direct integration with Claude Code
- **TypeScript** - full type safety

## Packages

| Package | Description | Size |
|---------|-------------|------|
| [imgflo](./packages/imgflo) | Core library with shapes & OpenAI generators | ~5MB |
| [imgflo-quickchart](./packages/imgflo-quickchart) | Chart.js charts via QuickChart.io | ~0KB |
| [imgflo-screenshot](./packages/imgflo-screenshot) | Playwright browser screenshots | ~200MB |

## Quick Start

### Installation

```bash
# Core library
npm install imgflo

# With plugins
npm install imgflo imgflo-quickchart imgflo-screenshot
```

### Basic Usage

```typescript
import createClient from 'imgflo';

const imgflo = createClient({
  store: {
    default: 's3',
    s3: { region: 'us-east-1', bucket: 'my-images' }
  }
});

// Generate → Transform → Upload
const svg = await imgflo.generate({
  generator: 'shapes',
  params: { type: 'gradient', width: 1200, height: 630 }
});

const png = await imgflo.transform({
  blob: svg,
  op: 'convert',
  to: 'image/png'
});

const result = await imgflo.upload({
  blob: png,
  key: 'images/gradient.png'
});

console.log(result.url); // Use anywhere!
```

### With Plugins

```typescript
import createClient from 'imgflo';
import quickchart from 'imgflo-quickchart';
import screenshot from 'imgflo-screenshot';

const imgflo = createClient();

// Register plugins
imgflo.registerGenerator(quickchart());
imgflo.registerGenerator(screenshot());

// Generate a chart
const chart = await imgflo.generate({
  generator: 'quickchart',
  params: {
    type: 'bar',
    data: {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [{ label: 'Revenue', data: [12, 19, 3, 5] }]
    }
  }
});

// Take a screenshot
const site = await imgflo.generate({
  generator: 'screenshot',
  params: {
    url: 'https://example.com',
    width: 1920,
    height: 1080
  }
});
```

## Built-In Generators

### Shapes

Simple SVG shapes - gradients, circles, rectangles, patterns:

```typescript
await imgflo.generate({
  generator: 'shapes',
  params: { type: 'gradient', width: 1200, height: 630 }
});
```

### OpenAI DALL-E

AI-powered image generation:

```typescript
await imgflo.generate({
  generator: 'openai',
  params: {
    prompt: 'A futuristic city at sunset',
    model: 'dall-e-3',
    size: '1024x1024'
  }
});
```

## Plugin Generators

### QuickChart (Charts)

Generate charts using Chart.js configuration:

```typescript
await imgflo.generate({
  generator: 'quickchart',
  params: {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar'],
      datasets: [{ label: 'Sales', data: [10, 15, 13] }]
    }
  }
});
```

**[Full documentation →](./packages/imgflo-quickchart)**

### Screenshot (Websites & HTML)

Headless browser screenshots:

```typescript
await imgflo.generate({
  generator: 'screenshot',
  params: {
    url: 'https://example.com',
    width: 1920,
    height: 1080,
    fullPage: true
  }
});
```

**[Full documentation →](./packages/imgflo-screenshot)**

## Features

### Current Features

- ✅ **SVG Generation**: Built-in shapes (gradients, circles, rectangles, patterns)
- ✅ **AI Image Generation**: OpenAI DALL-E 2 & 3 support
- ✅ **Charts**: QuickChart.io integration (Chart.js)
- ✅ **Screenshots**: Playwright browser automation
- ✅ **Image Transformation**: Convert SVG → PNG/JPEG/WebP/AVIF using Sharp + Resvg
- ✅ **Cloud Storage**: Upload to S3, R2, Tigris, etc.
- ✅ **Local Storage**: Save to filesystem
- ✅ **CLI Tool**: Easy command-line interface
- ✅ **MCP Server**: Direct integration with Claude Code
- ✅ **Plugin System**: Extensible architecture
- ✅ **TypeScript**: Full type safety

### Coming Soon

- 🔄 **Mermaid Diagrams**: `imgflo-mermaid`
- 🔄 **Satori HTML**: `imgflo-satori` (React/JSX to image)
- 🔄 **Vega Visualizations**: `imgflo-vega`

## Philosophy

imgflo is **glue, not the engine**. We orchestrate existing libraries rather than reimplementing them.

### Core Principles

1. **Pass-Through Pattern** - Generators accept native library formats
2. **Minimal Abstraction** - Thin wrappers around existing tools
3. **Opt-In Complexity** - Users only install what they need
4. **Full Capabilities** - No neutering of underlying libraries

**[Read the full strategy →](./docs/development/GENERATOR_STRATEGY.md)**

## Documentation

- **[Quick Start Guide](./packages/imgflo/docs/guides/QUICK_START.md)** - Fast reference
- **[OpenAI DALL-E Guide](./packages/imgflo/docs/guides/OPENAI_GENERATOR.md)** - AI images
- **[MCP Server Guide](./packages/imgflo/docs/guides/MCP_SERVER.md)** - Claude Code integration
- **[S3 Providers Guide](./packages/imgflo/docs/guides/S3_PROVIDERS.md)** - Cloud storage
- **[Generator Strategy](./docs/development/GENERATOR_STRATEGY.md)** - Architecture

## CLI

```bash
# Generate an image
imgflo generate --generator shapes --params '{"type":"gradient"}' --out bg.svg

# Transform it
imgflo transform --in bg.svg --op convert --to image/png --out bg.png

# Upload it
imgflo upload --in bg.png --key images/bg.png

# Check configuration
imgflo doctor
```

## MCP Server

Use imgflo directly from Claude Code:

```bash
npm install -g imgflo
imgflo-mcp
```

Configure in Claude Code settings to enable natural language image generation.

## Monorepo Structure

```
imgflo/
├── packages/
│   ├── imgflo/              # Core library
│   ├── imgflo-quickchart/   # Chart.js charts
│   └── imgflo-screenshot/   # Browser screenshots
├── docs/                     # Shared documentation
└── pnpm-workspace.yaml      # Workspace config
```

## Contributing

We welcome contributions! Areas we'd love help with:

- More generators (Mermaid, Satori, Vega, PlantUML)
- Additional storage backends
- Tests and documentation
- Performance improvements

## Development

```bash
# Install pnpm
npm install -g pnpm

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Dev mode (watch)
pnpm dev

# Run tests
pnpm test
```

## License

MIT

## Credits

Built with:
- [Sharp](https://sharp.pixelplumbing.com/) - Image processing
- [Resvg](https://github.com/RazrFalcon/resvg) - SVG rendering
- [OpenAI](https://openai.com/) - DALL-E AI generation
- [QuickChart](https://quickchart.io) - Chart rendering
- [Playwright](https://playwright.dev) - Browser automation
- [AWS SDK](https://aws.amazon.com/sdk-for-javascript/) - S3 uploads
- [MCP](https://modelcontextprotocol.io) - AI assistant integration

---

**Made for AI agents and developers who need simple, powerful image workflows.**
