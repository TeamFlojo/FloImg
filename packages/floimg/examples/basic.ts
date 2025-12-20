/**
 * Basic example: Generate SVG → Convert to PNG → Save
 *
 * This demonstrates the core workflow that makes imgflo useful for AI agents:
 * 1. Generate an image (easy for LLMs since it's just code/parameters)
 * 2. Convert to a web-friendly format
 * 3. Save to filesystem or cloud storage
 */

import createClient from "../src/index.js";

async function main() {
  // Create client (zero-config for filesystem, or add S3 config for cloud)
  const imgflo = createClient({
    verbose: true,
    save: {
      default: "s3",
      s3: {
        region: process.env.AWS_REGION || "us-east-1",
        bucket: process.env.S3_BUCKET || "my-images",
        // Credentials will be picked up from AWS SDK's default credential chain
      },
    },
  });

  console.log("🎨 Generating gradient SVG...");
  const svg = await imgflo.generate({
    generator: "shapes",
    params: {
      type: "gradient",
      width: 1200,
      height: 630,
      color1: "#667eea",
      color2: "#764ba2",
    },
  });

  console.log(`✓ Generated SVG: ${svg.width}x${svg.height}`);

  console.log("\n🔄 Converting SVG to PNG...");
  const png = await imgflo.transform({
    blob: svg,
    op: "convert",
    to: "image/png",
  });

  console.log(`✓ Converted to PNG: ${png.width}x${png.height}`);

  console.log("\n💾 Saving to S3...");
  const result = await imgflo.save(png, "s3://my-images/examples/gradient.png");

  console.log(`✓ Save complete!`);
  console.log(`   Provider: ${result.provider}`);
  console.log(`   Location: ${result.location}`);
  console.log(`   Size: ${result.size} bytes`);

  console.log("\n✨ Done! You can now use this in Google Slides, emails, etc.");
  console.log(`   ${result.location}`);

  // Alternative: Save to filesystem instead
  console.log("\n📁 Also saving to local file...");
  const localResult = await imgflo.save(png, "./output/gradient.png");
  console.log(`✓ Saved locally: ${localResult.location}`);
}

main().catch(console.error);
