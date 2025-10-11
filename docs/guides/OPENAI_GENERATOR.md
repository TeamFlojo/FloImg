# OpenAI DALL-E Image Generation

imgflo now supports AI-powered image generation using OpenAI's DALL-E models!

## Overview

The OpenAI generator uses DALL-E 2 or DALL-E 3 to create images from text descriptions. Unlike the SVG shapes generator which creates geometric patterns, the OpenAI generator can create realistic photos, illustrations, artwork, and more based on natural language prompts.

## Setup

### 1. Get an OpenAI API Key

1. Sign up at [https://platform.openai.com](https://platform.openai.com)
2. Navigate to API Keys section
3. Create a new API key
4. Copy the key (starts with `sk-...`)

### 2. Configure imgflo

**Option A: Environment Variable**
```bash
export OPENAI_API_KEY="sk-your-api-key-here"
```

**Option B: Config File** (`imgflo.config.ts`)
```typescript
import { defineConfig } from 'imgflo/config';

export default defineConfig({
  ai: {
    default: 'openai',
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      model: 'dall-e-3',  // or 'dall-e-2'
      quality: 'hd',       // 'standard' or 'hd' (DALL-E 3 only)
      style: 'vivid',      // 'vivid' or 'natural' (DALL-E 3 only)
    }
  }
});
```

**Option C: Programmatic**
```typescript
import createClient, { OpenAIGenerator } from 'imgflo';

const client = createClient();
client.registerGenerator(new OpenAIGenerator({
  apiKey: 'sk-your-api-key',
  model: 'dall-e-3',
  quality: 'hd'
}));
```

## Usage

### CLI

```bash
# Generate with DALL-E 3 (default)
imgflo generate \\
  --generator openai \\
  --params '{"prompt":"A purple gradient background for a presentation slide"}' \\
  --out slide-bg.png

# Generate with specific model and quality
imgflo generate \\
  --generator openai \\
  --params '{
    "prompt":"Modern minimalist website hero image",
    "model":"dall-e-3",
    "size":"1792x1024",
    "quality":"hd",
    "style":"natural"
  }' \\
  --out hero.png

# DALL-E 2 (cheaper, faster)
imgflo generate \\
  --generator openai \\
  --params '{
    "prompt":"Abstract geometric pattern",
    "model":"dall-e-2",
    "size":"512x512"
  }' \\
  --out pattern.png
```

### Library API

```typescript
import createClient from 'imgflo';

const imgflo = createClient({
  ai: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY
    }
  }
});

// Generate an image
const image = await imgflo.generate({
  generator: 'openai',
  params: {
    prompt: 'A serene mountain landscape at sunset',
    model: 'dall-e-3',
    size: '1792x1024',
    quality: 'hd'
  }
});

console.log(image.metadata?.revisedPrompt); // DALL-E 3 often revises prompts
```

### Complete Workflow: Generate → Upload

```typescript
// Generate AI image
const aiImage = await imgflo.generate({
  generator: 'openai',
  params: {
    prompt: 'Professional business presentation background, modern, clean',
    size: '1792x1024',
    quality: 'hd'
  }
});

// Upload to S3
const result = await imgflo.upload({
  blob: aiImage,
  key: 'presentations/ai-background.png'
});

console.log(`Image URL: ${result.url}`);
```

## Parameters

### Required

- **`prompt`** (string) - Text description of the image to generate

### Optional

- **`model`** (string) - `"dall-e-2"` or `"dall-e-3"` (default: `"dall-e-3"`)
- **`size`** (string) - Image dimensions:
  - DALL-E 3: `"1024x1024"`, `"1024x1792"`, or `"1792x1024"`
  - DALL-E 2: `"256x256"`, `"512x512"`, or `"1024x1024"`
- **`quality`** (string) - `"standard"` or `"hd"` (DALL-E 3 only, default: `"standard"`)
- **`style`** (string) - `"vivid"` or `"natural"` (DALL-E 3 only, default: `"vivid"`)
- **`n`** (number) - Number of images (DALL-E 2 only, DALL-E 3 always generates 1)

## Model Comparison

### DALL-E 3 (Recommended)

**Pros:**
- Higher quality images
- Better understanding of complex prompts
- Automatic prompt enhancement
- More creative and accurate

**Cons:**
- More expensive (~$0.04-$0.12 per image)
- Only generates 1 image at a time
- Limited size options

**Best for:**
- Professional use cases
- Marketing materials
- High-quality visuals
- Complex scenes

### DALL-E 2

**Pros:**
- More affordable (~$0.016-$0.020 per image)
- Can generate multiple images (n > 1)
- More size options

**Cons:**
- Lower quality than DALL-E 3
- Less accurate prompt following
- No automatic enhancement

**Best for:**
- Prototyping
- High volume generation
- Budget-conscious projects
- Simple images

## Pricing (as of 2025)

### DALL-E 3
- **Standard quality**: $0.040 per image (1024×1024), $0.080 per image (1024×1792 or 1792×1024)
- **HD quality**: $0.080 per image (1024×1024), $0.120 per image (1024×1792 or 1792×1024)

### DALL-E 2
- 1024×1024: $0.020 per image
- 512×512: $0.018 per image
- 256×256: $0.016 per image

Check [OpenAI's pricing page](https://openai.com/api/pricing/) for current rates.

## Prompt Writing Tips

### Be Specific
```typescript
// ❌ Vague
{ prompt: "a background" }

// ✅ Specific
{ prompt: "A modern gradient background with purple and blue tones, minimalist design, suitable for a technology presentation" }
```

### Include Style Details
```typescript
{
  prompt: "Portrait of a professional woman in a modern office, natural lighting, high resolution photography, corporate headshot style"
}
```

### Specify Format/Medium
```typescript
{
  prompt: "Abstract geometric pattern, vector art style, flat design, vibrant colors"
}
```

### Use Descriptive Adjectives
```typescript
{
  prompt: "Serene mountain landscape at golden hour, misty valleys, dramatic peaks, cinematic composition, 4K quality"
}
```

## Use Cases

### 1. Presentation Backgrounds
```typescript
const bg = await imgflo.generate({
  generator: 'openai',
  params: {
    prompt: 'Professional presentation background, corporate blue and white gradient, clean and modern',
    size: '1792x1024',
    quality: 'hd'
  }
});
```

### 2. Social Media Graphics
```typescript
const og = await imgflo.generate({
  generator: 'openai',
  params: {
    prompt: 'Eye-catching social media post background, vibrant colors, abstract shapes, modern design',
    size: '1024x1024'
  }
});
```

### 3. Product Mockups
```typescript
const mockup = await imgflo.generate({
  generator: 'openai',
  params: {
    prompt: 'Minimalist product photography setup, white background, soft shadows, professional studio lighting',
    size: '1024x1024',
    quality: 'hd'
  }
});
```

### 4. Website Hero Images
```typescript
const hero = await imgflo.generate({
  generator: 'openai',
  params: {
    prompt: 'Modern tech startup hero image, diverse team collaborating, bright office space, energetic atmosphere',
    size: '1792x1024',
    quality: 'hd',
    style: 'natural'
  }
});
```

## MCP Integration

The OpenAI generator works seamlessly with the MCP server:

```json
{
  "mcpServers": {
    "imgflo": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "imgflo"],
      "env": {
        "OPENAI_API_KEY": "sk-your-key-here",
        "AWS_REGION": "us-east-1",
        "S3_BUCKET": "my-images"
      }
    }
  }
}
```

Then ask Claude Code:
> "Generate a professional background image for my presentation using DALL-E and upload it to S3"

Claude Code will:
1. Call `generate_image` with the OpenAI generator
2. Call `upload_image` to upload to S3
3. Return the shareable URL

## Error Handling

```typescript
try {
  const image = await imgflo.generate({
    generator: 'openai',
    params: { prompt: 'A beautiful sunset' }
  });
} catch (error) {
  if (error.message.includes('API key')) {
    console.error('OpenAI API key not configured');
  } else if (error.message.includes('quota')) {
    console.error('OpenAI API quota exceeded');
  } else {
    console.error('Generation failed:', error.message);
  }
}
```

## Best Practices

### 1. Cache Results
AI generation can be expensive - cache images when possible:

```typescript
const cacheKey = `openai:${JSON.stringify(params)}`;
// Check cache first, generate if missing
```

### 2. Use Standard Quality for Drafts
Start with `quality: "standard"` for prototyping, upgrade to `"hd"` for final versions.

### 3. Batch Similar Images
If you need multiple variations, consider generating with DALL-E 2 (supports `n > 1`).

### 4. Monitor Costs
Track your usage and costs:

```typescript
const cost = {
  'dall-e-3:1024x1024:standard': 0.040,
  'dall-e-3:1792x1024:hd': 0.120,
  // ... etc
};
```

## Limitations

1. **Content Policy**: OpenAI enforces content policies - certain prompts may be rejected
2. **Rate Limits**: API has rate limits based on your tier
3. **Image Rights**: Review OpenAI's terms for commercial usage rights
4. **Consistency**: Each generation is unique - cannot perfectly recreate an image
5. **DALL-E 3 Constraints**:
   - Only 1 image per request
   - Limited size options
   - Higher cost

## Troubleshooting

### "API key is required"
```bash
# Set environment variable
export OPENAI_API_KEY="sk-..."

# Or use config file
imgflo config set ai.openai.apiKey "sk-..."
```

### "Invalid size for DALL-E 3"
DALL-E 3 only supports: `1024x1024`, `1024x1792`, `1792x1024`

### "Rate limit exceeded"
Your API tier has rate limits. Consider:
- Upgrading your OpenAI plan
- Adding retry logic with backoff
- Caching results

### "Content policy violation"
Your prompt was flagged. Try:
- Rephrasing the prompt
- Being more specific
- Avoiding sensitive topics

## Examples

See `examples/openai-generation.ts` for complete working examples.

## Next Steps

- [CLI Reference](./QUICK_START.md) - Command line usage
- [MCP Server](./MCP_SERVER.md) - Use with Claude Code
- [API Docs](../../README.md) - Library API
