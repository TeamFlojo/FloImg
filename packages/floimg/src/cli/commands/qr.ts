import { writeFile } from "fs/promises";
import { Command } from "commander";
import createClient from "../../index.js";
import { loadConfig } from "../../config/loader.js";
import { loadPlugin, showNpxTip } from "../utils/plugin-loader.js";

/**
 * Shorthand command for generating QR codes
 *
 * This command auto-installs @teamflojo/floimg-qr if not present.
 *
 * @example
 * ```bash
 * # Basic usage - text as first argument
 * floimg qr "https://floimg.com" -o qr.png
 *
 * # With options
 * floimg qr "https://floimg.com" --size 400 --format svg -o qr.svg
 *
 * # High error correction
 * floimg qr "https://floimg.com" --error-correction H
 * ```
 */
export const qrCommand = new Command("qr")
  .description("Generate a QR code (auto-installs @teamflojo/floimg-qr if needed)")
  .argument("<text>", "Text or URL to encode in the QR code")
  .option("-o, --out <path>", "Output file path (default: qr.png)", "qr.png")
  .option("-s, --size <pixels>", "Size in pixels", "300")
  .option("-f, --format <format>", "Output format: png, svg", "png")
  .option("-e, --error-correction <level>", "Error correction: L, M, Q, H", "M")
  .option("-m, --margin <modules>", "Quiet zone margin", "4")
  .option("--dark <color>", "Dark color (hex)", "#000000")
  .option("--light <color>", "Light color (hex)", "#ffffff")
  .option("--no-auto-install", "Don't prompt to install missing plugins")
  .option("--config <path>", "Path to config file")
  .action(async (text, options) => {
    try {
      const config = await loadConfig(options.config);
      const client = createClient(config);

      // Load the QR plugin (auto-installs if needed)
      const qrPlugin = await loadPlugin<{ default: () => unknown }>(
        "qr",
        options.autoInstall !== false
      );

      if (!qrPlugin) {
        process.exit(1);
      }

      client.registerGenerator(
        qrPlugin.default() as Parameters<typeof client.registerGenerator>[0]
      );

      const blob = await client.generate({
        generator: "qr",
        params: {
          text,
          width: parseInt(options.size, 10),
          format: options.format,
          errorCorrectionLevel: options.errorCorrection,
          margin: parseInt(options.margin, 10),
          color: {
            dark: options.dark,
            light: options.light,
          },
        },
      });

      // Determine output path with correct extension
      let outPath = options.out;
      if (outPath === "qr.png" && options.format === "svg") {
        outPath = "qr.svg";
      }

      if (outPath.includes("://")) {
        // Cloud storage
        const result = await client.save(blob, outPath);
        console.log(`✅ QR code saved to: ${result.location}`);
      } else {
        // Local file
        await writeFile(outPath, blob.bytes);
        console.log(`✅ QR code saved to: ${outPath}`);
      }

      // Show tip for npx users
      showNpxTip();
    } catch (error) {
      console.error("Error generating QR code:", error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
