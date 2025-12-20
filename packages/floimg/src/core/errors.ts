/**
 * Base error class for floimg errors
 */
export class FloimgError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = "FloimgError";
  }
}

/**
 * Error thrown when a provider is not found
 */
export class ProviderNotFoundError extends FloimgError {
  constructor(providerType: string, providerName: string) {
    let message = `Provider "${providerName}" not found for type "${providerType}"`;

    // Add helpful hints for common cases
    if (providerType === "save" && (providerName === "s3" || providerName === "r2" || providerName === "tigris")) {
      message += `\n\nTo enable S3-compatible storage, create a floimg.config.ts file:\n\n` +
        `export default {\n` +
        `  save: {\n` +
        `    s3: {\n` +
        `      bucket: 'my-bucket',\n` +
        `      region: 'us-east-1',\n` +
        `      credentials: {\n` +
        `        accessKeyId: process.env.AWS_ACCESS_KEY_ID,\n` +
        `        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,\n` +
        `      },\n` +
        `    },\n` +
        `  },\n` +
        `};\n\n` +
        `See floimg.config.example.ts for more options.`;
    }

    super(message, "PROVIDER_NOT_FOUND");
    this.name = "ProviderNotFoundError";
  }
}

/**
 * Error thrown when provider configuration is invalid
 */
export class ConfigurationError extends FloimgError {
  constructor(message: string) {
    super(message, "CONFIGURATION_ERROR");
    this.name = "ConfigurationError";
  }
}

/**
 * Error thrown when an image transformation fails
 */
export class TransformError extends FloimgError {
  constructor(message: string) {
    super(message, "TRANSFORM_ERROR");
    this.name = "TransformError";
  }
}

/**
 * Error thrown when an upload operation fails
 */
export class UploadError extends FloimgError {
  constructor(message: string) {
    super(message, "UPLOAD_ERROR");
    this.name = "UploadError";
  }
}

/**
 * Error thrown when image generation fails
 */
export class GenerationError extends FloimgError {
  constructor(message: string) {
    super(message, "GENERATION_ERROR");
    this.name = "GenerationError";
  }
}
