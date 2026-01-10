/**
 * xAI Grok text and vision providers for floimg
 *
 * Uses the OpenAI SDK with xAI's OpenAI-compatible API endpoint.
 * Supports structured JSON outputs via response_format.
 */

import OpenAI from "openai";
import type {
  DataBlob,
  ImageBlob,
  TextProvider,
  TextProviderSchema,
  VisionProvider,
  VisionProviderSchema,
  UsageHooks,
} from "@teamflojo/floimg";

// ============================================================================
// Grok Text Provider
// ============================================================================

export interface GrokTextConfig {
  /** xAI API key (defaults to XAI_API_KEY env var) */
  apiKey?: string;
  /** Model to use (default: grok-2) */
  model?: "grok-2" | "grok-3-beta";
  /** Maximum tokens in response */
  maxTokens?: number;
  /** Temperature for response creativity (0-2) */
  temperature?: number;
  /** Optional usage tracking hooks for cost attribution */
  hooks?: UsageHooks;
}

export interface GrokTextParams {
  /** The prompt for text generation */
  prompt: string;
  /** Optional system prompt to guide model behavior */
  systemPrompt?: string;
  /** Optional context from previous step (e.g., vision analysis) */
  context?: string;
  /** Output format: text or structured JSON */
  outputFormat?: "text" | "json";
  /** JSON schema for structured output (when outputFormat is "json") */
  jsonSchema?: Record<string, unknown>;
  /** Maximum tokens in response */
  maxTokens?: number;
  /** Temperature (0-2) */
  temperature?: number;
  /** Per-request API key override */
  apiKey?: string;
}

/**
 * Schema for the Grok Text provider
 */
export const grokTextSchema: TextProviderSchema = {
  name: "grok-text",
  description: "Generate text using xAI's Grok models with structured output support",
  category: "Cloud",
  parameters: {
    prompt: {
      type: "string",
      title: "Prompt",
      description: "The prompt for text generation",
    },
    systemPrompt: {
      type: "string",
      title: "System Prompt",
      description: "Optional system prompt to guide the model's behavior",
    },
    context: {
      type: "string",
      title: "Context",
      description: "Optional context from a previous step (e.g., vision analysis)",
    },
    outputFormat: {
      type: "string",
      title: "Output Format",
      description: "Response format: plain text or structured JSON",
      enum: ["text", "json"],
      default: "text",
    },
    maxTokens: {
      type: "number",
      title: "Max Tokens",
      description: "Maximum tokens in the response",
      default: 1000,
    },
    temperature: {
      type: "number",
      title: "Temperature",
      description: "Creativity level (0-2)",
      default: 0.7,
      minimum: 0,
      maximum: 2,
    },
    apiKey: {
      type: "string",
      title: "API Key",
      description: "Your xAI API key (optional - uses server key if not provided)",
    },
  },
  requiredParameters: ["prompt"],
  requiresApiKey: true,
  outputType: "data",
};

/**
 * Create a Grok Text provider for text generation
 *
 * Uses xAI's OpenAI-compatible API with structured output support.
 *
 * @example
 * ```typescript
 * import createClient from '@teamflojo/floimg';
 * import { grokText } from '@teamflojo/floimg-xai';
 *
 * const floimg = createClient();
 * floimg.registerTextProvider(grokText({ apiKey: process.env.XAI_API_KEY }));
 *
 * const result = await floimg.text({
 *   provider: 'grok-text',
 *   params: {
 *     prompt: 'Generate 5 creative image prompts for a fantasy landscape',
 *     outputFormat: 'json',
 *   }
 * });
 * ```
 */
