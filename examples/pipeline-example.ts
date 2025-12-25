/**
 * Pipeline Examples
 *
 * This demonstrates floimg's YAML pipeline system for:
 * 1. Chaining operations
 * 2. Multi-output workflows
 * 3. Template-based generation
 */

import createClient from "../packages/floimg/src/index.js";
import quickchart from "../packages/floimg-quickchart/src/index.js";
import qr from "../packages/floimg-qr/src/index.js";

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

  // Register plugins
  floimg.registerGenerator(quickchart());
  floimg.registerGenerator(qr());

  console.log("🔗 floimg - Pipeline Examples\n");

  // ====================================================================
  // 1. YAML Pipeline - Social Media Kit
  // ====================================================================
  console.log("1️⃣  Social Media Kit Pipeline\n");

  const socialMediaPipeline = `
name: social-media-kit
description: Generate multiple social media sizes from one source

steps:
  - id: generate-chart
    operation: generate
    generator: quickchart
    params:
      type: bar
      data:
        labels: ["Jan", "Feb", "Mar", "Apr"]
        datasets:
          - label: "Sales"
            data: [12, 19, 8, 15]
            backgroundColor: "rgba(75, 192, 192, 0.6)"

  - id: og-image
    operation: transform
    input: generate-chart
    op: resize
    params:
      width: 1200
      height: 630
      fit: cover
      background: "#ffffff"

  - id: twitter-card
    operation: transform
    input: generate-chart
    op: resize
    params:
      width: 1200
      height: 600
      fit: cover

  - id: instagram-square
    operation: transform
    input: generate-chart
    op: resize
    params:
      width: 1080
      height: 1080
      fit: cover

  - id: save-og
    operation: save
    input: og-image
    path: ./output/og-image.png

  - id: save-twitter
    operation: save
    input: twitter-card
    path: ./output/twitter-card.png

  - id: save-instagram
    operation: save
    input: instagram-square
    path: ./output/instagram-square.png

outputs:
  - og-image
  - twitter-card
  - instagram-square
`;

  console.log("   Pipeline YAML:");
  console.log("   ```yaml");
  console.log(
    socialMediaPipeline
      .split("\n")
      .map((l) => "   " + l)
      .join("\n")
  );
  console.log("   ```\n");

  // Run the pipeline
  // const results = await floimg.runPipeline(socialMediaPipeline);
  console.log("   Run with: floimg run social-media-kit.yaml\n");

  // ====================================================================
  // 2. YAML Pipeline - Thumbnail Generator
  // ====================================================================
  console.log("2️⃣  Thumbnail Generator Pipeline\n");

  const thumbnailPipeline = `
name: thumbnail-generator
description: Generate multiple thumbnail sizes

steps:
  - id: load
    operation: load
    path: ./input/photo.jpg

  - id: thumb-small
    operation: transform
    input: load
    op: resize
    params:
      width: 100
      height: 100
      fit: cover

  - id: thumb-medium
    operation: transform
    input: load
    op: resize
    params:
      width: 200
      height: 200
      fit: cover

  - id: thumb-large
    operation: transform
    input: load
    op: resize
    params:
      width: 400
      height: 400
      fit: cover

  - id: save-small
    operation: save
    input: thumb-small
    path: ./output/thumb-100.png

  - id: save-medium
    operation: save
    input: thumb-medium
    path: ./output/thumb-200.png

  - id: save-large
    operation: save
    input: thumb-large
    path: ./output/thumb-400.png
`;

  console.log("   Generates 3 thumbnail sizes from one source image.\n");

  // ====================================================================
  // 3. YAML Pipeline - Watermark Workflow
  // ====================================================================
  console.log("3️⃣  Watermark Workflow Pipeline\n");

  const watermarkPipeline = `
name: watermark-workflow
description: Add watermark to images

steps:
  - id: load-image
    operation: load
    path: ./input/product.jpg

  - id: load-watermark
    operation: load
    path: ./input/logo.png

  - id: resize-watermark
    operation: transform
    input: load-watermark
    op: resize
    params:
      width: 100

  - id: composite
    operation: transform
    input: load-image
    op: composite
    params:
      overlay: resize-watermark
      gravity: southeast
      margin: 20

  - id: save
    operation: save
    input: composite
    path: ./output/product-watermarked.png
`;

  console.log("   Loads image + watermark, composites, and saves.\n");

  // ====================================================================
  // 4. Programmatic Pipeline Execution
  // ====================================================================
  console.log("4️⃣  Programmatic Pipeline\n");

  console.log("   You can also build pipelines programmatically:\n");
  console.log(`
    // Generate → Transform → Save in one chain
    const chart = await floimg.generate({
      generator: 'quickchart',
      params: { type: 'bar', data: {...} }
    });

    const resized = await floimg.transform({
      blob: chart,
      op: 'resize',
      params: { width: 800 }
    });

    const withText = await floimg.transform({
      blob: resized,
      op: 'addText',
      params: {
        text: 'Q4 Report',
        x: 20,
        y: 20,
        fontSize: 32,
        color: '#333'
      }
    });

    await floimg.save(withText, './output/final.png');
  `);

  // ====================================================================
  // Summary
  // ====================================================================
  console.log("\n🎯 Pipeline Benefits\n");
  console.log("• Declarative: Define workflows as YAML");
  console.log("• Reusable: Save and share pipeline definitions");
  console.log("• Parallel: Independent steps run concurrently");
  console.log("• Composable: Chain any operations together");
  console.log("• Portable: Run via CLI, SDK, or MCP\n");

  console.log("📋 CLI Commands:\n");
  console.log("  floimg run workflow.yaml              # Run a pipeline");
  console.log("  floimg run workflow.yaml --param x=5  # With parameters");
  console.log("  floimg run workflow.yaml --dry-run    # Preview execution\n");
}

main().catch(console.error);
