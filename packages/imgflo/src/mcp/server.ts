#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import createClient from "../index.js";
import { loadConfig } from "../config/loader.js";
import { ImgfloError } from "../core/errors.js";
import type { MimeType } from "../core/types.js";

/**
 * imgflo MCP Server - Smart Image Generation Router
 *
 * Provides intelligent routing to appropriate image generators based on intent.
 * Auto-discovers and loads available plugins (quickchart, d3, mermaid, qr, screenshot).
 */

// Plugin auto-discovery
async function loadAvailablePlugins(client: any): Promise<string[]> {
  const plugins: string[] = [];

  console.error('[imgflo-mcp] Starting plugin discovery...');

  // Try to load each plugin
  const potentialPlugins = [
    { name: 'quickchart', module: 'imgflo-quickchart' },
    { name: 'd3', module: 'imgflo-d3' },
    { name: 'mermaid', module: 'imgflo-mermaid' },
    { name: 'qr', module: 'imgflo-qr' },
    { name: 'screenshot', module: 'imgflo-screenshot' },
  ];

  for (const { name, module } of potentialPlugins) {
    try {
      console.error(`[imgflo-mcp] Attempting to load ${module}...`);
      const plugin = await import(module);

      if (!plugin.default) {
        console.error(`[imgflo-mcp] ⚠ ${module} has no default export`);
        continue;
      }

      const generator = typeof plugin.default === 'function'
        ? plugin.default()
        : plugin.default;

      client.registerGenerator(generator);
      plugins.push(name);
      console.error(`[imgflo-mcp] ✓ Loaded plugin: ${name}`);
    } catch (err) {
      const error = err as Error;
      console.error(`[imgflo-mcp] ✗ Failed to load ${module}: ${error.message}`);
    }
  }

  console.error(`[imgflo-mcp] Plugin discovery complete. Loaded: ${plugins.join(', ') || 'none'}`);

  if (plugins.length === 0) {
    console.error('[imgflo-mcp] ⚠ No generator plugins found!');
    console.error('[imgflo-mcp] Install with: npm install -g imgflo-quickchart imgflo-mermaid imgflo-qr imgflo-d3 imgflo-screenshot');
    console.error('[imgflo-mcp] Only built-in generators (shapes, openai) will be available.');
  }

  return plugins;
}

// Smart generator selection based on intent
function selectGenerator(intent: string, params: any): string {
  const intentLower = intent.toLowerCase();

  // QR codes
  if (intentLower.includes('qr') || intentLower.includes('barcode')) {
    return 'qr';
  }

  // Screenshots
  if (intentLower.includes('screenshot') || intentLower.includes('capture') ||
      intentLower.includes('website') || intentLower.includes('webpage') ||
      intentLower.includes('url') && params.url) {
    return 'screenshot';
  }

  // Diagrams (Mermaid)
  if (intentLower.includes('flowchart') || intentLower.includes('diagram') ||
      intentLower.includes('sequence') || intentLower.includes('gantt') ||
      intentLower.includes('class diagram') || intentLower.includes('entity') ||
      intentLower.includes('state') || intentLower.includes('mindmap')) {
    return 'mermaid';
  }

  // Charts & Data Visualization
  if (intentLower.includes('chart') || intentLower.includes('graph') ||
      intentLower.includes('plot') || intentLower.includes('visualiz')) {

    // D3 for custom/complex visualizations
    if (params.render || params.renderString ||
        intentLower.includes('custom') || intentLower.includes('d3')) {
      return 'd3';
    }

    // QuickChart for standard charts
    return 'quickchart';
  }

  // OpenAI for image generation
  if (intentLower.includes('generate') || intentLower.includes('create') ||
      intentLower.includes('dall-e') || intentLower.includes('ai image')) {
    if (params.prompt) {
      return 'openai';
    }
  }

  // Default to shapes for simple SVG graphics
  return 'shapes';
}

