import type { FloimgConfig } from '@teamflojo/floimg';

/**
 * floimg Configuration Example
 *
 * Copy this file to `floimg.config.ts` in your project root or home directory.
 * The CLI and MCP server will automatically load it.
 */
export default {
  // Verbose logging (useful for debugging)
  verbose: false,

  // OpenAI / DALL-E configuration
  ai: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY || 'sk-...',
      // Optional: organization, model
    },
  },

  // Save/storage configuration
  save: {
    // Default save provider (fs or s3)
    default: 'fs',

    // Filesystem provider configuration
    fs: {
      baseDir: './output',
      chmod: 0o644,
    },

    // S3-compatible storage (AWS S3, Tigris, R2, DigitalOcean Spaces, etc.)
    s3: {
      bucket: process.env.S3_BUCKET || 'my-bucket',
      region: process.env.AWS_REGION || 'us-east-1',

      // Optional: Custom endpoint for S3-compatible services
      // endpoint: 'https://fly.storage.tigris.dev', // Tigris
      // endpoint: 'https://your-account.r2.cloudflarestorage.com', // Cloudflare R2
      // endpoint: 'https://nyc3.digitaloceanspaces.com', // DigitalOcean Spaces

      // Credentials
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'your-access-key',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'your-secret-key',
      },

      // Optional: Make uploaded images public
      // acl: 'public-read',

      // Optional: CDN URL for public access
      // cdnUrl: 'https://your-cdn.com',
    },
  },
} satisfies FloimgConfig;
