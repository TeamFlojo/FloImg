import type { ImageBlob } from "../../core/types.js";
import { SharpTransformProvider } from "./sharp.js";

/**
 * Preset filters built using Sharp's primitives
 */
export class FilterPresets {
  private static sharp = new SharpTransformProvider();

  /**
   * Apply vintage/retro filter
   */
  static async vintage(input: ImageBlob): Promise<ImageBlob> {
    // Reduce saturation and brightness, add warm tint
    const modulated = await this.sharp.modulate(input, {
      brightness: 0.9,
      saturation: 0.7,
    });
    return this.sharp.tint(modulated, { r: 255, g: 240, b: 200 });
  }

  /**
   * Apply vibrant/saturated filter
   */
  static async vibrant(input: ImageBlob): Promise<ImageBlob> {
    return this.sharp.modulate(input, {
      saturation: 1.5,
      brightness: 1.1,
    });
  }

  /**
   * Apply black and white filter with enhanced contrast
   */
  static async blackAndWhite(input: ImageBlob): Promise<ImageBlob> {
    const gray = await this.sharp.grayscale(input);
    return this.sharp.normalize(gray);
  }

  /**
   * Apply dramatic filter (high contrast, high saturation)
   */
  static async dramatic(input: ImageBlob): Promise<ImageBlob> {
    const sharpened = await this.sharp.sharpen(input, {});
    return this.sharp.modulate(sharpened, {
      saturation: 1.3,
      brightness: 0.9,
    });
  }

  /**
   * Apply soft/dreamy filter
   */
  static async soft(input: ImageBlob): Promise<ImageBlob> {
    const blurred = await this.sharp.blur(input, 1);
    return this.sharp.modulate(blurred, {
      brightness: 1.1,
    });
  }

  /**
   * Apply cool tone filter (blue tint)
   */
  static async cool(input: ImageBlob): Promise<ImageBlob> {
    return this.sharp.tint(input, { r: 200, g: 220, b: 255 });
  }

  /**
   * Apply warm tone filter (orange/red tint)
   */
  static async warm(input: ImageBlob): Promise<ImageBlob> {
    return this.sharp.tint(input, { r: 255, g: 220, b: 180 });
  }

  /**
   * Apply high contrast black and white
   */
  static async highContrast(input: ImageBlob): Promise<ImageBlob> {
    const gray = await this.sharp.grayscale(input);
    const normalized = await this.sharp.normalize(gray);
    return this.sharp.sharpen(normalized, {});
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
