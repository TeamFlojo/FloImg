---
description: Generate an image using floimg (AI images, charts, diagrams, QR codes, screenshots)
allowed-tools: mcp__floimg__generate_image, mcp__floimg__transform_image, mcp__floimg__save_image
---

# Image Generation

Generate an image based on: "$ARGUMENTS"

## Instructions

1. **Analyze the request** to determine the best generator:
   - AI/photo/illustration/scene descriptions -> OpenAI/DALL-E
   - Chart/graph/visualization -> QuickChart
   - Flowchart/sequence/diagram -> Mermaid
   - QR code/barcode -> QR generator
   - Website capture -> Screenshot

2. **Call the floimg MCP `generate_image` tool** with:
   - `intent`: A clear description for routing
   - `params`: Generator-specific parameters (if needed)
   - `saveTo`: Optional path like `./output.png`

3. **Report the result**:
   - Show the file path where the image was saved
   - Offer follow-up options (transform, save to cloud, generate variations)

## Generator Routing

| Intent Keywords                     | Generator  | Example                    |
| ----------------------------------- | ---------- | -------------------------- |
| photo, picture, illustration, scene | OpenAI     | "a sunset over mountains"  |
| chart, graph, bar, line, pie        | QuickChart | "bar chart of sales data"  |
| flowchart, diagram, sequence        | Mermaid    | "user auth flow diagram"   |
| QR, qr code                         | QR         | "QR code for https://..."  |
| screenshot, capture, webpage        | Screenshot | "screenshot of github.com" |

## Examples

**AI Image**: "a golden retriever in a field at sunset"
-> `generate_image({ intent: "a golden retriever in a field at sunset" })`

**Chart**: "bar chart showing Q1: 100, Q2: 150, Q3: 200"
-> Use `/floimg-claude:chart` for better chart params

**Diagram**: "sequence diagram of API auth"
-> Use `/floimg-claude:diagram` for Mermaid syntax help
