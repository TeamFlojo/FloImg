# @teamflojo/floimg-claude

Claude Code plugin for [floimg](https://github.com/TeamFlojo/floimg) - Universal image generation and workflows.

Generate charts, diagrams, QR codes, screenshots, and AI images directly from Claude Code.

## Features

### Slash Commands

| Command                     | Description                                             |
| --------------------------- | ------------------------------------------------------- |
| `/floimg-claude:image`      | Generate any image (AI, chart, diagram, QR, screenshot) |
| `/floimg-claude:chart`      | Create data visualizations with QuickChart              |
| `/floimg-claude:diagram`    | Generate Mermaid diagrams (flowcharts, sequences, etc.) |
| `/floimg-claude:qr`         | Create QR codes                                         |
| `/floimg-claude:screenshot` | Capture webpages with Playwright                        |
| `/floimg-claude:workflow`   | Execute multi-step image pipelines                      |

### Image Architect Agent

A specialized agent for complex image tasks. Expert in:

- Choosing the right generator for each task
- Planning multi-step image workflows
- Optimizing image pipelines

### Auto-Discovery Skill

Claude automatically detects image-related tasks and uses floimg when you mention:

- Charts, graphs, visualizations
- Diagrams, flowcharts, sequences
- QR codes
- Screenshots, captures
- Images, photos, illustrations

## Installation

### Prerequisites

Install floimg and the plugins you need:

```bash
npm install -g @teamflojo/floimg

# Optional plugins (install as needed)
npm install -g @teamflojo/floimg-quickchart   # Charts
npm install -g @teamflojo/floimg-mermaid      # Diagrams
npm install -g @teamflojo/floimg-qr           # QR codes
npm install -g @teamflojo/floimg-screenshot   # Screenshots
```

### Install the Plugin

```bash
# From npm
npm install -g @teamflojo/floimg-claude

# Then in Claude Code, add the plugin
claude --plugin-dir $(npm root -g)/@teamflojo/floimg-claude
```

Or add to your project's Claude settings:

```json
{
  "plugins": ["@teamflojo/floimg-claude"]
}
```

## Configuration

Set environment variables for the features you need:

```bash
# For AI image generation (DALL-E)
export OPENAI_API_KEY=sk-...

# For cloud storage (optional)
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
export AWS_REGION=us-east-1
export S3_BUCKET=my-bucket
```

## Usage Examples

### Quick Chart

```
/floimg-claude:chart bar chart showing Q1: $100K, Q2: $150K, Q3: $175K, Q4: $200K
```

### Architecture Diagram

```
/floimg-claude:diagram microservices architecture: frontend -> API gateway -> auth, users, orders services
```

### QR Code

```
/floimg-claude:qr https://floimg.com
```

### Screenshot

```
/floimg-claude:screenshot https://github.com full page
```

### Multi-Step Workflow

```
/floimg-claude:workflow Create a hero image for my blog, resize to 1200x630, add "Welcome" caption, save to S3
```

### Using the Agent

Just describe complex image tasks and the image-architect agent will help:

```
I need to create a data visualization dashboard with:
- A bar chart of monthly sales
- A pie chart of product categories
- All charts should be 800x600 and saved to ./charts/
```

## What's Included

```
floimg-claude/
├── .claude-plugin/plugin.json    # Plugin manifest
├── .mcp.json                     # MCP server configuration
├── commands/                     # Slash commands
│   ├── image.md
│   ├── chart.md
│   ├── diagram.md
│   ├── qr.md
│   ├── screenshot.md
│   └── workflow.md
├── agents/
│   └── image-architect.md        # Specialized agent
└── skills/
    └── image-workflows/          # Auto-discovered skill
        ├── SKILL.md
        ├── reference.md
        └── examples.md
```

## Supported Generators

| Generator     | Triggered By                 | Requires                       |
| ------------- | ---------------------------- | ------------------------------ |
| OpenAI/DALL-E | photo, illustration, scene   | `OPENAI_API_KEY`               |
| QuickChart    | chart, graph, bar, pie       | `@teamflojo/floimg-quickchart` |
| Mermaid       | flowchart, diagram, sequence | `@teamflojo/floimg-mermaid`    |
| QR            | qr code, barcode             | `@teamflojo/floimg-qr`         |
| Screenshot    | screenshot, capture          | `@teamflojo/floimg-screenshot` |

## Transform Operations

After generating an image, you can transform it:

- `resize` - Scale to specific dimensions
- `blur` - Apply Gaussian blur
- `sharpen` - Sharpen edges
- `grayscale` - Remove color
- `roundCorners` - Add border radius
- `addText` - Overlay text
- `addCaption` - Add caption bar
- `preset` - Apply filters (vintage, vibrant, dramatic, soft)

## Save Destinations

- Local: `./output/image.png`
- S3: `s3://bucket/path/image.png`
- R2: `r2://bucket/path/image.png`
- Tigris: `tigris://bucket/path/image.png`

## Requirements

- Node.js >= 18.0.0
- Claude Code >= 1.0.0
- @teamflojo/floimg >= 0.2.0

## Links

- [floimg Documentation](https://github.com/TeamFlojo/floimg)
- [Report Issues](https://github.com/TeamFlojo/floimg/issues)

## License

MIT
