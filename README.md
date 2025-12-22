# floimg

> Universal image workflow engine for developers and AI agents

[![npm version](https://img.shields.io/npm/v/@teamflojo/floimg.svg?style=flat)](https://www.npmjs.com/package/@teamflojo/floimg)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**floimg** provides three core operations—generate, transform, save—that work consistently across JavaScript, CLI, YAML, and MCP.

## The Problem

**LLMs are non-deterministic.** Great for creativity, terrible for "resize to exactly 800x600."

**Image libraries are fragmented.** Charts need Chart.js. Diagrams need Mermaid. QR codes need node-qrcode. Each has different APIs with no way to chain them.

**floimg solves both.** Deterministic execution with a unified abstraction. LLMs handle natural language; floimg handles precise execution.

> **[Why floimg Exists →](./vault/Why-floimg-Exists.md)**

## Try It Now (No Install Required)

Generate images instantly with `npx`:

```bash
# Generate a QR code
npx @teamflojo/floimg qr "https://floimg.com" -o qr.png

# Create a bar chart
npx @teamflojo/floimg chart bar --labels "Q1,Q2,Q3,Q4" --values "10,20,30,40" -o chart.png

# Resize an image
npx @teamflojo/floimg resize photo.jpg 800x600 -o thumbnail.jpg

# Convert format
npx @teamflojo/floimg convert image.png -o image.webp

# Interactive mode - see all options
npx @teamflojo/floimg
```

**Plugin auto-install:** Commands like `qr` and `chart` require plugins. On first run, floimg will prompt to install them automatically:

```
🔍 The 'qr' command requires @teamflojo/floimg-qr
   QR Code Generator

Install it now? (y/n): y
📦 Installing @teamflojo/floimg-qr...
✅ Installed!
```

## Install

```bash
npm install @teamflojo/floimg

# Add plugins you need
npm install @teamflojo/floimg-quickchart @teamflojo/floimg-mermaid @teamflojo/floimg-qr @teamflojo/floimg-screenshot
```

## Quick Start

```typescript
import createClient from "@teamflojo/floimg";
import qr from "@teamflojo/floimg-qr";

const floimg = createClient();
floimg.registerGenerator(qr());

// Generate → Transform → Save
const qrCode = await floimg.generate({
  generator: "qr",
  params: { text: "https://example.com" },
});

await floimg.save(qrCode, "./qr.png");
// Or: await floimg.save(qrCode, 's3://bucket/qr.png');
```

## Three Interfaces

### 📚 Library

```typescript
const chart = await floimg.generate({ generator: 'quickchart', params: {...} });
const resized = await floimg.transform({ blob: chart, op: 'resize', params: { width: 800 } });
await floimg.save(resized, 's3://bucket/chart.png');
```

### 💻 CLI

**Shorthand commands** (recommended for common tasks):

```bash
floimg qr "https://example.com" -o qr.png
floimg chart bar --labels "A,B,C" --values "10,20,30" -o chart.png
floimg resize image.png 800x600 -o resized.png
floimg convert image.png -o image.webp
```

**Full API** (for advanced use cases):

```bash
floimg generate --generator qr --params '{"text":"https://example.com"}' --out qr.png
floimg transform --in image.png --op resize --params '{"width":800}' --out resized.png
floimg save --in resized.png --out s3://bucket/image.png
```

### 🤖 MCP (AI Agents)

```bash
floimg mcp install  # Generates Claude Code config
```

Then just talk to Claude: _"Create a QR code for example.com"_

## Packages

### Core

| Package                                                                | Description                  | npm                                                                                                           |
| ---------------------------------------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------- |
| [`@teamflojo/floimg`](https://www.npmjs.com/package/@teamflojo/floimg) | Core engine, CLI, MCP server | [![npm](https://img.shields.io/npm/v/@teamflojo/floimg.svg)](https://www.npmjs.com/package/@teamflojo/floimg) |

### Plugins

| Package                                                                                      | Description                        | npm                                                                                                                                 |
| -------------------------------------------------------------------------------------------- | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| [`@teamflojo/floimg-quickchart`](https://www.npmjs.com/package/@teamflojo/floimg-quickchart) | Chart.js charts via QuickChart     | [![npm](https://img.shields.io/npm/v/@teamflojo/floimg-quickchart.svg)](https://www.npmjs.com/package/@teamflojo/floimg-quickchart) |
| [`@teamflojo/floimg-d3`](https://www.npmjs.com/package/@teamflojo/floimg-d3)                 | D3 data visualizations             | [![npm](https://img.shields.io/npm/v/@teamflojo/floimg-d3.svg)](https://www.npmjs.com/package/@teamflojo/floimg-d3)                 |
| [`@teamflojo/floimg-mermaid`](https://www.npmjs.com/package/@teamflojo/floimg-mermaid)       | Mermaid diagrams                   | [![npm](https://img.shields.io/npm/v/@teamflojo/floimg-mermaid.svg)](https://www.npmjs.com/package/@teamflojo/floimg-mermaid)       |
| [`@teamflojo/floimg-qr`](https://www.npmjs.com/package/@teamflojo/floimg-qr)                 | QR code generation                 | [![npm](https://img.shields.io/npm/v/@teamflojo/floimg-qr.svg)](https://www.npmjs.com/package/@teamflojo/floimg-qr)                 |
| [`@teamflojo/floimg-screenshot`](https://www.npmjs.com/package/@teamflojo/floimg-screenshot) | Website screenshots via Playwright | [![npm](https://img.shields.io/npm/v/@teamflojo/floimg-screenshot.svg)](https://www.npmjs.com/package/@teamflojo/floimg-screenshot) |

## Documentation

- **[Why floimg Exists](./vault/Why-floimg-Exists.md)** - The problem and solution
- **[Design Principles](./vault/Design-Principles.md)** - Philosophy
- **[Configuration](./vault/architecture/Configuration.md)** - Setup options
- **[Generator Strategy](./vault/architecture/Generator-Strategy.md)** - How generators work
- **[MCP Architecture](./vault/architecture/MCP-Server-Architecture.md)** - Claude integration
- **[Monorepo Guide](./vault/architecture/Monorepo-Guide.md)** - Development

## Development

```bash
pnpm install && pnpm -r build && pnpm -r test
```

## Contributing

We welcome contributions—more generators, storage backends, tests, docs.

**[Development Guide →](./vault/architecture/Monorepo-Guide.md)**

## License

MIT - Maintained by [Flojo, Inc](https://flojo.io)
