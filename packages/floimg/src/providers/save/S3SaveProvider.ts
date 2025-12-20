import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import type { SaveProvider, ImageBlob, SaveResult } from "../../core/types.js";

export interface S3SaveProviderConfig {
  bucket: string;
  region: string;
  endpoint?: string;
  credentials?: {
    accessKeyId: string;
    secretAccessKey: string;
  };
}

/**
 * S3 save provider - saves images to AWS S3 or S3-compatible storage
 */
export default class S3SaveProvider implements SaveProvider {
  name = "s3";
  private s3Client: S3Client;
  private bucket: string;

  constructor(config: S3SaveProviderConfig) {
    this.bucket = config.bucket;
    this.s3Client = new S3Client({
      region: config.region,
      endpoint: config.endpoint,
      credentials: config.credentials,
    });
  }

  async save(input: {
    blob: ImageBlob;
    path: string;
    headers?: Record<string, string>;
    metadata?: Record<string, unknown>;
  }): Promise<SaveResult> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: input.path,
      Body: input.blob.bytes,
      ContentType: input.blob.mime,
      ...( input.headers && { Metadata: input.headers }),
    });

    const result = await this.s3Client.send(command);

    const url = input.headers?.endpoint
      ? `${input.headers.endpoint}/${this.bucket}/${input.path}`
      : `https://${this.bucket}.s3.amazonaws.com/${input.path}`;

    return {
      provider: "s3",
      location: url,
      size: input.blob.bytes.length,
      mime: input.blob.mime,
      metadata: {
        etag: result.ETag,
        bucket: this.bucket,
        key: input.path,
      },
    };
  }
}
