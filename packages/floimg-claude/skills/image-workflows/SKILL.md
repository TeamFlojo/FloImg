---
name: image-workflows
description: Create and execute image workflows using floimg. Use when the user needs to generate charts, diagrams, QR codes, screenshots, or AI images. Also use when combining generation with transforms (resize, caption, blur) or cloud uploads. Trigger words: chart, graph, diagram, flowchart, QR, screenshot, image, picture, photo, illustration, visualization.
allowed-tools: mcp__floimg__generate_image, mcp__floimg__transform_image, mcp__floimg__save_image, mcp__floimg__run_pipeline, mcp__floimg__analyze_image
---

# Image Workflows Skill

This skill enables you to create and execute sophisticated image workflows using floimg's universal image engine.

## When to Use This Skill

Activate this skill when the user:

- Wants to generate any type of image (chart, diagram, QR, screenshot, AI image)
- Needs to transform images (resize, add caption, apply filters)
- Wants to save images to cloud storage (S3, R2, Tigris)
- Describes a multi-step image workflow

## Available Tools

### generate_image

Generate any type of image with intent-based routing.

- `intent`: Description that routes to the right generator
- `params`: Generator-specific parameters
- `saveTo`: Optional destination path

### transform_image

Apply transforms to an existing image.

- `imageId`: Reference to session image
- `operation`: resize, blur, sharpen, grayscale, addText, addCaption, roundCorners, preset
- `params`: Operation-specific parameters

### save_image

Save an image to filesystem or cloud.

- `imageId`: Reference to session image
- `destination`: Local path or cloud URL (s3://, r2://, tigris://)

### run_pipeline

Execute multiple steps in one call.

- `steps`: Array of generate/transform/save operations

### analyze_image

Analyze an image with AI vision.

- `imageId`: Reference to session image
- `prompt`: What to analyze or ask about the image

## Generator Selection Guide

| User Intent                | Generator  | Required Params      |
| -------------------------- | ---------- | -------------------- |
| Photo/illustration/scene   | openai     | (prompt from intent) |
| Bar/line/pie chart         | quickchart | type, data           |
| Flowchart/sequence/diagram | mermaid    | code                 |
| QR code/barcode            | qr         | text                 |
| Webpage screenshot         | screenshot | url                  |
| Custom D3 visualization    | d3         | render, data         |

## Workflow Patterns

### Pattern 1: Simple Generation

```
User: "Create a bar chart showing January: 100, February: 150, March: 200"

Call generate_image with:
- intent: "bar chart"
- params: { type: "bar", data: { labels: [...], datasets: [...] } }
```

### Pattern 2: Generate and Transform

```
User: "Create a QR code for my website and make it 500px wide"

1. generate_image({ intent: "QR code for https://..." })
2. transform_image({ imageId, operation: "resize", params: { width: 500 } })
```

### Pattern 3: Full Pipeline

```
User: "Create a hero image, resize for social, add caption, upload to S3"

run_pipeline({
  steps: [
    { generate: { intent: "hero image...", params: {...} } },
    { transform: { operation: "resize", params: { width: 1200, height: 630 } } },
    { transform: { operation: "addCaption", params: { text: "...", position: "bottom" } } },
    { save: { destination: "s3://bucket/hero.png" } }
  ]
})
```

## Best Practices

1. **Be explicit with chart/diagram params**: Intent routes to the generator; params contain the data
2. **Use imageId for chaining**: Don't pass bytes between tools
3. **Resize last**: Apply transforms that might degrade quality before final resize
4. **Choose right format**: SVG for diagrams, PNG for photos, WebP for web
5. **Use pipelines for multi-step**: More efficient than separate calls

For detailed API reference, see [reference.md](reference.md).
For common workflow examples, see [examples.md](examples.md).
