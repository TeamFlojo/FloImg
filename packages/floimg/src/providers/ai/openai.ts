import OpenAI from "openai";
import type { ImageGenerator, ImageBlob, GeneratorSchema } from "../../core/types.js";
import { ProviderNotFoundError } from "../../core/errors.js";

export interface OpenAIConfig {
  apiKey?: string;
  model?: "dall-e-2" | "dall-e-3";
  quality?: "standard" | "hd";
  style?: "vivid" | "natural";
}

export interface OpenAIGenerateParams {
  prompt: string;
  model?: "dall-e-2" | "dall-e-3";
  size?: "256x256" | "512x512" | "1024x1024" | "1024x1792" | "1792x1024";
  quality?: "standard" | "hd";
  style?: "vivid" | "natural";
  n?: number;
}

/**
 * Schema for the OpenAI generator
 */
export const openaiSchema: GeneratorSchema = {
  name: "openai",
  description: "Generate images using OpenAI's DALL-E models",
  category: "AI",
  parameters: {
    prompt: {
      type: "string",
      title: "Prompt",
      description: "Describe the image you want to generate",
    },
    model: {
      type: "string",
      title: "Model",
      description: "DALL-E model to use",
      enum: ["dall-e-2", "dall-e-3"],
      default: "dall-e-3",
    },
    size: {
      type: "string",
      title: "Size",
      description: "Image dimensions",
      enum: ["256x256", "512x512", "1024x1024", "1024x1792", "1792x1024"],
      default: "1024x1024",
    },
    quality: {
      type: "string",
      title: "Quality",
      description: "Image quality (DALL-E 3 only)",
      enum: ["standard", "hd"],
      default: "standard",
    },
    style: {
      type: "string",
      title: "Style",
      description: "Image style (DALL-E 3 only)",
      enum: ["vivid", "natural"],
      default: "vivid",
    },
  },
  requiredParameters: ["prompt"],
};

/**
 * OpenAI DALL-E image generator
 *
 * Generates images using OpenAI's DALL-E models (DALL-E 2 or DALL-E 3).
 *
 * @example
 * ```typescript
 * const generator = new OpenAIGenerator({ apiKey: process.env.OPENAI_API_KEY });
 * const image = await generator.generate({
 *   prompt: "A purple gradient background for a presentation slide",
 *   model: "dall-e-3",
 *   size: "1792x1024",
 *   quality: "hd"
 * });
 * ```
 */
export class OpenAIGenerator implements ImageGenerator {
  public readonly name = "openai";
  public readonly schema = openaiSchema;
  private client: OpenAI;
  private config: OpenAIConfig;

  constructor(config: OpenAIConfig = {}) {
    this.config = config;

    const apiKey = config.apiKey || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "OpenAI API key is required. Set OPENAI_API_KEY environment variable or pass apiKey in config."
      );
    }

    this.client = new OpenAI({ apiKey });
  }

  async generate(params: Record<string, unknown>): Promise<ImageBlob> {
    const {
      prompt,
      model = this.config.model || "dall-e-3",
      size = "1024x1024",
      quality = this.config.quality || "standard",
      style = this.config.style || "vivid",
      n = 1,
    } = params as Partial<OpenAIGenerateParams>;

    if (!prompt) {
      throw new Error("prompt is required for OpenAI image generation");
    }

    // DALL-E 3 only supports n=1
    if (model === "dall-e-3" && n !== 1) {
      throw new Error("DALL-E 3 only supports generating 1 image at a time (n=1)");
    }

    // DALL-E 3 has specific size constraints
    if (model === "dall-e-3") {
      const validSizes = ["1024x1024", "1024x1792", "1792x1024"];
      if (!validSizes.includes(size)) {
        throw new Error(
          `DALL-E 3 only supports sizes: ${validSizes.join(", ")}. Got: ${size}`
        );
      }
    }

    // Generate image
    const response = await this.client.images.generate({
      model,
      prompt,
      size: size as "1024x1024" | "1792x1024" | "1024x1792",
      quality: model === "dall-e-3" ? quality : undefined,
      style: model === "dall-e-3" ? style : undefined,
      n,
      response_format: "url", // Get URL first, then download
    });

    if (!response.data || response.data.length === 0) {
      throw new Error("No image data returned from OpenAI");
    }

    const imageUrl = response.data[0].url;
    if (!imageUrl) {
      throw new Error("No image URL returned from OpenAI");
    }

    // Download the image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to download image: ${imageResponse.statusText}`);
    }

    const arrayBuffer = await imageResponse.arrayBuffer();
    const bytes = Buffer.from(arrayBuffer);

    // Parse dimensions from size parameter
    const [width, height] = size.split("x").map(Number);

    return {
      bytes,
      mime: "image/png", // OpenAI always returns PNG
      width,
      height,
      source: `ai:openai:${model}`,
      metadata: {
        prompt,
        model,
        quality,
        style,
        revisedPrompt: response.data[0].revised_prompt,
      },
    };
  }
}
