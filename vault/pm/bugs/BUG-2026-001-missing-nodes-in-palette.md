---
tags: [type/bug]
status: done
priority: p2
created: 2026-01-15
updated: 2026-01-15
---

# Bug: Some Node Types Missing from Palette

## Bug Details

- **Bug ID**: BUG-2026-001
- **Status**: done
- **Priority**: p2
- **Created**: 2026-01-15
- **Fixed**: 2026-01-15

## Problem

The AI Workflow Generator creates workflows containing node types (e.g., `removeBackground`) that don't appear in the left panel node palette. Users can't manually add these nodes or understand what they do.

## Affected Nodes

- `removeBackground` - Stability AI background removal (from `floimg-stability`)
- `upscale` - Stability AI upscaling
- `edit` - OpenAI inpainting
- `variations` - OpenAI DALL-E 2 variations
- `searchAndReplace` - Stability AI
- `outpaint` - Stability AI

## Expected Behavior

All node types that can appear in a workflow should be discoverable in the node palette.

## Root Cause

In FSC, the `floimg.ts` service was only calling `registerGenerator()` for AI providers, but not `registerTransformProvider()`. This meant transform operations like `removeBackground`, `upscale`, etc. weren't being registered and didn't appear in capabilities.

## Resolution

Fixed in floimg-cloud PR #34. Added `registerTransformProvider()` calls for both `stabilityTransform` and `openaiTransform` in `packages/api/src/services/floimg.ts`.

Note: OSS Studio already registers transform providers correctly in `apps/studio/backend/src/floimg/setup.ts`. This bug was FSC-specific.

## Acceptance Criteria

- [x] All registered node types appear somewhere in the palette
- [x] `removeBackground` is visible and usable from the palette
- [x] Plugin nodes are properly categorized (AI section, etc.)

## Related

- floimg-cloud PR #34: fix: register transform providers and respect tier preview in node palette
- OSS Studio setup: `apps/studio/backend/src/floimg/setup.ts`
