# Changelog

All notable changes to imgflo will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.5.0] - 2025-12-08

### BREAKING CHANGES

#### Schema Required on Providers

All generators and transform providers must now include schema definitions:

- `ImageGenerator.schema` is now **required** (was optional)
- `TransformProvider.operationSchemas` is now **required** (was optional)

This ensures all capabilities are discoverable and documented.

### Added

#### Capability Discovery API

New `getCapabilities()` method on the imgflo client for runtime discovery:

```typescript
const client = createClient();
const caps = client.getCapabilities();

// Returns:
// {
//   generators: GeneratorSchema[],
//   transforms: TransformOperationSchema[],
//   saveProviders: SaveProviderSchema[]
// }
```

This enables:
- IDE autocomplete and validation
- Visual editors to generate dynamic UIs
- MCP/AI agents to understand available capabilities

#### Schema Types

New TypeScript types for capability schemas:

- `ParameterSchema` - Describes a parameter (type, title, description, constraints)
- `GeneratorSchema` - Describes a generator with its parameters
- `TransformOperationSchema` - Describes a transform operation
- `SaveProviderSchema` - Describes a save provider
- `ClientCapabilities` - Full capability manifest

#### Parallel Pipeline Execution

Pipeline execution now runs steps in parallel where possible:

```typescript
// These steps run in parallel (wave 1):
{ kind: 'generate', generator: 'shapes', out: 'img1' }
{ kind: 'generate', generator: 'qr', out: 'img2' }

// This step waits for wave 1 (wave 2):
{ kind: 'transform', in: 'img1', out: 'img3' }
```

Key features:
- Automatic dependency graph analysis from `in`/`out` variables
- Wave-based execution (independent steps run simultaneously)
- Bounded concurrency via `Pipeline.concurrency` option
- Early error detection for circular/missing dependencies

#### Built-in Provider Schemas

All built-in providers now include comprehensive schemas:

**Generators:**
- `shapes` - Circle, rectangle, gradient, pattern generation
- `openai` - DALL-E image generation

**Transform Operations (17 total):**
- `convert`, `resize`, `composite`
- `blur`, `sharpen`, `grayscale`, `negate`, `normalize`, `threshold`
- `modulate`, `tint`, `extend`, `extract`
- `roundCorners`, `addText`, `addCaption`, `preset`

### Changed

- Pipeline `run()` method now uses parallel execution by default
- Error messages improved for missing dependencies in pipelines

### Technical Details

- New `pipeline-runner.ts` module for dependency graph and wave computation
- `executeWithConcurrency()` utility for bounded parallel execution
- All 65 tests passing
- Documentation added to vault: `Schema-Capability-System.md`, `Pipeline-Execution-Engine.md`

### Plugin Updates (0.2.0)

All plugins updated to include required schemas:
- `imgflo-qr` - QR code parameters (text, errorCorrectionLevel, width, etc.)
- `imgflo-mermaid` - Diagram parameters (code, theme, backgroundColor, etc.)
- `imgflo-quickchart` - Chart parameters (type, data, options, etc.)
- `imgflo-d3` - Visualization parameters
- `imgflo-screenshot` - Screenshot parameters

## [0.4.3] - 2025-10-13

### Fixed

#### Cloud Storage Actually Works Now (Critical Fix)

This release fixes **all** the issues reported in the field testing feedback. S3-compatible storage (AWS S3, Tigris, R2, etc.) now works correctly via environment variables, config files, CLI, and MCP server.

**What Was Broken**:
- TypeScript config files (`imgflo.config.ts`) weren't being imported correctly
- Environment variables (TIGRIS_*, AWS_*) weren't being detected
- S3SaveProvider wasn't being registered even when credentials were present
- Deprecated `store` config key conflicted with new `save` key
- MCP server couldn't upload to cloud storage despite having credentials

**What's Fixed**:
- ✅ TypeScript config import now works with relative paths (uses `file://` URLs)
- ✅ Environment variables auto-detected: `TIGRIS_*`, `AWS_*`, standard `S3_*`
- ✅ S3SaveProvider auto-registers when Tigris/AWS env vars are present
- ✅ Removed all deprecated `store` config references - only `save` now
- ✅ MCP server, CLI, and all interfaces now consistently support cloud storage
- ✅ Better error messages showing detected configuration

