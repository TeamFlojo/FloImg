import { readFile, writeFile } from "fs/promises";
import { Command } from "commander";
import createClient from "../../index.js";
import { loadConfig } from "../../config/loader.js";
import type { MimeType } from "../../core/types.js";

export const textCommand = new Command("text")
  .description("Add text or captions to images");

// Add text subcommand
textCommand
  .command("add")
  .description("Add text to an image")
  .requiredOption("--in <path>", "Input file path")
  .requiredOption("--text <text>", "Text to add")
  .requiredOption("--x <number>", "X position", parseInt)
  .requiredOption("--y <number>", "Y position", parseInt)
  .option("--font <family>", "Font family", "Arial")
  .option("--size <number>", "Font size in pixels", "24")
  .option("--color <color>", "Text color (hex)", "#000000")
  .option("--align <alignment>", "Text alignment: left, center, right", "left")
  .option("--shadow", "Add text shadow")
  .option("--stroke-color <color>", "Stroke color (hex)")
  .option("--stroke-width <number>", "Stroke width", parseFloat)
  .option("--out <path>", "Output file path (if not provided, outputs to stdout)")
  .option("--config <path>", "Path to config file")
  .action(async (options) => {
    try {
      const config = await loadConfig(options.config);
      const client = createClient(config);

      // Read input file
      const inputBytes = await readFile(options.in);

      // Detect MIME type from file extension
      const ext = options.in.split(".").pop()?.toLowerCase();
      let mime: MimeType = "image/png";
      if (ext === "svg") mime = "image/svg+xml";
      else if (ext === "jpg" || ext === "jpeg") mime = "image/jpeg";
      else if (ext === "webp") mime = "image/webp";
      else if (ext === "avif") mime = "image/avif";

      const inputBlob = {
        bytes: inputBytes,
        mime,
      };

      const params: Record<string, unknown> = {
        text: options.text,
        x: options.x,
        y: options.y,
        font: options.font,
        size: parseInt(options.size),
        color: options.color,
        align: options.align,
        shadow: options.shadow || false,
      };

      if (options.strokeColor && options.strokeWidth) {
        params.stroke = {
          color: options.strokeColor,
          width: options.strokeWidth,
        };
      }

      const result = await client.transform({
        blob: inputBlob,
        op: "addText",
        params,
      });

      if (options.out) {
        await writeFile(options.out, result.bytes);
        console.log(`Text added to image: ${options.out}`);
        console.log(`Format: ${result.mime}`);
      } else {
        // Write to stdout
        process.stdout.write(result.bytes);
      }
    } catch (error) {
      console.error("Error adding text:", error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Add caption subcommand
textCommand
  .command("caption")
  .description("Add caption bar to an image")
  .requiredOption("--in <path>", "Input file path")
  .requiredOption("--text <text>", "Caption text")
  .option("--position <pos>", "Caption position: top, bottom", "bottom")
  .option("--bg-color <color>", "Background color", "rgba(0, 0, 0, 0.8)")
  .option("--text-color <color>", "Text color", "#ffffff")
  .option("--font-size <number>", "Font size in pixels", "32")
  .option("--padding <number>", "Padding in pixels", "20")
  .option("--out <path>", "Output file path (if not provided, outputs to stdout)")
  .option("--config <path>", "Path to config file")
  .action(async (options) => {
    try {
      const config = await loadConfig(options.config);
      const client = createClient(config);

      // Read input file
      const inputBytes = await readFile(options.in);

      // Detect MIME type from file extension
      const ext = options.in.split(".").pop()?.toLowerCase();
      let mime: MimeType = "image/png";
      if (ext === "svg") mime = "image/svg+xml";
      else if (ext === "jpg" || ext === "jpeg") mime = "image/jpeg";
      else if (ext === "webp") mime = "image/webp";
      else if (ext === "avif") mime = "image/avif";

      const inputBlob = {
        bytes: inputBytes,
        mime,
      };

      const params = {
        text: options.text,
        position: options.position,
        backgroundColor: options.bgColor,
        textColor: options.textColor,
        fontSize: parseInt(options.fontSize),
        padding: parseInt(options.padding),
      };

      const result = await client.transform({
        blob: inputBlob,
        op: "addCaption",
        params,
      });

      if (options.out) {
        await writeFile(options.out, result.bytes);
        console.log(`Caption added to image: ${options.out}`);
        console.log(`Format: ${result.mime}`);
      } else {
        // Write to stdout
        process.stdout.write(result.bytes);
      }
    } catch (error) {
      console.error("Error adding caption:", error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
