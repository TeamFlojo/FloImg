# Why imgflo Exists

imgflo exists to solve two fundamental problems that developers face when working with images in modern applications.

## The Two Problems

### Problem 1: LLM Non-Determinism

Large language models are brilliant at understanding intent and generating creative content. But they struggle with precise, repeatable operations—exactly the kind of operations you need for reliable image workflows.

**Where LLMs excel:**
- "Create an image of a sunset over mountains" → DALL-E generates beautiful results
- Understanding what a user wants from natural language
- Choosing the right tool for a task
- Handling ambiguous or creative requests

**Where LLMs fail:**

| Task | What You Want | What You Get |
|------|--------------|--------------|
| "Resize to 800x600" | Exact 800x600 output | Might interpret as "make smaller" |
| "Add caption at bottom" | Consistent position, font | Position varies, styling inconsistent |
| "Convert to PNG" | PNG format output | May not understand format distinctions |
| "Apply blur with radius 5" | Specific blur intensity | Inconsistent parameter interpretation |
| "Output as WebP at 80% quality" | Exact quality setting | May approximate or ignore |

The core issue: LLMs are **non-deterministic**. The same prompt can produce different results. For creative tasks, this is a feature. For precise image operations, it's a bug.

**The insight:** You want an LLM to understand intent, but you need a **deterministic engine** to execute precise operations.

### Problem 2: Library Fragmentation

Images come in many forms: photos, charts, diagrams, QR codes, screenshots, AI-generated art. To work with all of these in a JavaScript project, you need different libraries:

| Image Type | Common Libraries |
|------------|-----------------|
| Charts | Chart.js, D3, Recharts, Plotly, Victory |
| Diagrams | Mermaid, PlantUML, Graphviz, Draw.io |
| QR Codes | qrcode, node-qrcode, qrcode-generator |
| Screenshots | Puppeteer, Playwright |
| AI Images | OpenAI SDK, Replicate, Stability AI |
| Processing | Sharp, Jimp, Canvas, ImageMagick |
| Storage | AWS SDK, various cloud SDKs |

Each library has:
- **Different APIs** — no consistency in how you call them
- **Different output formats** — some return buffers, some streams, some URLs
- **Different error handling** — each has its own error types
- **No composability** — you can't easily chain Chart.js → Sharp → S3

**Example: A "simple" workflow without imgflo:**

```typescript
// Generate a chart with Chart.js
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
const chartCanvas = new ChartJSNodeCanvas({ width: 800, height: 600 });
const chartBuffer = await chartCanvas.renderToBuffer({ type: 'bar', data: {...} });

// Resize with Sharp (different API)
import sharp from 'sharp';
const resizedBuffer = await sharp(chartBuffer)
  .resize(400, 300)
  .toBuffer();

// Upload to S3 (yet another API)
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
const s3 = new S3Client({ region: 'us-east-1' });
await s3.send(new PutObjectCommand({
  Bucket: 'my-bucket',
  Key: 'chart.png',
  Body: resizedBuffer,
  ContentType: 'image/png'
}));
```

Three different libraries, three different APIs, manual buffer passing, no error handling shown. And this is for a simple case.

**The insight:** There's no unified abstraction for "generate an image, transform it, save it" across these tools.

---

## The Solution: Deterministic Workflow Engine

imgflo provides three deterministic primitives that work consistently across all image types:

```
generate(generator, params) → ImageBlob
transform(blob, operation, params) → ImageBlob
save(blob, destination) → SaveResult
```

### The Same Workflow, Any Image Type

```typescript
import createClient from 'imgflo';
import quickchart from 'imgflo-quickchart';

const imgflo = createClient();
imgflo.registerGenerator(quickchart());

// 1. Generate (same API whether it's a chart, QR code, or AI image)
const chart = await imgflo.generate({
  generator: 'quickchart',
  params: { type: 'bar', data: {...} }
});

// 2. Transform (consistent across all image types)
const resized = await imgflo.transform({
  blob: chart,
  op: 'resize',
  params: { width: 400, height: 300 }
});

// 3. Save (same API for filesystem, S3, or any provider)
const result = await imgflo.save(resized, 's3://my-bucket/chart.png');
```

### How LLMs and imgflo Work Together

The key insight is **division of labor**:

| LLM's Job | imgflo's Job |
|-----------|-------------|
| Parse natural language | Execute structured workflows |
| Extract data ("Q1: 10, Q2: 20") | Generate images from params |
| Choose operations ("needs resizing") | Apply exact transformations |
| Construct workflow steps | Return predictable results |

**Example flow:**

1. **User says:** "Create a bar chart with Q1-Q4 revenue, resize to 800px, upload to S3"

2. **LLM understands and constructs:**
   ```javascript
   run_pipeline({
     steps: [
       { generate: { generator: 'quickchart', params: { type: 'bar', data: {...} } } },
       { transform: { op: 'resize', params: { width: 800 } } },
       { save: { destination: 's3://bucket/chart.png' } }
     ]
   })
   ```

3. **imgflo executes deterministically** — same params always produce same output

### Why This Matters

**For developers building applications:**
- One abstraction for all image types
- Consistent error handling
- Composable pipelines
- Type-safe parameters

**For LLM integrations:**
- Clear contract between natural language and execution
- Predictable outputs for precise operations
- LLM focuses on intent, imgflo handles execution

**For automation and CI/CD:**
- Declarative YAML workflows
- Reproducible builds
- Version-controlled image generation

---

## What imgflo Explicitly Does NOT Do

imgflo stays focused. It does not:

- **Parse natural language** — That's the LLM's job
- **Infer missing parameters** — You specify what you want
- **Guess user intent** — Explicit workflows only
- **Reinvent image libraries** — It orchestrates existing tools

This focus is intentional. imgflo is **glue, not the engine**. It connects you to the best existing tools (Chart.js, Sharp, Playwright, OpenAI) through a unified interface.

---

## Related Documents

- [[Design-Principles]] — The philosophy driving imgflo's architecture
- [[Workflow-Abstraction]] — Technical deep-dive on generate→transform→save
- [[Roadmap]] — Focus areas and direction
- [[Plugin-Architecture]] — How generators and transforms work