### Changed

- **BREAKING**: Removed deprecated `store` config key - use `save` instead
- **BREAKING**: Removed `registerStoreProvider()` method - use `registerSaveProvider()` instead
- Simplified configuration - environment variables now auto-enable S3 provider

### Added

#### Automatic Tigris/S3 Detection

imgflo now automatically detects and enables S3-compatible storage when you set environment variables:

```bash
# Tigris (auto-detects endpoint)
TIGRIS_BUCKET_NAME=my-bucket
TIGRIS_REGION=auto
TIGRIS_ACCESS_KEY_ID=tid_...
TIGRIS_SECRET_ACCESS_KEY=tsec_...

# AWS S3
AWS_REGION=us-east-1
S3_BUCKET=my-bucket
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...

# Custom S3-compatible (R2, etc.)
S3_ENDPOINT=https://...
S3_BUCKET=my-bucket
AWS_REGION=auto
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
```

No config file needed! Just set the env vars and use `s3://bucket/path` destinations.

#### Enhanced CLI Doctor

```bash
imgflo doctor
```

Now shows:
- Detected Tigris credentials
- Detected AWS credentials
- S3 provider status
- Configuration file locations
- Which config is actually being used

### Technical Details

- Fixed `loadConfigFile()` to convert relative paths to absolute `file://` URLs for ESM import
- Updated `loadEnvConfig()` to detect `TIGRIS_*` environment variables
- Auto-set Tigris endpoint (`https://fly.storage.tigris.dev`) when Tigris credentials detected
- Removed `StoreProvider` interface and all legacy `store` references
- Updated all tests to use `save` instead of `store`
- All 44 tests passing

### Migration from 0.4.2

If you created an `imgflo.config.ts` file following the v0.4.2 migration guide, **it will now work correctly**. No changes needed.

If you were using the deprecated `store` key in config files, change it to `save`:

```typescript
// Before (deprecated)
export default {
  store: {
    s3: { bucket: '...', region: '...' }
  }
}

// After (v0.4.3+)
export default {
  save: {
    s3: { bucket: '...', region: '...' }
  }
}
```

Or just use environment variables and don't create a config file at all!

## [0.4.2] - 2025-10-13

### Fixed

#### Cloud Storage Upload (Critical Fix)
- **CLI `generate` command** now supports S3-compatible storage destinations
  - Before: `imgflo generate --out s3://bucket/image.png` would fail silently
  - After: Works correctly, uploads to S3/Tigris/R2/etc.
- **Better error messages** when S3 provider not configured
  - Now shows exact config needed in error message
  - Guides users to create `imgflo.config.ts`

### Added

#### Documentation & Examples
- **`imgflo.config.example.ts`** - Complete configuration example
  - Shows S3/Tigris/R2 setup
  - Copy-paste ready with env var references
- **`example-pipeline.yaml`** - Multi-step workflow example
  - Generate AI image → Resize → Add caption → Upload to S3
- **README improvements**
  - "Quick Start: Cloud Storage" section
  - Clear distinction between individual commands and pipelines
  - Real-world workflow examples

### Technical Details
- CLI `generate` command now detects `://` protocol and uses `client.save()` for cloud destinations
- All interfaces (JavaScript, CLI, YAML, MCP) now consistently support full workflow abstraction
- No breaking changes

## [0.4.1] - 2025-10-12

### Improved

#### MCP UX Enhancements
- **Intent auto-fill for simple cases**:
  - AI images: `intent` automatically becomes `prompt` if params.prompt not provided
  - QR codes: URLs extracted from `intent` if params.text not provided
  - Eliminates duplication for common use cases
- **Clearer tool descriptions**: Updated MCP tool descriptions to clarify:
  - AI images & QR codes: params optional (auto-filled from intent)
  - Charts & diagrams: params REQUIRED (must provide structured data)
  - Better examples and error messages
- **Documentation refresh**: Updated README to emphasize workflow abstraction and LLM integration patterns