// Initialize server
const server = new Server(
  {
    name: "imgflo",
    version: "0.3.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define available tools
const TOOLS: Tool[] = [
  {
    name: "generate_image",
    description:
      "Generate any type of image based on natural language intent. " +
      "Supports: charts (bar, line, pie, scatter), diagrams (flowcharts, sequence, gantt), " +
      "QR codes, screenshots, data visualizations (D3), AI images (DALL-E), and simple shapes/gradients. " +
      "The system automatically selects the best generator based on your intent. " +
      "Images are automatically saved to avoid MCP size limits. Returns the saved image location.",
    inputSchema: {
      type: "object",
      properties: {
        intent: {
          type: "string",
          description:
            "What you want to create (e.g., 'bar chart showing quarterly revenue', " +
            "'QR code for https://example.com', 'flowchart of authentication process', " +
            "'screenshot of https://example.com')",
        },
        params: {
          type: "object",
          description:
            "Parameters for the generator. Common params: width, height, data, colors. " +
            "For charts: {type: 'bar'|'line'|'pie', data: {...}}. " +
            "For QR: {text: 'content'}. " +
            "For diagrams: {code: 'mermaid syntax'}. " +
            "For screenshots: {url: 'https://...'}. " +
            "For D3: {render: function, data: [...]}. " +
            "For shapes: {type: 'gradient'|'circle'|'rectangle'}. " +
            "For AI: {prompt: 'description'}",
          default: {},
        },
        destination: {
          type: "string",
          description:
            "Where to save the image. Supports file paths (./output.png), S3 URIs (s3://bucket/key.png), " +
            "or auto-generated path if not specified. Default: generated/timestamp-generator.ext",
        },
      },
      required: ["intent"],
    },
  },
  {
    name: "transform_image",
    description:
      "Transform an image with filters, effects, text, and more. " +
      "Supports: format conversion, resize, filters (blur, sharpen, grayscale, etc.), " +
      "effects (modulate, tint, negate), borders (extend, roundCorners), text (addText, addCaption), " +
      "and preset filters (vintage, vibrant, blackAndWhite, dramatic, soft, cool, warm). " +
      "Can optionally auto-save for large transformations by providing a destination.",
    inputSchema: {
      type: "object",
      properties: {
        imageBytes: {
          type: "string",
          description: "Base64-encoded image bytes",
        },
        mime: {
          type: "string",
          description: "MIME type of input image (e.g., 'image/svg+xml')",
        },
        operation: {
          type: "string",
          description:
            "Transform operation: convert, resize, composite, optimizeSvg, " +
            "blur, sharpen, grayscale, negate, normalize, threshold, modulate, tint, " +
            "extend, extract, roundCorners, addText, addCaption, preset",
          enum: [
            "convert",
            "resize",
            "composite",
            "optimizeSvg",
            "blur",
            "sharpen",
            "grayscale",
            "negate",
            "normalize",
            "threshold",
            "modulate",
            "tint",
            "extend",
            "extract",
            "roundCorners",
            "addText",
            "addCaption",
            "preset",
          ],
        },
        params: {
          type: "object",
          description:
            "Parameters for the operation. Examples: " +
            "blur: {sigma: 5}, " +
            "modulate: {brightness: 1.2, saturation: 1.3}, " +
            "tint: {r: 255, g: 240, b: 200}, " +
            "extend: {top: 20, bottom: 20, left: 20, right: 20, background: '#fff'}, " +
            "roundCorners: {radius: 20}, " +
            "addText: {text: 'Hello', x: 100, y: 100, size: 48, color: '#fff', shadow: true}, " +
            "addCaption: {text: 'Caption', position: 'bottom'}, " +
            "preset: {name: 'vintage' | 'vibrant' | 'blackAndWhite' | 'dramatic' | 'soft' | 'cool' | 'warm'}",
        },
        to: {
          type: "string",
          description: "Target MIME type for convert operation (e.g., 'image/png', 'image/jpeg')",
        },
        width: {
          type: "number",
          description: "Target width for resize operation",
        },
        height: {
          type: "number",
          description: "Target height for resize operation",
        },
        destination: {
          type: "string",
          description:
            "Optional: Where to save the transformed image. If provided, returns saved location instead of bytes. " +
            "Useful for large transformations to avoid MCP size limits.",
        },
      },
      required: ["imageBytes", "mime", "operation"],
    },
  },
  {
    name: "save_image",
    description:
      "Save an image to filesystem or cloud storage. " +
      "Supports smart destination routing: use file paths (./output.png), S3 URIs (s3://bucket/key), " +
      "or specify provider explicitly. Filesystem is default for zero-config usage.",
    inputSchema: {
      type: "object",
      properties: {
        imageBytes: {
          type: "string",
          description: "Base64-encoded image bytes",
        },
        mime: {
          type: "string",
          description: "MIME type of the image (e.g., 'image/png')",
        },
        destination: {
          type: "string",
          description: "Destination path or URI (e.g., './output.png', 's3://bucket/key.png', or just 'output.png')",
        },
        provider: {
          type: "string",
          description: "Storage provider to use (e.g., 's3', 'fs'). Auto-detected from destination if not specified.",
        },
      },
      required: ["imageBytes", "mime", "destination"],
    },
  },
];

// List tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: TOOLS };
});

