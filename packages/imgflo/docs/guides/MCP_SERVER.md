# imgflo MCP Server

The imgflo MCP (Model Context Protocol) server provides direct integration with AI assistants like Claude Code, enabling seamless image generation, transformation, and upload workflows.

## What is MCP?

[Model Context Protocol (MCP)](https://modelcontextprotocol.io) is an open standard for connecting AI assistants to external tools and data sources. The imgflo MCP server exposes imgflo's capabilities as MCP tools that AI assistants can call directly.

## Installation

Install imgflo globally to get both the CLI and MCP server:

```bash
npm install -g imgflo
```

This installs two binaries:
- `imgflo` - The CLI tool
- `imgflo-mcp` - The MCP server

## Configuration with Claude Code

Add imgflo to your Claude Code configuration file (`~/.claude.json`):

```json
{
  "mcpServers": {
    "imgflo": {
      "type": "stdio",
      "command": "imgflo-mcp",
      "env": {
        "AWS_REGION": "us-east-1",
        "S3_BUCKET": "my-images-bucket"
      }
    }
  }
}
```

Or use npx if you don't have it installed globally:

```json
{
  "mcpServers": {
    "imgflo": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "imgflo"],
      "env": {
        "AWS_REGION": "us-east-1",
        "S3_BUCKET": "my-images-bucket"
      }
    }
  }
}
```

### Environment Variables

The MCP server reads the same configuration as the CLI:

- **AWS_REGION** - AWS region for S3 uploads (e.g., `us-east-1`)
- **S3_BUCKET** - S3 bucket name for uploads
- **AWS_ACCESS_KEY_ID** - AWS access key (optional if using IAM roles)
- **AWS_SECRET_ACCESS_KEY** - AWS secret key (optional if using IAM roles)

You can also use imgflo config files instead of environment variables. See [Configuration Guide](./CONFIGURATION.md).

## Available Tools

The MCP server exposes three tools:

### 1. `generate_image`

Generate an image using a specified generator.

**Parameters:**
- `generator` (string, default: "shapes") - Generator to use
- `params` (object, default: {}) - Generator-specific parameters

**For the 'shapes' generator:**
- `type` - Shape type: "gradient", "circle", "rectangle", or "pattern"
- `width` - Image width in pixels
- `height` - Image height in pixels
- `color1`, `color2` - Colors for gradients (hex format)
- `fill` - Fill color for shapes (hex format)
- `rx` - Border radius for rectangles
- `patternType` - Pattern type: "dots", "stripes", or "grid"

**Returns:**
```json
{
  "success": true,
  "blob": {
    "bytes": "base64-encoded-image-data",
    "mime": "image/svg+xml",
    "width": 1200,
    "height": 630
  }
}
```

### 2. `transform_image`

Transform an image (convert format, resize, etc.).

**Parameters:**
- `imageBytes` (string, required) - Base64-encoded image bytes
- `mime` (string, required) - MIME type of input image (e.g., "image/svg+xml")
- `operation` (string, required) - Operation: "convert", "resize", or "optimizeSvg"
- `to` (string) - Target MIME type for convert operation (e.g., "image/png")
- `width` (number) - Target width for resize operation
- `height` (number) - Target height for resize operation

**Returns:**
```json
{
  "success": true,
  "blob": {
    "bytes": "base64-encoded-image-data",
    "mime": "image/png",
    "width": 1200,
    "height": 630
  }
}
```

### 3. `upload_image`

Upload an image to configured storage and get a shareable URL.

**Parameters:**
- `imageBytes` (string, required) - Base64-encoded image bytes
- `mime` (string, required) - MIME type (e.g., "image/png")
- `key` (string, required) - Storage key/path (e.g., "slides/background.png")
- `provider` (string, optional) - Storage provider ("s3" or "fs"), uses default if not specified

**Returns:**
```json
{
  "success": true,
  "url": "https://my-bucket.s3.amazonaws.com/slides/background.png",
  "key": "slides/background.png"
}
```

## Usage Examples

### Example 1: Generate and Upload (Claude Code)

User: "Create a gradient background for my slides and upload it to S3"

Claude Code will:
1. Call `generate_image` with gradient parameters
2. Call `transform_image` to convert SVG → PNG
3. Call `upload_image` to upload to S3
4. Return the shareable URL

### Example 2: Complete Workflow

User: "Generate a purple gradient, convert to PNG, and upload as slides/title-bg.png"

Claude Code workflow:
```javascript
// 1. Generate gradient
const generated = await generate_image({
  generator: "shapes",
  params: {
    type: "gradient",
    width: 1920,
    height: 1080,
    color1: "#667eea",
    color2: "#764ba2"
  }
});

// 2. Convert to PNG
const converted = await transform_image({
  imageBytes: generated.blob.bytes,
  mime: generated.blob.mime,
  operation: "convert",
  to: "image/png"
});

// 3. Upload to S3
const uploaded = await upload_image({
  imageBytes: converted.blob.bytes,
  mime: converted.blob.mime,
  key: "slides/title-bg.png"
});

// Returns: { url: "https://bucket.s3.amazonaws.com/slides/title-bg.png" }
```

### Example 3: Batch Generation

User: "Create 5 different gradient backgrounds for my presentation"

Claude Code can call the tools in parallel to generate and upload multiple images efficiently.

## Troubleshooting

### Server Not Connecting

1. **Check installation:**
   ```bash
   which imgflo-mcp
   ```

2. **Test manually:**
   ```bash
   imgflo-mcp
   # Should start and wait for JSON-RPC messages
   ```

3. **Check Claude Code logs:**
   ```bash
   # View MCP server status
   /mcp
   ```

### Configuration Issues

1. **Verify config file exists:**
   ```bash
   imgflo config path
   ```

2. **Check configuration:**
   ```bash
   imgflo doctor
   ```

3. **Set default storage:**
   ```bash
   imgflo config set store.default s3
   imgflo config set store.s3.bucket your-bucket-name
   imgflo config set store.s3.region us-east-1
   ```

### AWS Credentials

The MCP server inherits AWS credentials from:
1. Environment variables in the MCP config
2. AWS credentials file (`~/.aws/credentials`)
3. IAM roles (if running on EC2)

Test your credentials:
```bash
aws s3 ls s3://your-bucket-name
```

## Error Handling

All tool calls return a consistent format:

**Success:**
```json
{
  "success": true,
  "blob": { ... }  // or "url": "..."
}
```

**Error:**
```json
{
  "success": false,
  "error": "ConfigurationError",
  "message": "No storage provider specified and no default configured"
}
```

Error types:
- `ConfigurationError` - Missing or invalid configuration
- `ProviderNotFoundError` - Specified provider not found
- `Error` - General errors

## Advanced Usage

### Custom Configuration Path

You can use a project-specific config file:

```json
{
  "mcpServers": {
    "imgflo": {
      "type": "stdio",
      "command": "imgflo-mcp",
      "env": {
        "IMGFLO_CONFIG": "/path/to/imgflo.config.ts"
      }
    }
  }
}
```

### Local Development

For local testing without S3:

```json
{
  "mcpServers": {
    "imgflo": {
      "type": "stdio",
      "command": "imgflo-mcp",
      "env": {
        "IMGFLO_STORE_DEFAULT": "fs",
        "IMGFLO_STORE_FS_BASE_PATH": "./output",
        "IMGFLO_STORE_FS_BASE_URL": "http://localhost:3000/images"
      }
    }
  }
}
```

## Best Practices

### 1. Use Descriptive Keys

```javascript
// Good
key: "slides/presentation-2024/title-background.png"

// Less descriptive
key: "image1.png"
```

### 2. Chain Operations Efficiently

Let Claude Code handle the workflow - it can automatically chain generate → transform → upload based on your request.

### 3. Specify Image Dimensions

Always specify width and height for consistent results:

```javascript
params: {
  type: "gradient",
  width: 1920,   // Full HD width
  height: 1080   // Full HD height
}
```

### 4. Use Environment-Specific Buckets

Configure different buckets for dev/staging/production:

```json
{
  "mcpServers": {
    "imgflo-dev": {
      "type": "stdio",
      "command": "imgflo-mcp",
      "env": {
        "S3_BUCKET": "my-images-dev"
      }
    },
    "imgflo-prod": {
      "type": "stdio",
      "command": "imgflo-mcp",
      "env": {
        "S3_BUCKET": "my-images-prod"
      }
    }
  }
}
```

## Security Considerations

1. **Credentials** - Never commit AWS credentials to version control
2. **Bucket Permissions** - Use IAM roles with minimal required permissions
3. **Public Access** - Configure S3 bucket policies for appropriate public access
4. **Rate Limiting** - Be aware of S3 rate limits and costs

## Next Steps

- [Configuration Guide](./CONFIGURATION.md) - Learn about config files
- [CLI Reference](./QUICK_START.md) - Use imgflo from the command line
- [API Documentation](../API.md) - Use imgflo as a library

## Support

- **Issues**: https://github.com/bcooke/imgflo/issues
- **Documentation**: https://github.com/bcooke/imgflo#readme
- **MCP Spec**: https://modelcontextprotocol.io