export function grokText(config: GrokTextConfig = {}): TextProvider {
  // Config API key is optional - user can provide per-request
  const configApiKey = config.apiKey || process.env.XAI_API_KEY;

  const createClient = (apiKey: string) =>
    new OpenAI({
      apiKey,
      baseURL: "https://api.x.ai/v1",
    });

  return {
    name: "grok-text",
    schema: grokTextSchema,

    async generate(params: Record<string, unknown>): Promise<DataBlob> {
      const {
        prompt,
        systemPrompt,
        context,
        outputFormat = "text",
        jsonSchema,
        maxTokens = config.maxTokens || 1000,
        temperature = config.temperature || 0.7,
        apiKey: paramApiKey,
      } = params as Partial<GrokTextParams>;

      if (!prompt) {
        throw new Error("prompt is required for Grok text generation");
      }

      // Use per-request API key if provided, otherwise use config key
      const apiKey = paramApiKey || configApiKey;
      if (!apiKey) {
        throw new Error(
          "xAI API key is required. Set XAI_API_KEY environment variable, pass apiKey in config, or provide it in params."
        );
      }

      const client = createClient(apiKey);
      const model = config.model || "grok-2";

      // Build system message
      let system = systemPrompt || "You are a helpful assistant.";
      if (outputFormat === "json" && !jsonSchema) {
        system += " Always respond with valid JSON.";
      }

      // Build user message with optional context
      let userMessage = prompt;
      if (context) {
        userMessage = `Context from previous analysis:\n${context}\n\n${prompt}`;
      }

      // Build request options
      const requestOptions: OpenAI.Chat.ChatCompletionCreateParams = {
        model,
        max_tokens: maxTokens,
        temperature,
        messages: [
          { role: "system", content: system },
          { role: "user", content: userMessage },
        ],
      };

      // Add structured output if JSON schema is provided
      if (outputFormat === "json" && jsonSchema) {
        // Use type assertion for xAI's structured output format
        (requestOptions as unknown as Record<string, unknown>).response_format = {
          type: "json_schema",
          json_schema: jsonSchema,
        };
      } else if (outputFormat === "json") {
        requestOptions.response_format = { type: "json_object" };
      }

      const response = await client.chat.completions.create(requestOptions);
      const content = response.choices[0]?.message?.content || "";

      // Try to parse JSON if requested
      let parsed: Record<string, unknown> | undefined;
      if (outputFormat === "json") {
        try {
          parsed = JSON.parse(content);
        } catch {
          // If JSON parsing fails, treat as text
        }
      }

      // Emit usage event for cost tracking
      if (config.hooks?.onUsage) {
        await config.hooks.onUsage({
          provider: "xai",
          model,
          operation: "text",
          inputTokens: response.usage?.prompt_tokens,
          outputTokens: response.usage?.completion_tokens,
          rawMetadata: {
            usage: response.usage,
          },
        });
      }

      return {
        type: parsed ? "json" : "text",
        content,
        parsed,
        source: `ai:grok-text:${model}`,
        metadata: {
          model,
          prompt,
          temperature,
          usage: response.usage,
        },
      };
    },
  };
}

// ============================================================================
// Grok Vision Provider
// ============================================================================

export interface GrokVisionConfig {
  /** xAI API key (defaults to XAI_API_KEY env var) */
  apiKey?: string;
  /** Model to use (default: grok-2-vision) */
  model?: "grok-2-vision" | "grok-2-vision-1212";
  /** Maximum tokens in response */
  maxTokens?: number;
  /** Optional usage tracking hooks for cost attribution */
  hooks?: UsageHooks;
}

export interface GrokVisionParams {
  /** What to analyze or ask about the image */
  prompt?: string;
  /** Output format: text or structured JSON */
  outputFormat?: "text" | "json";
  /** JSON schema for structured output (when outputFormat is "json") */
  jsonSchema?: Record<string, unknown>;
  /** Maximum tokens in response */
  maxTokens?: number;
  /** Per-request API key override */
  apiKey?: string;
}

/**
 * Schema for the Grok Vision provider
 */
export const grokVisionSchema: VisionProviderSchema = {
  name: "grok-vision",
  description: "Analyze images using xAI's Grok Vision models with structured output support",
  category: "Cloud",
  parameters: {
    prompt: {
      type: "string",
      title: "Prompt",
      description: "What to analyze or ask about the image",
      default: "Describe this image in detail.",
    },
    outputFormat: {
      type: "string",
      title: "Output Format",
      description: "Response format: plain text or structured JSON",
      enum: ["text", "json"],
      default: "text",
    },
    maxTokens: {
      type: "number",
      title: "Max Tokens",
      description: "Maximum tokens in the response",
      default: 1000,
    },
    apiKey: {
      type: "string",
      title: "API Key",
      description: "Your xAI API key (optional - uses server key if not provided)",
    },
  },
  outputFormats: ["text", "json"],
  requiresApiKey: true,
  inputType: "image",
  outputType: "data",
};

