import sharp from "sharp";
import { Resvg } from "@resvg/resvg-js";
import type { TransformProvider, ImageBlob, MimeType } from "../../core/types.js";
import { TransformError } from "../../core/errors.js";
import { TextRenderer, type TextOptions, type CaptionOptions } from "./text.js";
import { FilterPresets } from "./presets.js";

/**
 * Transform provider using Sharp for image manipulation and Resvg for SVG rendering
 */
export class SharpTransformProvider implements TransformProvider {
  name = "sharp";

  async convert(input: ImageBlob, to: MimeType): Promise<ImageBlob> {
    try {
      let sharpInstance: sharp.Sharp;

      // If input is SVG, use Resvg to render it to PNG first
      if (input.mime === "image/svg+xml") {
        const resvg = new Resvg(input.bytes, {
          fitTo: {
            mode: "original",
          },
        });

        const pngData = resvg.render();
        const pngBuffer = pngData.asPng();

        // Now we have PNG, continue with Sharp for format conversion
        if (to === "image/png") {
          return {
            bytes: pngBuffer,
            mime: "image/png",
            width: pngData.width,
            height: pngData.height,
            source: input.source,
          };
        }

        sharpInstance = sharp(pngBuffer);
      } else {
        sharpInstance = sharp(input.bytes);
      }

      // Get metadata for width/height
      const metadata = await sharpInstance.metadata();

      // Convert to target format
      let outputBuffer: Buffer;
      switch (to) {
        case "image/png":
          outputBuffer = await sharpInstance.png().toBuffer();
          break;
        case "image/jpeg":
          outputBuffer = await sharpInstance.jpeg({ quality: 90 }).toBuffer();
          break;
        case "image/webp":
          outputBuffer = await sharpInstance.webp({ quality: 90 }).toBuffer();
          break;
        case "image/avif":
          outputBuffer = await sharpInstance.avif({ quality: 90 }).toBuffer();
          break;
        case "image/svg+xml":
          throw new TransformError("Cannot convert raster images to SVG");
        default:
          throw new TransformError(`Unsupported target format: ${to}`);
      }

      return {
        bytes: outputBuffer,
        mime: to,
        width: metadata.width,
        height: metadata.height,
        source: input.source,
      };
    } catch (error) {
      if (error instanceof TransformError) {
        throw error;
      }
      throw new TransformError(
        `Failed to convert image: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async resize(
    input: ImageBlob,
    opts: {
      width?: number;
      height?: number;
      fit?: "cover" | "contain" | "fill";
    }
  ): Promise<ImageBlob> {
    try {
      let sharpInstance: sharp.Sharp;

      // Handle SVG input
      if (input.mime === "image/svg+xml") {
        const resvg = new Resvg(input.bytes, {
          fitTo: {
            mode: "width",
            value: opts.width || input.width || 1200,
          },
        });

        const pngData = resvg.render();
        const pngBuffer = pngData.asPng();
        sharpInstance = sharp(pngBuffer);
      } else {
        sharpInstance = sharp(input.bytes);
      }

      // Apply resize
      const resized = sharpInstance.resize({
        width: opts.width,
        height: opts.height,
        fit: opts.fit || "cover",
      });

      const outputBuffer = await resized.toBuffer();
      const metadata = await sharp(outputBuffer).metadata();

      return {
        bytes: outputBuffer,
        mime: input.mime === "image/svg+xml" ? "image/png" : input.mime,
        width: metadata.width,
        height: metadata.height,
        source: input.source,
      };
    } catch (error) {
      throw new TransformError(
        `Failed to resize image: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async composite(
    base: ImageBlob,
    overlays: Array<{ blob: ImageBlob; left: number; top: number }>
  ): Promise<ImageBlob> {
    try {
      let baseInstance = sharp(base.bytes);

      const compositeInputs = overlays.map((overlay) => ({
        input: overlay.blob.bytes,
        left: overlay.left,
        top: overlay.top,
      }));

      const result = await baseInstance.composite(compositeInputs).toBuffer();
      const metadata = await sharp(result).metadata();

      return {
        bytes: result,
        mime: base.mime,
        width: metadata.width,
        height: metadata.height,
        source: base.source,
      };
    } catch (error) {
      throw new TransformError(
        `Failed to composite images: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async optimizeSvg(svg: ImageBlob): Promise<ImageBlob> {
    if (svg.mime !== "image/svg+xml") {
      throw new TransformError("optimizeSvg only works with SVG images");
    }

    // For MVP, we'll just return the SVG as-is
    // In the future, we could integrate SVGO here
    return svg;
  }

  // ===== Filter Operations =====

  async blur(input: ImageBlob, sigma?: number): Promise<ImageBlob> {
    try {
      const sharpInstance = sharp(input.bytes);
      const result = await sharpInstance.blur(sigma).toBuffer();
      const metadata = await sharp(result).metadata();

      return {
        bytes: result,
        mime: input.mime,
        width: metadata.width,
        height: metadata.height,
        source: input.source,
      };
    } catch (error) {
      throw new TransformError(
        `Failed to blur image: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async sharpen(input: ImageBlob, opts?: Record<string, unknown>): Promise<ImageBlob> {
    try {
      const sharpInstance = sharp(input.bytes);
      const result = opts
        ? await sharpInstance.sharpen(opts as any).toBuffer()
        : await sharpInstance.sharpen().toBuffer();
      const metadata = await sharp(result).metadata();

      return {
        bytes: result,
        mime: input.mime,
        width: metadata.width,
        height: metadata.height,
        source: input.source,
      };
    } catch (error) {
      throw new TransformError(
        `Failed to sharpen image: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async grayscale(input: ImageBlob): Promise<ImageBlob> {
    try {
      const sharpInstance = sharp(input.bytes);
      const result = await sharpInstance.grayscale().toBuffer();
      const metadata = await sharp(result).metadata();

      return {
        bytes: result,
        mime: input.mime,
        width: metadata.width,
        height: metadata.height,
        source: input.source,
      };
    } catch (error) {
      throw new TransformError(
        `Failed to convert image to grayscale: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async negate(input: ImageBlob): Promise<ImageBlob> {
    try {
      const sharpInstance = sharp(input.bytes);
      const result = await sharpInstance.negate().toBuffer();
      const metadata = await sharp(result).metadata();

      return {
        bytes: result,
        mime: input.mime,
        width: metadata.width,
        height: metadata.height,
        source: input.source,
      };
    } catch (error) {
      throw new TransformError(
        `Failed to negate image: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async normalize(input: ImageBlob): Promise<ImageBlob> {
    try {
      const sharpInstance = sharp(input.bytes);
      const result = await sharpInstance.normalize().toBuffer();
      const metadata = await sharp(result).metadata();

      return {
        bytes: result,
        mime: input.mime,
        width: metadata.width,
        height: metadata.height,
        source: input.source,
      };
    } catch (error) {
      throw new TransformError(
        `Failed to normalize image: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async threshold(input: ImageBlob, value?: number): Promise<ImageBlob> {
    try {
      const sharpInstance = sharp(input.bytes);
      const result = await sharpInstance.threshold(value).toBuffer();
      const metadata = await sharp(result).metadata();

      return {
        bytes: result,
        mime: input.mime,
        width: metadata.width,
        height: metadata.height,
        source: input.source,
      };
    } catch (error) {
      throw new TransformError(
        `Failed to threshold image: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async modulate(input: ImageBlob, opts: { brightness?: number; saturation?: number; hue?: number; lightness?: number }): Promise<ImageBlob> {
    try {
      const sharpInstance = sharp(input.bytes);
      const result = await sharpInstance.modulate(opts).toBuffer();
      const metadata = await sharp(result).metadata();

      return {
        bytes: result,
        mime: input.mime,
        width: metadata.width,
        height: metadata.height,
        source: input.source,
      };
    } catch (error) {
      throw new TransformError(
        `Failed to modulate image: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async tint(input: ImageBlob, color: string | { r: number; g: number; b: number }): Promise<ImageBlob> {
    try {
      const sharpInstance = sharp(input.bytes);
      const result = await sharpInstance.tint(color).toBuffer();
      const metadata = await sharp(result).metadata();

      return {
        bytes: result,
        mime: input.mime,
        width: metadata.width,
        height: metadata.height,
        source: input.source,
      };
    } catch (error) {
      throw new TransformError(
        `Failed to tint image: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  // ===== Border & Frame Operations =====

  async extend(input: ImageBlob, opts: { top: number; bottom: number; left: number; right: number; background?: string | { r: number; g: number; b: number; alpha?: number } }): Promise<ImageBlob> {
    try {
      const sharpInstance = sharp(input.bytes);
      const result = await sharpInstance.extend(opts).toBuffer();
      const metadata = await sharp(result).metadata();

      return {
        bytes: result,
        mime: input.mime,
        width: metadata.width,
        height: metadata.height,
        source: input.source,
      };
    } catch (error) {
      throw new TransformError(
        `Failed to extend image: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async extract(input: ImageBlob, region: { left: number; top: number; width: number; height: number }): Promise<ImageBlob> {
    try {
      const sharpInstance = sharp(input.bytes);
      const result = await sharpInstance.extract(region).toBuffer();
      const metadata = await sharp(result).metadata();

      return {
        bytes: result,
        mime: input.mime,
        width: metadata.width,
        height: metadata.height,
        source: input.source,
      };
    } catch (error) {
      throw new TransformError(
        `Failed to extract region: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async roundCorners(input: ImageBlob, radius: number): Promise<ImageBlob> {
    try {
      const sharpInstance = sharp(input.bytes);
      const metadata = await sharpInstance.metadata();
      const width = metadata.width || 100;
      const height = metadata.height || 100;

      // Create SVG mask for rounded corners
      const mask = Buffer.from(
        `<svg width="${width}" height="${height}">
          <rect x="0" y="0" width="${width}" height="${height}" rx="${radius}" ry="${radius}" fill="white"/>
        </svg>`
      );

      // Apply mask using composite
      const result = await sharpInstance
        .composite([
          {
            input: mask,
            blend: "dest-in",
          },
        ])
        .toBuffer();

      return {
        bytes: result,
        mime: input.mime === "image/svg+xml" ? "image/png" : input.mime,
        width,
        height,
        source: input.source,
      };
    } catch (error) {
      throw new TransformError(
        `Failed to round corners: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  // ===== Text Operations =====

  async addText(input: ImageBlob, options: Record<string, unknown>): Promise<ImageBlob> {
    return TextRenderer.addText(input, options as unknown as TextOptions);
  }

  async addCaption(input: ImageBlob, options: Record<string, unknown>): Promise<ImageBlob> {
    return TextRenderer.addCaption(input, options as unknown as CaptionOptions);
  }

  // ===== Preset Filters =====

  async preset(input: ImageBlob, presetName: string): Promise<ImageBlob> {
    return FilterPresets.applyPreset(input, presetName);
  }
}