### Changed
- MCP `generate_image` tool now auto-fills params for AI images and QR codes
- MCP `run_pipeline` generate steps apply same auto-fill logic
- Better error messages when required params are missing for charts/diagrams

### Fixed
- Reduced duplication when using MCP tools (no longer need to provide both intent and params.prompt for AI images)
- Clearer mental model: LLMs parse natural language → imgflo executes structured workflows

### Documentation
- Added "Core Concept" section to README
- Added "Using with LLMs" section explaining LLM/imgflo division of responsibilities
- Updated "Workflow Abstraction in Action" table with clearer examples
- Emphasized that imgflo is a workflow execution engine, not a natural language parser

### Technical Details
- No breaking changes (fully backward compatible with v0.4.0)
- All 44 tests passing
- Auto-fill logic in `/packages/imgflo/src/mcp/server.ts` (lines 452-487, 703-712)

## [0.4.0] - 2025-10-12

### BREAKING CHANGES - MCP Server Redesign

The MCP server has been completely redesigned based on real-world usability feedback. This is a **breaking change** for MCP users, but makes imgflo actually practical for production use.

### Added

#### MCP Session Workspace
- **Image ID tracking**: Images are stored in session workspace (`.imgflo/mcp-session/`) with unique IDs
- **No byte passing**: Transform and save operations reference images by ID, not by re-uploading base64
- **Efficient chaining**: Generate → transform → transform → save works without hitting MCP token limits
- **File path support**: All MCP tools accept `imageId`, `imagePath`, or `imageBytes` for maximum flexibility

#### run_pipeline Tool
- **Multi-step workflows**: Execute generate → transform → save in a single MCP call
- **Automatic chaining**: Each step receives output from previous step
- **Perfect for complex workflows**: "Generate AI image, resize, add caption, upload to S3" in one call
- **Returns all results**: Get finalImageId and location/URL from the pipeline execution

#### Improved Intent Routing
- **Better AI detection**: Recognizes "photo of", "illustration", "scene", "stadium", "sunset" as AI requests
- **Descriptive intent detection**: Long descriptions (>5 words) auto-route to OpenAI instead of shapes
- **Keyword matching**: Added 20+ AI-related keywords (photo, picture, painting, realistic, etc.)
- **Fixed default behavior**: No longer defaults everything to shapes/gradients

#### Enhanced MCP Tools

**generate_image**:
- Returns `imageId` for use in subsequent operations
- Optional `saveTo` parameter for also saving to cloud/filesystem
- Session path included in response

**transform_image**:
- Accepts `imageId` (from session), `imagePath` (any file), or `imageBytes` (base64)
- Returns new `imageId` after transformation
- Optional `saveTo` parameter
- MIME type auto-detected for imagePath/imageId

**save_image**:
- Accepts `imageId`, `imagePath`, or `imageBytes`
- Works with session images without re-uploading
- Returns `location` (file path or cloud URL)

### Changed

- MCP server version updated to 0.4.0
- MCP tools no longer pass large image bytes between calls
- Session workspace created automatically on server start
- Tool parameter `destination` renamed to `saveTo` for clarity in generate/transform

### Fixed

- **Critical**: Can now transform generated images without hitting MCP token limits
- **Critical**: Can chain multiple operations (generate → transform → save)
- **Critical**: Cloud upload works through MCP (via saveTo or save_image tool)
- AI image intent routing now works correctly (was defaulting to shapes)
- Transform operations no longer require re-uploading multi-megabyte base64 blobs

### Real-World Use Case Enabled

Before v0.4.0 (❌ Broken):
```
1. Generate AI image → get local file
2. Want to resize? ❌ Can't reference file, must re-upload 2MB base64
3. Want to add caption? ❌ Would hit MCP token limit
4. Want cloud URL? ❌ Have to drop to TypeScript
```

After v0.4.0 (✅ Works):
```javascript
// Step 1: Generate
const img = generate_image({ intent: "Baseball stadium at sunset" })
// Returns: { imageId: "img_123...", session: { path: "..." } }

// Step 2: Resize
const resized = transform_image({
  imageId: img.imageId,
  operation: "resize",
  params: { width: 800, height: 600 }
})
// Returns: { imageId: "img_456...", session: { path: "..." } }

// Step 3: Add caption
const captioned = transform_image({
  imageId: resized.imageId,
  operation: "addCaption",
  params: { text: "Game Day", position: "bottom" }
})

// Step 4: Upload to cloud
const final = save_image({
  imageId: captioned.imageId,
  destination: "s3://my-bucket/stadium.png"
})
// Returns: { location: "https://bucket.s3.amazonaws.com/stadium.png" }
```

