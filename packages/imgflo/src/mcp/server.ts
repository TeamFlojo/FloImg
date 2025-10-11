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
 * imgflo MCP Server
 *
 * Provides image generation, transformation, and upload capabilities
 * to MCP clients like Claude Code via stdio transport.
 */

// Initialize server
const server = new Server(
  {
    name: "imgflo",
    version: "0.1.0",
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
      "Generate an image using a specified generator (e.g., 'shapes' for SVG shapes). " +
      "Returns an ImageBlob with the generated image data.",
    inputSchema: {
      type: "object",
      properties: {
        generator: {
          type: "string",
          description: "Generator to use (e.g., 'shapes')",
          default: "shapes",
        },
        params: {
          type: "object",
          description:
            "Parameters for the generator. For 'shapes': {type: 'gradient'|'circle'|'rectangle'|'pattern', width?: number, height?: number, color1?: string, color2?: string, fill?: string, rx?: number, patternType?: 'dots'|'stripes'|'grid'}",
          default: {},
        },
      },
    },
  },
  {
    name: "transform_image",
    description:
      "Transform an image (convert format, resize, etc.). " +
      "Takes image bytes (base64) and returns transformed ImageBlob.",
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
          description: "Transform operation: 'convert', 'resize', 'composite', or 'optimizeSvg'",
          enum: ["convert", "resize", "composite", "optimizeSvg"],
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
      },
      required: ["imageBytes", "mime", "operation"],
    },
  },
  {
    name: "upload_image",
    description:
      "Upload an image to configured storage (S3 or filesystem) and return a shareable URL. " +
      "Takes image bytes (base64) and storage key.",
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
        key: {
          type: "string",
          description: "Storage key/path (e.g., 'slides/background.png')",
        },
        provider: {
          type: "string",
          description: "Storage provider to use (e.g., 's3', 'fs'). Uses default if not specified.",
        },
      },
      required: ["imageBytes", "mime", "key"],
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

    switch (name) {
      case "generate_image": {
        const { generator = "shapes", params = {} } = args as {
          generator?: string;
          params?: Record<string, unknown>;
        };

        const blob = await client.generate({
          generator,
          params,
        });

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

      case "transform_image": {
        const { imageBytes, mime, operation, to, width, height } = args as {
          imageBytes: string;
          mime: string;
          operation: string;
          to?: string;
          width?: number;
          height?: number;
        };

        const inputBlob = {
          bytes: Buffer.from(imageBytes, "base64"),
          mime: mime as MimeType,
        };

        let blob;
        switch (operation) {
          case "convert":
            if (!to) throw new Error("'to' parameter required for convert operation");
            blob = await client.transform({
              blob: inputBlob,
              op: "convert",
              to: to as MimeType,
            });
            break;
          case "resize":
            if (!width || !height) throw new Error("'width' and 'height' required for resize");
            blob = await client.transform({
              blob: inputBlob,
              op: "resize",
              params: { width, height },
            });
            break;
          case "optimizeSvg":
            blob = await client.transform({
              blob: inputBlob,
              op: "optimizeSvg",
            });
            break;
          default:
            throw new Error(`Unsupported operation: ${operation}`);
        }

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

      case "upload_image": {
        const { imageBytes, mime, key, provider } = args as {
          imageBytes: string;
          mime: string;
          key: string;
          provider?: string;
        };

        const inputBlob = {
          bytes: Buffer.from(imageBytes, "base64"),
          mime: mime as MimeType,
        };

        const result = await client.upload({
          blob: inputBlob,
          key,
          provider,
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                url: result.url,
                key: result.key,
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
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
