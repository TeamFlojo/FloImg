import type { FloimgConfig } from "../core/types.js";
import { ConfigurationError } from "../core/errors.js";

/**
 * Helper to define floimg configuration with TypeScript support
 */
export function defineConfig(config: FloimgConfig): FloimgConfig {
  return config;
}

/**
 * Load configuration from a file or object
 */
export async function loadConfig(configPath?: string): Promise<FloimgConfig | undefined> {
  if (!configPath) {
    // Try to find config in common locations
    const possiblePaths = ["./floimg.config.ts", "./floimg.config.js", "./floimg.config.mjs"];

    for (const path of possiblePaths) {
      try {
        const module = await import(path);
        return module.default || module;
      } catch {
        // Continue to next path
      }
    }

    return undefined;
  }

  // Load from specified path
  try {
    const module = await import(configPath);
    return module.default || module;
  } catch (error) {
    throw new ConfigurationError(
      `Failed to load config from ${configPath}: ${error instanceof Error ? error.message : String(error)}`,
      { cause: error instanceof Error ? error : undefined }
    );
  }
}
