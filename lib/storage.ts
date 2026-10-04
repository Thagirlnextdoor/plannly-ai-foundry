import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getEnv } from "./env";

export interface StoragePort {
  upload(key: string, body: Buffer | Uint8Array, contentType?: string): Promise<{ key: string; url?: string }>;
  signedDownloadUrl(key: string, expiresInSeconds?: number): Promise<string>;
  remove(key: string): Promise<void>;
}

let client: S3Client | null = null;

function s3(): { client: S3Client; bucket: string; publicBase?: string } {
  const env = getEnv();
  if (!client) {
    client = new S3Client({
      region: env.STORAGE_REGION,
      endpoint: env.STORAGE_ENDPOINT,
      credentials: {
        accessKeyId: env.STORAGE_ACCESS_KEY_ID,
        secretAccessKey: env.STORAGE_SECRET_ACCESS_KEY,
      },
      forcePathStyle: false,
    });
  }
  return { client, bucket: env.STORAGE_BUCKET, publicBase: env.STORAGE_PUBLIC_BASE_URL };
}

function toKeyError(op: string, err: unknown): Error {
  const msg = err instanceof Error ? err.message : String(err);
  return new Error(`storage.${op} failed: ${msg}`);
}

export const storage: StoragePort = {
  async upload(key, body, contentType) {
    const { client: c, bucket, publicBase } = s3();
    try {
      await c.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: body as Buffer, ContentType: contentType }));
      return { key, url: publicBase ? `${publicBase}/${key}` : undefined };
    } catch (err) {
      throw toKeyError("upload", err);
    }
  },
  async signedDownloadUrl(key, expiresInSeconds = 3600) {
    const { client: c, bucket } = s3();
    try {
      return await getSignedUrl(c, new GetObjectCommand({ Bucket: bucket, Key: key }), { expiresIn: expiresInSeconds });
    } catch (err) {
      throw toKeyError("signedDownloadUrl", err);
    }
  },
  async remove(key) {
    const { client: c, bucket } = s3();
    try {
      await c.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
    } catch (err) {
      throw toKeyError("remove", err);
    }
  },
};
