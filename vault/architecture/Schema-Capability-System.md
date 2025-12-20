# Schema & Capability System

How imgflo exposes generator and transform capabilities for discovery.

---

## Overview

The capability system allows consumers to discover what generators and transforms are available at runtime, along with their parameter schemas. This enables:

- **IDE autocomplete** — Tools know available generators/operations
- **Visual editors** — Dynamic UI generation from schemas
- **MCP integration** — AI agents understand available capabilities
- **Validation** — Input validation before execution

---

## Core Types

### ParameterSchema

Describes a single parameter for a generator or transform operation:

```typescript
interface ParameterSchema {
  type: "string" | "number" | "boolean" | "object" | "array";
  title?: string;           // Human-readable label
  description?: string;     // Help text
  default?: unknown;        // Default value
  enum?: string[];          // Allowed values (for type: "string")
  minimum?: number;         // Min value (for type: "number")
  maximum?: number;         // Max value (for type: "number")
  properties?: Record<string, ParameterSchema>;  // Nested object
  items?: ParameterSchema;  // Array item type
}
```

### GeneratorSchema

Describes a generator plugin:

```typescript
interface GeneratorSchema {
  name: string;                               // Unique identifier
  description?: string;                       // What it generates
  category?: string;                          // Grouping (e.g., "Charts", "Utility")
  parameters: Record<string, ParameterSchema>;
  requiredParameters?: string[];              // Which params are mandatory
}
```

### TransformOperationSchema

Describes a transform operation:

```typescript
interface TransformOperationSchema {
  name: string;                               // Operation identifier
  description?: string;                       // What it does
  category?: string;                          // Grouping (e.g., "Filters", "Resize")
  parameters: Record<string, ParameterSchema>;
  requiredParameters?: string[];
}
```

### ClientCapabilities

The full capability manifest:

```typescript
interface ClientCapabilities {
  generators: GeneratorSchema[];
  transforms: TransformOperationSchema[];
  saveProviders: SaveProviderSchema[];
}
```

---

## Using Capabilities

### Discovery API

Query available capabilities from an initialized client:

```typescript
import { createClient } from 'imgflo';
import qr from 'imgflo-qr';
import mermaid from 'imgflo-mermaid';

const client = createClient();
client.registerGenerator(qr());
client.registerGenerator(mermaid());

const caps = client.getCapabilities();

// List all generators
console.log(caps.generators.map(g => g.name));
// => ['shapes', 'qr', 'mermaid']

// Get parameter info for a specific generator
const qrSchema = caps.generators.find(g => g.name === 'qr');
console.log(qrSchema.parameters);
// => { text: { type: 'string', ... }, width: { type: 'number', ... }, ... }

// List all transform operations
console.log(caps.transforms.map(t => t.name));
// => ['resize', 'blur', 'sharpen', 'grayscale', ...]
```

### Dynamic UI Generation

Build forms dynamically from schemas:

```typescript
function buildParameterForm(schema: GeneratorSchema) {
  const required = new Set(schema.requiredParameters ?? []);

  return Object.entries(schema.parameters).map(([name, param]) => ({
    name,
    label: param.title ?? name,
    type: mapToInputType(param.type),
    default: param.default,
    required: required.has(name),
    options: param.enum,
    min: param.minimum,
    max: param.maximum,
  }));
}
```

### Validation

Validate parameters before execution:

```typescript
function validateParams(schema: GeneratorSchema, params: Record<string, unknown>) {
  const errors: string[] = [];
  const required = new Set(schema.requiredParameters ?? []);

  // Check required params
  for (const name of required) {
    if (params[name] === undefined) {
      errors.push(`Missing required parameter: ${name}`);
    }
  }

  // Check types
  for (const [name, value] of Object.entries(params)) {
    const paramSchema = schema.parameters[name];
    if (paramSchema && typeof value !== paramSchema.type) {
      errors.push(`Invalid type for ${name}: expected ${paramSchema.type}`);
    }
  }

  return errors;
}
```

---

