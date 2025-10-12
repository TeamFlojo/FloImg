import { createCanvas, loadImage, GlobalFonts } from "@napi-rs/canvas";
import sharp from "sharp";
import type { ImageBlob } from "../../core/types.js";
import { TransformError } from "../../core/errors.js";

export interface TextOptions {
  text: string;
  x: number;
  y: number;
  font?: string;
  size?: number;
  color?: string;
  align?: "left" | "center" | "right";
  maxWidth?: number;
  shadow?: boolean;
  stroke?: {
    color: string;
    width: number;
  };
}

export interface CaptionOptions {
  text: string;
  position: "top" | "bottom";
  backgroundColor?: string;
  textColor?: string;
  fontSize?: number;
  padding?: number;
}

/**
 * Helper functions for text rendering using @napi-rs/canvas
 */
export class TextRenderer {
  /**
   * Add text to an image
   */
  static async addText(input: ImageBlob, options: TextOptions): Promise<ImageBlob> {
    try {
      // Convert input image to PNG if needed
      let imageBuffer = input.bytes;
      if (input.mime !== "image/png") {
        imageBuffer = await sharp(input.bytes).png().toBuffer();
      }

      // Get image metadata
      const metadata = await sharp(imageBuffer).metadata();
      const width = metadata.width || 800;
      const height = metadata.height || 600;

      // Load the image into canvas
      const image = await loadImage(imageBuffer);
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      // Draw original image
      ctx.drawImage(image, 0, 0, width, height);

      // Configure text style
      const fontSize = options.size || 24;
      const fontFamily = options.font || "Arial";
      ctx.font = `${fontSize}px ${fontFamily}`;
      ctx.fillStyle = options.color || "#000000";
      ctx.textAlign = options.align || "left";

      // Add text shadow if requested
      if (options.shadow) {
        ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
      }

      // Add text stroke if requested
      if (options.stroke) {
        ctx.strokeStyle = options.stroke.color;
        ctx.lineWidth = options.stroke.width;
        ctx.strokeText(options.text, options.x, options.y, options.maxWidth);
      }

      // Draw text
      ctx.fillText(options.text, options.x, options.y, options.maxWidth);

      // Convert canvas to buffer
      const resultBuffer = canvas.toBuffer("image/png");

      return {
        bytes: resultBuffer,
        mime: "image/png",
        width,
        height,
        source: input.source,
      };
    } catch (error) {
      throw new TransformError(
        `Failed to add text to image: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Add caption bar to image (top or bottom)
   */
  static async addCaption(input: ImageBlob, options: CaptionOptions): Promise<ImageBlob> {
    try {
      // Convert input image to PNG if needed
      let imageBuffer = input.bytes;
      if (input.mime !== "image/png") {
        imageBuffer = await sharp(input.bytes).png().toBuffer();
      }

      // Get image metadata
      const metadata = await sharp(imageBuffer).metadata();
      const imageWidth = metadata.width || 800;
      const imageHeight = metadata.height || 600;

      // Calculate caption bar height
      const fontSize = options.fontSize || 32;
      const padding = options.padding || 20;
      const captionHeight = fontSize + padding * 2;

      // Create canvas with extra height for caption
      const canvasHeight = imageHeight + captionHeight;
      const canvas = createCanvas(imageWidth, canvasHeight);
      const ctx = canvas.getContext("2d");

      // Load the image
      const image = await loadImage(imageBuffer);

      // Determine positions based on caption position
      const imageY = options.position === "top" ? captionHeight : 0;
      const captionY = options.position === "top" ? 0 : imageHeight;

      // Draw original image
      ctx.drawImage(image, 0, imageY, imageWidth, imageHeight);

      // Draw caption bar background
      ctx.fillStyle = options.backgroundColor || "rgba(0, 0, 0, 0.8)";
      ctx.fillRect(0, captionY, imageWidth, captionHeight);

      // Draw caption text
      ctx.fillStyle = options.textColor || "#ffffff";
      ctx.font = `${fontSize}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(options.text, imageWidth / 2, captionY + captionHeight / 2);

      // Convert canvas to buffer
      const resultBuffer = canvas.toBuffer("image/png");

      return {
        bytes: resultBuffer,
        mime: "image/png",
        width: imageWidth,
        height: canvasHeight,
        source: input.source,
      };
    } catch (error) {
      throw new TransformError(
        `Failed to add caption to image: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}
