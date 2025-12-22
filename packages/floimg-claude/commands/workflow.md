---
description: Execute a multi-step image workflow (generate, transform, save pipeline)
allowed-tools: mcp__floimg__generate_image, mcp__floimg__transform_image, mcp__floimg__save_image, mcp__floimg__run_pipeline
---

# Image Workflow

Execute a multi-step image workflow: "$ARGUMENTS"

## Instructions

1. **Parse the workflow** into discrete steps:
   - **Generate**: What image to create (AI, chart, diagram, QR, screenshot)
   - **Transform**: What modifications (resize, blur, caption, etc.)
   - **Save**: Where to store (local path or cloud)

2. **Use `run_pipeline`** for efficient multi-step execution:

   ```json
   {
     "steps": [
       { "generate": { "intent": "...", "params": {...} } },
       { "transform": { "operation": "resize", "params": { "width": 800 } } },
       { "transform": { "operation": "addCaption", "params": { "text": "...", "position": "bottom" } } },
       { "save": { "destination": "s3://bucket/output.png" } }
     ]
   }
   ```

3. **Report results**:
   - Each step's output
   - Final imageId
   - Final save location

## Transform Operations

| Operation      | Description   | Key Params                                |
| -------------- | ------------- | ----------------------------------------- |
| `resize`       | Scale image   | `width`, `height`, `fit`                  |
| `convert`      | Change format | `to` (png, jpeg, webp)                    |
| `blur`         | Gaussian blur | `sigma` (0.3-1000)                        |
| `sharpen`      | Sharpen edges | `sigma`                                   |
| `grayscale`    | Remove color  | -                                         |
| `modulate`     | Adjust colors | `brightness`, `saturation`, `hue`         |
| `roundCorners` | Border radius | `radius`                                  |
| `addText`      | Overlay text  | `text`, `x`, `y`, `size`, `color`         |
| `addCaption`   | Caption bar   | `text`, `position`, `background`          |
| `preset`       | Apply filter  | `name` (vintage, vibrant, dramatic, soft) |

## Common Workflow Patterns

### Social Media Ready

```json
{
  "steps": [
    { "generate": { "intent": "hero image for tech blog..." } },
    { "transform": { "operation": "resize", "params": { "width": 1200, "height": 630 } } },
    {
      "transform": {
        "operation": "addCaption",
        "params": { "text": "My Blog Title", "position": "bottom" }
      }
    },
    { "save": { "destination": "s3://assets/og-image.png" } }
  ]
}
```

### Thumbnail Generation

```json
{
  "steps": [
    { "generate": { "intent": "product photo..." } },
    {
      "transform": {
        "operation": "resize",
        "params": { "width": 200, "height": 200, "fit": "cover" }
      }
    },
    { "transform": { "operation": "roundCorners", "params": { "radius": 10 } } },
    { "save": { "destination": "./thumbnails/product.png" } }
  ]
}
```

### Branded Watermark

```json
{
  "steps": [
    { "generate": { "intent": "chart showing..." } },
    {
      "transform": {
        "operation": "addText",
        "params": { "text": "floimg.com", "x": 10, "y": 10, "size": 14, "color": "#666" }
      }
    },
    { "save": { "destination": "./charts/branded.png" } }
  ]
}
```

## Save Destinations

| Format | Example                               |
| ------ | ------------------------------------- |
| Local  | `./output/image.png`                  |
| S3     | `s3://bucket-name/path/image.png`     |
| R2     | `r2://bucket-name/path/image.png`     |
| Tigris | `tigris://bucket-name/path/image.png` |

## Tips

- **Order matters**: Resize before adding text/caption for best quality
- **Use imageId**: Chain operations without re-uploading
- **Batch similar**: Generate multiple images, then transform together
- **Cloud last**: Save to cloud as final step after all transforms
