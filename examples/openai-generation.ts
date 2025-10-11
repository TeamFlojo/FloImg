/**
 * OpenAI DALL-E Image Generation Examples
 *
 * This example shows how to use imgflo with OpenAI's DALL-E models
 * to generate AI-powered images.
 */

import createClient from "../src/index.js";

async function main() {
  // Create client with OpenAI configuration
  const imgflo = createClient({
    ai: {
      openai: {
        apiKey: process.env.OPENAI_API_KEY,
        model: "dall-e-3",
        quality: "standard",
      },
    },
    store: {
      default: "s3",
      s3: {
        region: process.env.AWS_REGION || "us-east-1",
        bucket: process.env.S3_BUCKET,
      },
    },
  });

  console.log("=== OpenAI DALL-E Image Generation Examples ===\n");

  // Example 1: Simple image generation
  console.log("1. Generating a presentation background...");
  const bg = await imgflo.generate({
    generator: "openai",
    params: {
      prompt:
        "A modern gradient background with purple and blue tones, minimalist design, suitable for a technology presentation",
      size: "1792x1024",
    },
  });
  console.log(`Generated: ${bg.mime}, ${bg.width}x${bg.height}`);
  console.log(
    `Revised prompt: ${(bg.metadata as any)?.revisedPrompt || "N/A"}\n`
  );

  // Example 2: High quality image
  console.log("2. Generating HD quality image...");
  const hdImage = await imgflo.generate({
    generator: "openai",
    params: {
      prompt: "Professional office space, modern interior design, natural lighting",
      size: "1024x1024",
      quality: "hd",
      style: "natural",
    },
  });
  console.log(`Generated HD image: ${hdImage.width}x${hdImage.height}\n`);

  // Example 3: Generate and upload
  console.log("3. Generating and uploading to S3...");
  const heroImage = await imgflo.generate({
    generator: "openai",
    params: {
      prompt:
        "Abstract geometric pattern, vibrant colors, modern design, suitable for website hero section",
      size: "1792x1024",
      quality: "hd",
    },
  });

  const uploadResult = await imgflo.upload({
    blob: heroImage,
    key: "examples/openai-hero.png",
  });
  console.log(`Uploaded to: ${uploadResult.url}\n`);

  // Example 4: Using DALL-E 2 (cheaper, faster)
  console.log("4. Using DALL-E 2 for quick generation...");
  const dalle2Image = await imgflo.generate({
    generator: "openai",
    params: {
      prompt: "Simple abstract pattern with circles and lines",
      model: "dall-e-2",
      size: "512x512",
    },
  });
  console.log(
    `DALL-E 2 generated: ${dalle2Image.width}x${dalle2Image.height}\n`
  );

  // Example 5: Multiple use cases
  const useCases = [
    {
      name: "Social Media OG Image",
      params: {
        prompt: "Eye-catching social media background, vibrant gradient, modern",
        size: "1024x1024",
      },
    },
    {
      name: "Blog Post Header",
      params: {
        prompt: "Minimalist blog header image, tech theme, clean design",
        size: "1792x1024",
      },
    },
    {
      name: "Product Background",
      params: {
        prompt: "Soft gradient background for product photography, neutral tones",
        size: "1024x1024",
        quality: "hd",
      },
    },
  ];

  console.log("5. Generating images for different use cases...");
  for (const useCase of useCases) {
    const image = await imgflo.generate({
      generator: "openai",
      params: useCase.params as any,
    });
    console.log(`${useCase.name}: ${image.width}x${image.height}`);
  }

  console.log("\n✅ All examples completed!");
}

main().catch((error) => {
  console.error("Error:", error.message);
  process.exit(1);
});
