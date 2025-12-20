import { writeFile, mkdir } from "fs/promises";
import { resolve, dirname } from "path";
import type { SaveProvider, ImageBlob, SaveResult } from "../../core/types.js";

/**
 * Filesystem save provider - saves images to local disk
 */
export default class FsSaveProvider implements SaveProvider {
  name = "fs";
  private baseDir: string;
  private defaultChmod: number;

  constructor(config: { baseDir?: string; chmod?: number } = {}) {
    this.baseDir = config.baseDir || process.cwd();
    this.defaultChmod = config.chmod || 0o644;
  }

  async save(input: {
    blob: ImageBlob;
    path: string;
    chmod?: number;
    overwrite?: boolean;
  }): Promise<SaveResult> {
    const fullPath = resolve(this.baseDir, input.path);

    // Ensure directory exists
    await mkdir(dirname(fullPath), { recursive: true });

    // Write file
    await writeFile(fullPath, input.blob.bytes, {
      mode: input.chmod || this.defaultChmod,
    });

    return {
      provider: "fs",
      location: fullPath,
      size: input.blob.bytes.length,
      mime: input.blob.mime,
      metadata: {
        path: fullPath,
        chmod: input.chmod || this.defaultChmod,
      },
    };
  }
}