## Providing Schemas

### Generator Plugins

Generators export a schema alongside the implementation:

```typescript
import type { ImageGenerator, GeneratorSchema } from 'imgflo';

export const qrSchema: GeneratorSchema = {
  name: 'qr',
  description: 'Generate QR codes from text or URLs',
  category: 'Utility',
  parameters: {
    text: {
      type: 'string',
      title: 'Content',
      description: 'Text or URL to encode',
    },
    width: {
      type: 'number',
      title: 'Width',
      description: 'Output width in pixels',
      default: 300,
      minimum: 50,
      maximum: 2000,
    },
    errorCorrectionLevel: {
      type: 'string',
      title: 'Error Correction',
      description: 'Error correction level',
      enum: ['L', 'M', 'Q', 'H'],
      default: 'M',
    },
  },
  requiredParameters: ['text'],
};

export default function qr(): ImageGenerator {
  return {
    name: 'qr',
    schema: qrSchema,
    async generate(params) {
      // Implementation
    },
  };
}
```

### Transform Providers

Transform providers expose operation schemas:

```typescript
import type { TransformProvider, TransformOperationSchema } from 'imgflo';

const resizeSchema: TransformOperationSchema = {
  name: 'resize',
  description: 'Resize image to specified dimensions',
  category: 'Resize',
  parameters: {
    width: { type: 'number', description: 'Target width' },
    height: { type: 'number', description: 'Target height' },
    fit: {
      type: 'string',
      enum: ['cover', 'contain', 'fill', 'inside', 'outside'],
      default: 'cover',
    },
  },
};

export const sharpOperationSchemas: Record<string, TransformOperationSchema> = {
  resize: resizeSchema,
  blur: blurSchema,
  // ... other operations
};

export function createSharpTransformProvider(): TransformProvider {
  return {
    name: 'sharp',
    operationSchemas: sharpOperationSchemas,
    // ... implementation
  };
}
```

---

## Built-in Schemas

### Generators

| Generator | Category | Required Params |
|-----------|----------|-----------------|
| `shapes` | Utility | `shape` |
| `openai` | AI | `prompt` |

### Transform Operations (Sharp)

| Operation | Category | Key Params |
|-----------|----------|------------|
| `resize` | Resize | width, height, fit |
| `convert` | Format | format, quality |
| `blur` | Filters | sigma |
| `sharpen` | Filters | sigma, flat, jagged |
| `grayscale` | Color | — |
| `negate` | Color | — |
| `normalize` | Color | — |
| `threshold` | Color | value |
| `modulate` | Adjust | brightness, saturation, hue |
| `tint` | Color | color |
| `extend` | Canvas | top, bottom, left, right |
| `extract` | Crop | left, top, width, height |
| `roundCorners` | Effects | radius |
| `addText` | Overlay | text, x, y, font, size, color |
| `addCaption` | Overlay | text, position, font, size |
| `composite` | Compose | overlay, gravity, blend |
| `preset` | Presets | preset |

---

## Design Decisions

### Schema is Required

The `schema` property is required on `ImageGenerator` and `operationSchemas` is required on `TransformProvider`. This ensures:

- All capabilities are discoverable
- No generators/transforms exist without documentation
- Consumer tooling can rely on schema presence

### JSON Schema Compatibility

`ParameterSchema` is intentionally compatible with JSON Schema subset, enabling:

- Standard validation libraries
- OpenAPI integration
- IDE schema validation

### Flat vs Nested Schemas

Schemas use a flat structure for parameters. For complex nested configs (like Chart.js options), use `type: 'object'` with nested `properties`:

```typescript
parameters: {
  options: {
    type: 'object',
    properties: {
      animation: { type: 'boolean', default: true },
      responsive: { type: 'boolean', default: false },
    },
  },
}
```

---

## Related Documents

- [[Plugin-Architecture]] — Creating generators and transforms
- [[Workflow-Abstraction]] — The generate→transform→save model
- [[Pipeline-Execution-Engine]] — How pipelines execute
