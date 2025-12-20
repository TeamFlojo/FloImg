import sharp from "sharp";
import type { ImageBlob } from "../../core/types.js";
import { TransformError } from "../../core/errors.js";

/**
 * Preset filters built using Sharp's primitives
 * These methods directly use Sharp to avoid circular dependencies
 */
export class FilterPresets {

  /**
   * Apply vintage/retro filter
   */
  static async vintage(input: ImageBlob): Promise<ImageBlob> {
    try {
      // Reduce saturation and brightness, add warm tint
      const modulated = await sharp(input.bytes)
        .modulate({ brightness: 0.9, saturation: 0.7 })
        .tint({ r: 255, g: 240, b: 200 })
        .toBuffer();

      const metadata = await sharp(modulated).metadata();
      return {
        bytes: modulated,
        mime: input.mime,
        width: metadata.width,
        height: metadata.height,
        source: input.source,
      };
    } catch (error) {
      throw new TransformError(
        `Failed to apply vintage filter: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Apply vibrant/saturated filter
   */
  static async vibrant(input: ImageBlob): Promise<ImageBlob> {
    try {
      const result = await sharp(input.bytes)
        .modulate({ saturation: 1.5, brightness: 1.1 })
        .toBuffer();

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
        `Failed to apply vibrant filter: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Apply black and white filter with enhanced contrast
   */
  static async blackAndWhite(input: ImageBlob): Promise<ImageBlob> {
    try {
      const result = await sharp(input.bytes)
        .grayscale()
        .normalize()
        .toBuffer();

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
        `Failed to apply black and white filter: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Apply dramatic filter (high contrast, high saturation)
   */
  static async dramatic(input: ImageBlob): Promise<ImageBlob> {
    try {
      const result = await sharp(input.bytes)
        .sharpen()
        .modulate({ saturation: 1.3, brightness: 0.9 })
        .toBuffer();

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
        `Failed to apply dramatic filter: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Apply soft/dreamy filter
   */
  static async soft(input: ImageBlob): Promise<ImageBlob> {
    try {
      const result = await sharp(input.bytes)
        .blur(1)
        .modulate({ brightness: 1.1 })
        .toBuffer();

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
        `Failed to apply soft filter: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Apply cool tone filter (blue tint)
   */
  static async cool(input: ImageBlob): Promise<ImageBlob> {
    try {
      const result = await sharp(input.bytes)
        .tint({ r: 200, g: 220, b: 255 })
        .toBuffer();

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
        `Failed to apply cool filter: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Apply warm tone filter (orange/red tint)
   */
  static async warm(input: ImageBlob): Promise<ImageBlob> {
    try {
      const result = await sharp(input.bytes)
        .tint({ r: 255, g: 220, b: 180 })
        .toBuffer();

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
        `Failed to apply warm filter: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Apply high contrast black and white
   */
  static async highContrast(input: ImageBlob): Promise<ImageBlob> {
    try {
      const result = await sharp(input.bytes)
        .grayscale()
        .normalize()
        .sharpen()
        .toBuffer();

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
        `Failed to apply high contrast filter: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Get a preset filter by name
   */
  static async applyPreset(input: ImageBlob, presetName: string): Promise<ImageBlob> {
    const presets: Record<string, (input: ImageBlob) => Promise<ImageBlob>> = {
      vintage: this.vintage.bind(this),
      vibrant: this.vibrant.bind(this),
      blackAndWhite: this.blackAndWhite.bind(this),
      bw: this.blackAndWhite.bind(this), // Alias
      dramatic: this.dramatic.bind(this),
      soft: this.soft.bind(this),
      cool: this.cool.bind(this),
      warm: this.warm.bind(this),
      highContrast: this.highContrast.bind(this),
    };

    const preset = presets[presetName];
    if (!preset) {
      throw new Error(
        `Unknown preset: ${presetName}. Available: ${Object.keys(presets).join(", ")}`
      );
    }

    return preset(input);
  }
}
