import { readFile, writeFile } from "fs/promises";
import { Command } from "commander";
import createClient from "../../index.js";
import { loadConfig } from "../../config/loader.js";
import type { MimeType } from "../../core/types.js";

/**
 * Parse size argument in format "WIDTHxHEIGHT" or just "WIDTH"
 */
function parseSize(size: string): { width?: number; height?: number } {
  if (size.includes("x")) {
    const [w, h] = size.split("x").map((s) => parseInt(s, 10));
    return { width: w, height: h };
  }
  // Single number = width, maintain aspect ratio
  return { width: parseInt(size, 10) };
}

/**
 * Detect MIME type from file extension
 */
function detectMime(filepath: string): MimeType {
  const ext = filepath.split(".").pop()?.toLowerCase();
  const mimeMap: Record<string, MimeType> = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    webp: "image/webp",
    avif: "image/avif",
    svg: "image/svg+xml",
  };
  return mimeMap[ext || ""] || "image/png";
}

/**
 * Shorthand command for resizing images
 *
 * @example
 * ```bash
 * # Resize to specific dimensions
 * floimg resize input.jpg 800x600 -o output.jpg
 *
 * # Resize width only (maintain aspect ratio)
 * floimg resize input.jpg 800 -o output.jpg
 *
 * # Fit within bounds
 * floimg resize input.jpg 800x600 --fit contain -o output.jpg
 * ```
 */
export const resizeCommand = new Command("resize")
  .description("Resize an image (shorthand for transform --op resize)")
  .argument("<input>", "Input image file")
  .argument("<size>", "Target size: WIDTHxHEIGHT or WIDTH (e.g., 800x600 or 800)")
  .option("-o, --out <path>", "Output file path")
  .option("--fit <mode>", "Fit mode: cover, contain, fill, inside, outside", "cover")
  .option(
    "--position <pos>",
    "Position when cropping: center, top, bottom, left, right, etc.",
    "center"
  )
  .option("--background <color>", "Background color for contain mode", "#ffffff")
  .option("--config <path>", "Path to config file")
  .action(async (input, size, options) => {
    try {
      const config = await loadConfig(options.config);
      const client = createClient(config);

      // Read input file
      const inputBytes = await readFile(input);
      const mime = detectMime(input);

      const inputBlob = {
        bytes: inputBytes,
        mime,
      };

      // Parse size
      const { width, height } = parseSize(size);

      const result = await client.transform({
        blob: inputBlob,
        op: "resize",
        params: {
          width,
          height,
          fit: options.fit,
          position: options.position,
          background: options.background,
        },
      });

      // Determine output path
      const outPath = options.out || input.replace(/(\.[^.]+)$/, "-resized$1");

      if (outPath.includes("://")) {
        // Cloud storage
        const saveResult = await client.save(result, outPath);
        console.log(`Resized image saved to: ${saveResult.location}`);
      } else {
        // Local file
        await writeFile(outPath, result.bytes);
        console.log(`Resized image saved to: ${outPath}`);
      }

      if (result.width && result.height) {
        console.log(`New size: ${result.width}x${result.height}`);
      }
    } catch (error) {
      console.error("Error resizing image:", error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
