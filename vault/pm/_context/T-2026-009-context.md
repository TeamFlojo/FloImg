# Context: T-2026-009 Gemini Prompt Enhancement

**Task**: [[T-2026-009-gemini-prompt-enhancement]]
**Created**: 2026-01-09
**Status**: Planning

## Overview

Add a toggle to Gemini generate and edit nodes that automatically enhances user prompts based on Google's official image generation best practices.

The goal is to help users get better results without needing to know the optimal prompting techniques. When `enhancePrompt: true`, the system transforms simple prompts into detailed, well-structured prompts following Google's guidance.

## Google's Key Prompting Principles

From the official documentation:

> **Describe the scene, don't just list keywords.** The model's core strength is its deep language understanding. A narrative, descriptive paragraph will almost always produce a better, more coherent image than a list of disconnected words.

### Prompt Templates by Use Case

**1. Photorealistic Scenes**

```
A photorealistic [shot type] of [subject], [action or expression], set in
[environment]. The scene is illuminated by [lighting description], creating
a [mood] atmosphere. Captured with a [camera/lens details], emphasizing
[key textures and details]. The image should be in a [aspect ratio] format.
```

**2. Stylized Illustrations/Stickers**

```
A [style] sticker of a [subject], featuring [key characteristics] and a
[color palette]. The design should have [line style] and [shading style].
The background must be transparent.
```

**3. Text in Images (Logos, etc.)**

```
Create a [image type] for [brand/concept] with the text "[text to render]"
in a [font style]. The design should be [style description], with a
[color scheme].
```

**4. Product Photography**

```
A high-resolution, studio-lit product photograph of a [product description]
on a [background surface/description]. The lighting is a [lighting setup]
to [purpose]. The camera angle is a [angle type] to showcase [feature].
Ultra-realistic, with sharp focus on [key detail]. [Aspect ratio].
```

**5. Minimalist/Negative Space**

```
A minimalist composition featuring a single [subject] positioned in the
[position] of the frame. The background is a vast, empty [color] canvas,
creating significant negative space. Soft, subtle lighting. [Aspect ratio].
```

### Edit-Specific Templates

**Adding/Removing Elements**

```
Using the provided image of [subject], please [add/remove/modify] [element]
to/from the scene. Ensure the change is [description of integration].
```

**Inpainting (Semantic Masking)**

```
Using the provided image, change only the [specific element] to [new
element/description]. Keep everything else exactly the same, preserving
the original style, lighting, and composition.
```

**Style Transfer**

```
Transform the provided photograph of [subject] into the artistic style of
[artist/style]. Preserve the original composition but render it with
[stylistic elements].
```

## Key Decisions

- Start with rule-based enhancement (no extra LLM calls)
- Pattern-match prompt type to select appropriate template
- Preserve user's original intent while adding detail
- Default to `false` to avoid surprising existing users

## Open Questions

- Should enhancement be visible to the user? (Show enhanced prompt in UI?)
- How to handle prompts that are already detailed?
- Should there be enhancement "modes" (minimal, standard, aggressive)?

## Technical Notes

**Affected files:**

- `packages/floimg-google/src/transforms.ts` - `geminiGenerateSchema`, `geminiEditSchema`, and generation logic
- `packages/floimg-google/src/prompt-enhancer.ts` (new) - Enhancement logic

**Schema changes:**

```typescript
enhancePrompt: {
  type: "boolean",
  title: "Enhance Prompt",
  description: "Automatically expand prompt using Google's best practices",
  default: false,
}
```

## Next Steps

1. Review plan with user
2. Run `/s T-2026-009` to start work
