# Roadmap

High-level direction for imgflo development.

## Vision

imgflo is a universal image workflow engine designed for:
- Developers building image processing pipelines
- AI agents that need image generation capabilities
- Automation scripts and CI/CD workflows

## Current State (v0.4.x)

### Core Capabilities
- Workflow definition via YAML or programmatic API
- Generator and transform pipeline execution
- S3-compatible storage support
- CLI for local development and scripts
- MCP server for AI agent integration

### Plugin Ecosystem
- QR code generation (imgflo-qr)
- Diagram rendering (imgflo-mermaid, imgflo-d3)
- Chart generation (imgflo-quickchart)
- Screenshots (imgflo-screenshot)

## Focus Areas

### Stability & Polish
- Comprehensive error handling
- Improved TypeScript types
- Better documentation and examples

### Plugin Ecosystem
- Additional generator plugins
- Transform plugin development
- Community contribution guidelines

### AI Integration
- Enhanced MCP server capabilities
- Better parameter schemas for AI consumption
- Workflow templates for common use cases

### Performance
- Caching strategies
- Parallel execution optimization
- Memory management for large images

## Non-Goals

These are explicitly out of scope:
- Real-time image editing UI (see imgflo-studio)
- Photo editing features (filters, adjustments)
- Video processing

## Contributing

See GitHub Issues for current work items. External contributions welcome for:
- Bug fixes
- Documentation improvements
- New plugin ideas (discuss in issue first)