Or use the pipeline API:
```javascript
run_pipeline({
  steps: [
    { generate: { intent: "Baseball stadium at sunset" } },
    { transform: { operation: "resize", params: { width: 800, height: 600 } } },
    { transform: { operation: "addCaption", params: { text: "Game Day" } } },
    { save: { destination: "s3://my-bucket/stadium.png" } }
  ]
})
```

### Technical Details

- Session workspace: `.imgflo/mcp-session/` in working directory
- Image IDs: `img_{timestamp}_{random}` format
- Registry stored in memory (per MCP server instance)
- File references prioritized over byte passing
- MIME type detection from file extensions
- Backward compatible: imageBytes still supported for external images

### Migration Guide for MCP Users

**Breaking changes**:
1. `destination` parameter renamed to `saveTo` in generate_image and transform_image
2. Return values now include `imageId` and `session` object
3. Must use `imageId` to reference previously generated/transformed images

**Benefits**:
- Multi-step workflows now actually work
- No more MCP token limit issues
- Can chain unlimited operations
- Cloud upload integrated into workflow

## [0.3.0] - 2025-10-12

### Added

#### Transform Operations - Image Filters & Effects
- **8 Filter Operations** (using Sharp's built-in capabilities):
  - `blur` - Gaussian blur with configurable sigma
  - `sharpen` - Edge sharpening with configurable parameters
  - `grayscale` - Convert images to black & white
  - `negate` - Invert colors
  - `normalize` - Auto-enhance contrast
  - `threshold` - Pure black & white threshold
  - `modulate` - Adjust brightness, saturation, hue, and lightness
  - `tint` - Apply color overlay/tinting

#### Border & Frame Operations
- `extend` - Add borders with custom backgrounds and colors
- `extract` - Crop specific regions from images
- `roundCorners` - Round image corners using SVG masking

#### Text Rendering
- `addText` - Add styled text to images with:
  - Custom positioning (x, y coordinates)
  - Font family and size
  - Text color and alignment (left, center, right)
  - Text shadows for readability
  - Text strokes/outlines
  - Maximum width for text wrapping
- `addCaption` - Add caption bars with:
  - Top or bottom positioning
  - Custom background colors
  - Custom text colors and sizes
  - Configurable padding

#### Preset Filters
8 ready-to-use preset filters built from Sharp primitives:
- `vintage` - Retro/sepia look with warm tones
- `vibrant` - Enhanced saturation and brightness
- `blackAndWhite` - High-quality B&W conversion with contrast enhancement
- `dramatic` - High contrast with boosted saturation
- `soft` - Dreamy/blurred effect
- `cool` - Blue tint for cool tones
- `warm` - Orange/red tint for warm tones
- `highContrast` - Sharp black & white with maximum contrast

#### CLI Commands
- `imgflo filter` - Apply filter operations from command line
- `imgflo preset` - Apply preset filters by name
- `imgflo text add` - Add text to images with full styling options
- `imgflo text caption` - Add caption bars to images
- Updated `imgflo transform` to support all new operations

#### MCP Integration
- Updated `transform_image` tool to support all new filter, border, text, and preset operations
- Enhanced parameter documentation for AI-driven image manipulation
- Full natural language support for new operations

#### Documentation
- Created comprehensive architecture guide: `CORE_VS_PLUGINS.md`
- Added decision tree for determining when features belong in core vs plugins
- Created `filters-example.ts` demonstrating all v0.3.0 capabilities
- Updated MONOREPO.md with architecture references

### Changed
- Updated package version to 0.3.0
- Updated MCP server version to 0.3.0
- Enhanced TypeScript types to include all new transform operations

### Dependencies
- **Added**: `@napi-rs/canvas` (^0.1.80) - Native Rust bindings for text rendering (~2MB)
  - High-performance text rendering using Skia
  - Full font support with `GlobalFonts.registerFromPath()`
  - 13% faster than node-canvas
  - Actively maintained (3.9M weekly downloads)

### Technical Details
- All filter operations leverage Sharp's existing capabilities (zero new dependencies for filters)
- Preset filters use Sharp operation chaining (zero new dependencies)
- Text rendering is the only feature requiring a new dependency (@napi-rs/canvas)
- 20 new integration tests covering all transform operations
- All 44 tests passing
- No breaking changes to existing APIs

### Use Cases Enabled
- **Local Development**: Generate placeholder images with filters and text on-demand
- **Content Creation**: Apply professional filters and add captions to generated images
- **Design Assets**: Create avatars, icons, and graphics with rounded corners and borders
- **Automated Workflows**: Chain filters, effects, and text in YAML pipelines
- **AI Integration**: Natural language image manipulation via MCP

## [0.2.0] - 2025-10-12

### Added
- **Unified `save()` API** - Smart destination routing for filesystem and cloud storage
- **Filesystem Save Provider** - Zero-config local file saving (default provider)
- **S3 Save Provider** - Cloud storage support with smart URI routing
- **YAML Pipelines** - Declarative workflows with `imgflo run pipeline.yaml`
- **MCP Auto-save** - Automatically save generated images to avoid 25K token limit
- **Smart Destination Routing** - Auto-detect provider from path format:
  - `./local/path` → filesystem
  - `s3://bucket/key` → S3
  - `r2://bucket/key` → Cloudflare R2

### Changed
- Renamed `upload()` to `save()` for clearer semantics
- Renamed config `store` to `save` for consistency
- Updated all CLI commands: `imgflo upload` → `imgflo save`
- Updated all documentation to reflect new API

### Deprecated
- `upload()` method (use `save()` instead)
- `store` config option (use `save` instead)

### Fixed
- MCP server now returns saved file locations instead of large base64 blobs
- Resolved 25K token limit issues in MCP by auto-saving images

## [0.1.0] - 2025-10-11

### Added
- Initial release
- Core image generation API
- Built-in generators:
  - `shapes` - SVG gradients, circles, rectangles
  - `openai` - DALL-E integration
- Transform operations:
  - `convert` - Format conversion (SVG → PNG/JPEG/WebP/AVIF)
  - `resize` - Image resizing with fit modes
  - `composite` - Layer images together
  - `optimizeSvg` - SVG optimization
- Plugins:
  - `imgflo-quickchart` - Chart.js charts
  - `imgflo-d3` - D3 data visualizations
  - `imgflo-mermaid` - Mermaid diagrams
  - `imgflo-qr` - QR code generation
  - `imgflo-screenshot` - Website screenshots
- CLI interface with commands:
  - `imgflo generate` - Generate images
  - `imgflo transform` - Transform images
  - `imgflo upload` - Upload to cloud storage
  - `imgflo config` - Configure imgflo
  - `imgflo plugins` - List available plugins
  - `imgflo mcp` - MCP server setup
  - `imgflo doctor` - Check configuration
- MCP Server integration for Claude Code
- TypeScript support throughout
- Full documentation

### Dependencies
- `sharp` (^0.33.5) - Image processing
- `@resvg/resvg-js` (^2.6.2) - SVG rendering
- `@aws-sdk/client-s3` (^3.709.0) - S3 uploads
- `openai` (^4.77.3) - DALL-E integration
- `@modelcontextprotocol/sdk` (^1.20.0) - MCP server
- `commander` (^12.1.0) - CLI framework
- `yaml` (^2.6.1) - YAML parsing
- `dotenv` (^16.4.7) - Environment variables

---

## Version Numbering

imgflo follows [Semantic Versioning](https://semver.org/):
- **Major** (x.0.0): Breaking changes to API
- **Minor** (0.x.0): New features, backward compatible
- **Patch** (0.0.x): Bug fixes, backward compatible

## Links
- [GitHub Repository](https://github.com/bcooke/imgflo)
- [npm Package](https://www.npmjs.com/package/imgflo)
- [Documentation](https://github.com/bcooke/imgflo#readme)