// Call tool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    // Load configuration
    const config = await loadConfig();
    const client = createClient(config);

    // Load available plugins
    const availablePlugins = await loadAvailablePlugins(client);
    console.error(`[imgflo-mcp] Available generators: shapes, openai, ${availablePlugins.join(', ')}`);

    switch (name) {
      case "generate_image": {
        const { intent, params = {}, destination } = args as {
          intent: string;
          params?: Record<string, unknown>;
          destination?: string;
        };

        if (!intent) {
          throw new Error("'intent' parameter is required");
        }

        // Smart generator selection
        const generator = selectGenerator(intent, params);
        console.error(`[imgflo-mcp] Intent: "${intent}" → Generator: ${generator}`);

        const blob = await client.generate({
          generator,
          params,
        });

        // Auto-save to avoid MCP size limit
        // Default destination: generated/timestamp-generator.ext
        const getExtension = (mime: MimeType) => {
          const map: Record<MimeType, string> = {
            'image/svg+xml': 'svg',
            'image/png': 'png',
            'image/jpeg': 'jpg',
            'image/webp': 'webp',
            'image/avif': 'avif',
          };
          return map[mime] || 'png';
        };

        const defaultDestination = destination ||
          `generated/${Date.now()}-${generator}.${getExtension(blob.mime)}`;

        const result = await client.save(blob, defaultDestination);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                generator, // Tell user which generator was used
                image: {
                  location: result.location,
                  provider: result.provider,
                  mime: result.mime,
                  width: blob.width,
                  height: blob.height,
                  size: result.size,
                },
              }),
            },
          ],
        };
      }

      case "transform_image": {
        const { imageBytes, mime, operation, params = {}, to, width, height, destination } = args as {
          imageBytes: string;
          mime: string;
          operation: string;
          params?: Record<string, unknown>;
          to?: string;
          width?: number;
          height?: number;
          destination?: string;
        };

        const inputBlob = {
          bytes: Buffer.from(imageBytes, "base64"),
          mime: mime as MimeType,
        };

        let blob;

        // Handle special cases that need specific parameters
        if (operation === "convert") {
          if (!to) throw new Error("'to' parameter required for convert operation");
          blob = await client.transform({
            blob: inputBlob,
            op: "convert",
            to: to as MimeType,
            params,
          });
        } else if (operation === "resize") {
          if (!width && !height) throw new Error("'width' or 'height' required for resize");
          blob = await client.transform({
            blob: inputBlob,
            op: "resize",
            params: { width, height, ...params },
          });
        } else {
          // All other operations use the generic params approach
          blob = await client.transform({
            blob: inputBlob,
            op: operation as any,
            params,
          });
        }

        // If destination provided, auto-save (useful for large transformations)
        if (destination) {
          const result = await client.save(blob, destination);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  success: true,
                  image: {
                    location: result.location,
                    provider: result.provider,
                    mime: result.mime,
                    width: blob.width,
                    height: blob.height,
                    size: result.size,
                  },
                }),
              },
            ],
          };
        }

        // Otherwise return bytes (for small transformations or when further processing needed)
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                blob: {
                  bytes: blob.bytes.toString("base64"),
                  mime: blob.mime,
                  width: blob.width,
                  height: blob.height,
                },
              }),
            },
          ],
        };
      }

      case "save_image": {
        const { imageBytes, mime, destination, provider } = args as {
          imageBytes: string;
          mime: string;
          destination: string;
          provider?: string;
        };

        const inputBlob = {
          bytes: Buffer.from(imageBytes, "base64"),
          mime: mime as MimeType,
        };

        const result = await client.save(
          inputBlob,
          provider ? { path: destination, provider } : destination
        );

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                provider: result.provider,
                location: result.location,
                size: result.size,
                mime: result.mime,
              }),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const errorType = error instanceof ImgfloError ? error.name : "Error";

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            success: false,
            error: errorType,
            message,
          }),
        },
      ],
      isError: true,
    };
  }
});

// Start server with stdio transport
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Log to stderr (stdout is used for MCP communication)
  console.error("imgflo MCP server running on stdio");
  console.error("Smart routing enabled - will auto-select best generator based on intent");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
