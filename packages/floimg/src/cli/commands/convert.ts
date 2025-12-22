import { readFile, writeFile } from "fs/promises";
import { Command } from "commander";
import createClient from "../../index.js";
import { loadConfig } from "../../config/loader.js";
import type { MimeType } from "../../core/types.js";

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
 * Get format from output path extension
 */
function getFormatFromPath(filepath: string): MimeType | null {
  return detectMime(filepath);
}

/**
 * Shorthand command for converting image formats
 *
 * @example
 * ```bash
 * # Convert to WebP (format inferred from output extension)
 * floimg convert input.png -o output.webp
 *
 * # Explicit format specification
 * floimg convert input.png --to webp -o output.webp
 *
 * # With quality setting
 * floimg convert input.png -o output.jpg --quality 85
 * ```
 */
export const convertCommand = new Command("convert")
  .description("Convert image format (shorthand for transform --op convert)")
  .argument("<input>", "Input image file")
  .option("-o, --out <path>", "Output file path (format inferred from extension)")
  .option("-t, --to <format>", "Target format: png, jpg, jpeg, webp, avif, svg")
  .option("-q, --quality <number>", "Quality for lossy formats (1-100)", "80")
  .option("--config <path>", "Path to config file")
  .action(async (input, options) => {
    try {
      const config = await loadConfig(options.config);
      const client = createClient(config);

      // Read input file
      const inputBytes = await readFile(input);
      const inputMime = detectMime(input);

      const inputBlob = {
        bytes: inputBytes,
        mime: inputMime,
      };

      // Determine target format
      let targetFormat: MimeType;

      if (options.to) {
        // Explicit format specified
        const formatMap: Record<string, MimeType> = {
          png: "image/png",
          jpg: "image/jpeg",
          jpeg: "image/jpeg",
          webp: "image/webp",
          avif: "image/avif",
          svg: "image/svg+xml",
        };
        targetFormat = formatMap[options.to.toLowerCase()] || "image/png";
      } else if (options.out) {
        // Infer from output extension
        const inferred = getFormatFromPath(options.out);
        if (!inferred) {
          console.error("Error: Could not infer format from output path.");
          console.error("Use --to to specify format explicitly.");
          process.exit(1);
        }
        targetFormat = inferred;
      } else {
        console.error("Error: Must specify --out or --to.");
        process.exit(1);
      }

      const result = await client.transform({
        blob: inputBlob,
        op: "convert",
        to: targetFormat,
        params: {
          quality: parseInt(options.quality, 10),
        },
      });

      // Determine output path
      const extMap: Record<string, string> = {
        "image/png": "png",
        "image/jpeg": "jpg",
        "image/webp": "webp",
        "image/avif": "avif",
        "image/svg+xml": "svg",
      };
      const newExt = extMap[targetFormat] || "png";
      const outPath = options.out || input.replace(/\.[^.]+$/, `.${newExt}`);

      if (outPath.includes("://")) {
        // Cloud storage
        const saveResult = await client.save(result, outPath);
        console.log(`Converted image saved to: ${saveResult.location}`);
      } else {
        // Local file
        await writeFile(outPath, result.bytes);
        console.log(`Converted image saved to: ${outPath}`);
      }

      console.log(`Format: ${inputMime} → ${result.mime}`);
    } catch (error) {
      console.error("Error converting image:", error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
