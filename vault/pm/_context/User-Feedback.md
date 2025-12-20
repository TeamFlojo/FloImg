# User Feedback & Improvement Ideas

Collected feedback from real-world usage of imgflo.

---

## API Clarity

### Export Naming
The library exports `createClient` as both default and named export, which works well:
```typescript
import createClient from 'imgflo';     // Default export
import { createClient } from 'imgflo'; // Named export
```

**Recommendation:** Maintain both exports for flexibility.

### API Usage
The `client.generate()` API is clean and intuitive. The `ImageBlob` type with `bytes`, `mime`, `width`, `height` is well-designed.

---

## S3 Provider Feedback

### Credentials Structure

**Issue**: The `S3Provider` uses a flat credential structure instead of the AWS SDK standard nested `credentials` object.

**Current API**:
```typescript
new S3Provider({
  bucket: 'my-bucket',
  region: 'us-east-1',
  accessKeyId: 'xxx',      // Flat structure
  secretAccessKey: 'yyy',  // Flat structure
  endpoint: '...'
})
```

**Expected AWS SDK Pattern**:
```typescript
new S3Provider({
  bucket: 'my-bucket',
  region: 'us-east-1',
  credentials: {              // Nested credentials object
    accessKeyId: 'xxx',
    secretAccessKey: 'yyy'
  },
  endpoint: '...'
})
```

**Recommendation**: Support both patterns for backwards compatibility:
```typescript
interface S3ProviderConfig {
  bucket: string;
  region: string;
  endpoint?: string;

  // Support both patterns
  accessKeyId?: string;
  secretAccessKey?: string;
  credentials?: {
    accessKeyId: string;
    secretAccessKey: string;
    sessionToken?: string;
  };
}
```

### Multiple S3-Compatible Providers

**Issue**: S3Provider always registers as `'s3'`, preventing multiple S3-compatible providers.

```typescript
// Both register as 's3' - second overwrites first!
const aws = new S3Provider({ bucket: 'aws-bucket', region: 'us-east-1' });
const r2 = new S3Provider({ bucket: 'r2-bucket', endpoint: 'https://...' });

client.registerStoreProvider(aws);
client.registerStoreProvider(r2); // Overwrites aws provider!
```

**Recommendation**: Add optional `name` parameter:
```typescript
interface S3ProviderConfig {
  name?: string; // Defaults to 's3'
  bucket: string;
  region: string;
  // ...
}

// Usage:
const aws = new S3Provider({ name: 'aws', bucket: 'aws-bucket', ... });
const r2 = new S3Provider({ name: 'r2', bucket: 'r2-bucket', ... });
const backblaze = new S3Provider({ name: 'backblaze', ... });

await client.upload({ blob, key: 'image.png', provider: 'r2' });
```

### Missing Public URL in Upload Result

**Issue**: `UploadResult` doesn't include a public URL, requiring manual construction.

**Current Behavior**:
```typescript
const result = await client.upload({ blob, key: 'image.png', provider: 's3' });
// result = { key: 'image.png', etag: '...' }
// No URL provided!

// Must manually construct:
const url = `https://my-bucket.s3.amazonaws.com/${result.key}`;
```

**Recommendation**: Add `publicUrl` option to S3ProviderConfig:
```typescript
interface S3ProviderConfig {
  bucket: string;
  region: string;
  endpoint?: string;
  publicUrl?: string; // Template or base URL
}

// Result would include:
{
  key: 'image.png',
  url: 'https://my-bucket.s3.amazonaws.com/image.png', // Auto-generated
  etag: '...'
}
```

---

## Enhancement Ideas

### Direct Data URI Support

For APIs like Google Slides that accept data URIs:

```typescript
const result = await imgflo.generate({ ... })
const dataUri = await imgflo.toDataUri(result);
// Returns: "data:image/png;base64,..."
```

**Benefits**:
- No intermediate files needed
- No cloud storage required for simple use cases
- Faster workflow for programmatic presentation generation

### Preset Dimensions

Add common dimension presets:

```typescript
const result = await imgflo.generate({
  generator: 'shapes',
  params: { ... },
  preset: 'slides-widescreen' // 1920x1080
});
```

### Batch Generation

Generate multiple variations:

```typescript
const variations = await imgflo.batch([
  { generator: 'shapes', params: { colors: ['#667eea', '#764ba2'] } },
  { generator: 'shapes', params: { colors: ['#FF6B6B', '#4ECDC4'] } },
  { generator: 'shapes', params: { colors: ['#9333ea', '#db2777'] } }
]);
```

---

## What Works Well

### Core API
- `createClient()` initialization is straightforward
- `client.generate()` API is clean and intuitive
- `ImageBlob` type is well-designed
- Shapes generator produces valid, clean SVG output
- Provider registration system is easy to understand

### Transform Operations
- SVG to PNG conversion via `client.transform()` works excellently
- Output quality is high, dimensions are preserved
- Sharp integration is seamless and fast

### S3 Upload
- S3Provider successfully uploads to AWS S3 and S3-compatible services
- Works with Cloudflare R2, Tigris, Backblaze B2, etc.
- Supports custom endpoints for S3-compatible storage

---

## Related Documents

- [[Design-Principles]] - Overall philosophy
- [[Roadmap]] - Planned improvements