/**
 * Create a Grok Vision provider for image analysis
 *
 * Uses xAI's OpenAI-compatible API with structured output support.
 *
 * @example
 * ```typescript
 * import createClient from '@teamflojo/floimg';
 * import { grokVision } from '@teamflojo/floimg-xai';
 *
 * const floimg = createClient();
 * floimg.registerVisionProvider(grokVision({ apiKey: process.env.XAI_API_KEY }));
 *
 * const result = await floimg.vision({
 *   provider: 'grok-vision',
 *   blob: imageBlob,
 *   params: {
 *     prompt: 'What objects are in this image?',
 *     outputFormat: 'json',
 *   }
 * });
 * ```
 */
export function grokVision(config: GrokVisionConfig = {}): VisionProvider {
  // Config API key is optional - user can provide per-request
  const configApiKey = config.apiKey || process.env.XAI_API_KEY;

  const createClient = (apiKey: string) =>
    new OpenAI({
      apiKey,
      baseURL: "https://api.x.ai/v1",
    });

  return {
    name: "grok-vision",
    schema: grokVisionSchema,

    async analyze(input: ImageBlob, params: Record<string, unknown>): Promise<DataBlob> {
      const {
        prompt = "Describe this image in detail.",
        outputFormat = "text",
        jsonSchema,
        maxTokens = config.maxTokens || 1000,
        apiKey: paramApiKey,
      } = params as Partial<GrokVisionParams>;

      // Use per-request API key if provided, otherwise use config key
      const apiKey = paramApiKey || configApiKey;
      if (!apiKey) {
        throw new Error(
          "xAI API key is required. Set XAI_API_KEY environment variable, pass apiKey in config, or provide it in params."
        );
      }

      const client = createClient(apiKey);
      const model = config.model || "grok-2-vision";

      // Convert image to base64 data URL
      const base64 = input.bytes.toString("base64");
      const dataUrl = `data:${input.mime};base64,${base64}`;

      // Build system prompt
      const systemPrompt =
        outputFormat === "json" && !jsonSchema
          ? "You are a helpful assistant that analyzes images. Always respond with valid JSON."
          : "You are a helpful assistant that analyzes images.";

      // Build request options
      const requestOptions: OpenAI.Chat.ChatCompletionCreateParams = {
        model,
        max_tokens: maxTokens,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: { url: dataUrl },
              },
            ],
          },
        ],
      };

      // Add structured output if JSON schema is provided
      if (outputFormat === "json" && jsonSchema) {
        // Use type assertion for xAI's structured output format
        (requestOptions as unknown as Record<string, unknown>).response_format = {
          type: "json_schema",
          json_schema: jsonSchema,
        };
      } else if (outputFormat === "json") {
        requestOptions.response_format = { type: "json_object" };
      }

      const response = await client.chat.completions.create(requestOptions);
      const content = response.choices[0]?.message?.content || "";

      // Try to parse JSON if requested
      let parsed: Record<string, unknown> | undefined;
      if (outputFormat === "json") {
        try {
          parsed = JSON.parse(content);
        } catch {
          // If JSON parsing fails, treat as text
        }
      }

      // Emit usage event for cost tracking
      if (config.hooks?.onUsage) {
        await config.hooks.onUsage({
          provider: "xai",
          model,
          operation: "vision",
          inputTokens: response.usage?.prompt_tokens,
          outputTokens: response.usage?.completion_tokens,
          rawMetadata: {
            usage: response.usage,
          },
        });
      }

      return {
        type: parsed ? "json" : "text",
        content,
        parsed,
        source: `ai:grok-vision:${model}`,
        metadata: {
          model,
          prompt,
          usage: response.usage,
        },
      };
    },
  };
}

// Named exports
export { grokText as default };
