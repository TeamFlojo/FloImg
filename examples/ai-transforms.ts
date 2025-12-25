/**
 * AI Transform Examples
 *
 * This demonstrates AI-powered image transformations using:
 * 1. Replicate - Face restore, colorize, upscale, text-guided editing
 * 2. Stability AI - Background removal, upscale, search/replace, outpaint
 * 3. OpenAI - Inpainting/editing, variations
 *
 * Requires API keys:
 * - REPLICATE_API_TOKEN
 * - STABILITY_API_KEY
 * - OPENAI_API_KEY
 */

import createClient from "../packages/floimg/src/index.js";
import { replicateTransform } from "../packages/floimg-replicate/src/index.js";
import { stabilityTransform } from "../packages/floimg-stability/src/index.js";
import { openaiTransform } from "../packages/floimg-openai/src/index.js";
import { readFileSync } from "fs";

async function main() {
  const floimg = createClient({
    verbose: true,
    store: {
      default: "fs",
      fs: {
        basePath: "./output",
        baseUrl: "file://./output",
      },
    },
  });

  // Register AI transform providers
  if (process.env.REPLICATE_API_TOKEN) {
    floimg.registerTransformProvider(
      replicateTransform({
        apiToken: process.env.REPLICATE_API_TOKEN,
      })
    );
  }

  if (process.env.STABILITY_API_KEY) {
    floimg.registerTransformProvider(
      stabilityTransform({
        apiKey: process.env.STABILITY_API_KEY,
      })
    );
  }

  if (process.env.OPENAI_API_KEY) {
    floimg.registerTransformProvider(
      openaiTransform({
        apiKey: process.env.OPENAI_API_KEY,
      })
    );
  }

  console.log("🤖 floimg - AI Transform Examples\n");

  // Load a sample image (you'd replace this with your own image)
  // const sampleImage = await floimg.load('./sample.jpg');

  // ====================================================================
  // REPLICATE TRANSFORMS
  // ====================================================================

  if (process.env.REPLICATE_API_TOKEN) {
    console.log("📦 Replicate Transforms\n");

    // 1. Face Restoration with GFPGAN
    console.log("1️⃣  Face Restore (GFPGAN)");
    console.log("   Enhances and restores faces in photos");
    console.log(`
    const restored = await floimg.transform({
      blob: image,
      op: 'faceRestore',
      provider: 'replicate-transform',
      params: {
        version: 'v1.4',     // 'v1.3' | 'v1.4' | 'RestoreFormer'
        scale: 2             // Upscale factor (1-4)
      }
    });
    `);

    // 2. Colorize with DeOldify
    console.log("2️⃣  Colorize (DeOldify)");
    console.log("   Adds color to black & white photos");
    console.log(`
    const colorized = await floimg.transform({
      blob: bwImage,
      op: 'colorize',
      provider: 'replicate-transform',
      params: {
        renderFactor: 35    // Color intensity (7-40)
      }
    });
    `);

    // 3. Real-ESRGAN Upscale
    console.log("3️⃣  Real-ESRGAN Upscale");
    console.log("   AI-powered image upscaling");
    console.log(`
    const upscaled = await floimg.transform({
      blob: image,
      op: 'realEsrgan',
      provider: 'replicate-transform',
      params: {
        scale: 4,              // 2 or 4
        faceEnhance: true      // Also enhance faces
      }
    });
    `);

    // 4. FLUX Kontext Edit
    console.log("4️⃣  FLUX Edit (Text-guided)");
    console.log("   Edit images using natural language");
    console.log(`
    const edited = await floimg.transform({
      blob: image,
      op: 'fluxEdit',
      provider: 'replicate-transform',
      params: {
        prompt: 'change the sky to sunset colors',
        guidanceScale: 3.5
      }
    });
    `);

    console.log("");
  }

  // ====================================================================
  // STABILITY AI TRANSFORMS
  // ====================================================================

  if (process.env.STABILITY_API_KEY) {
    console.log("📦 Stability AI Transforms\n");

    // 1. Background Removal
    console.log("1️⃣  Remove Background");
    console.log("   Removes background, returns transparent PNG");
    console.log(`
    const noBg = await floimg.transform({
      blob: image,
      op: 'removeBackground',
      provider: 'stability-transform'
    });
    `);

    // 2. Conservative Upscale
    console.log("2️⃣  Upscale (Conservative)");
    console.log("   4x upscale preserving original details");
    console.log(`
    const upscaled = await floimg.transform({
      blob: image,
      op: 'upscale',
      provider: 'stability-transform',
      params: {
        prompt: 'high quality, detailed'  // Optional guidance
      }
    });
    `);

    // 3. Search and Replace
    console.log("3️⃣  Search and Replace");
    console.log("   Find and replace objects in images");
    console.log(`
    const replaced = await floimg.transform({
      blob: image,
      op: 'searchAndReplace',
      provider: 'stability-transform',
      params: {
        prompt: 'a golden retriever',
        searchPrompt: 'the cat'
      }
    });
    `);

    // 4. Outpaint
    console.log("4️⃣  Outpaint");
    console.log("   Extend image boundaries with AI");
    console.log(`
    const extended = await floimg.transform({
      blob: image,
      op: 'outpaint',
      provider: 'stability-transform',
      params: {
        left: 200,
        right: 200,
        prompt: 'continue the scene naturally'
      }
    });
    `);

    console.log("");
  }

  // ====================================================================
  // OPENAI TRANSFORMS
  // ====================================================================

  if (process.env.OPENAI_API_KEY) {
    console.log("📦 OpenAI Transforms\n");

    // 1. Edit / Inpaint
    console.log("1️⃣  Edit (Inpainting)");
    console.log("   Modify specific areas using a mask");
    console.log(`
    const edited = await floimg.transform({
      blob: image,
      op: 'edit',
      provider: 'openai-transform',
      params: {
        prompt: 'a sunlit indoor lounge with a pool',
        mask: maskImageBlob,  // Transparent areas = edit region
        model: 'dall-e-2',
        size: '1024x1024'
      }
    });
    `);

    // 2. Variations
    console.log("2️⃣  Variations");
    console.log("   Generate variations of an existing image");
    console.log(`
    const variation = await floimg.transform({
      blob: image,
      op: 'variations',
      provider: 'openai-transform',
      params: {
        n: 1,               // Number of variations
        size: '1024x1024'
      }
    });
    `);

    console.log("");
  }

  // ====================================================================
  // Summary
  // ====================================================================
  console.log("🎯 Transform Provider Summary\n");
  console.log("┌─────────────────────┬────────────────────────────────────────┐");
  console.log("│ Provider            │ Available Operations                   │");
  console.log("├─────────────────────┼────────────────────────────────────────┤");
  console.log("│ replicate-transform │ faceRestore, colorize, realEsrgan,     │");
  console.log("│                     │ fluxEdit                               │");
  console.log("├─────────────────────┼────────────────────────────────────────┤");
  console.log("│ stability-transform │ removeBackground, upscale,             │");
  console.log("│                     │ searchAndReplace, outpaint             │");
  console.log("├─────────────────────┼────────────────────────────────────────┤");
  console.log("│ openai-transform    │ edit, variations                       │");
  console.log("├─────────────────────┼────────────────────────────────────────┤");
  console.log("│ sharp (built-in)    │ resize, crop, rotate, blur, sharpen,   │");
  console.log("│                     │ grayscale, composite, text, convert... │");
  console.log("└─────────────────────┴────────────────────────────────────────┘");
  console.log("");
  console.log("💡 Tip: Combine AI transforms with sharp for powerful pipelines!");
  console.log("   Example: removeBackground → resize → addText → save\n");
}

main().catch(console.error);
