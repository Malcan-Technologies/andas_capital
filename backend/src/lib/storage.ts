/**
 * S3 Storage Module
 * 
 * Handles file uploads to AWS S3 and generates presigned URLs for downloads.
 * 
 * Required dependencies (add to package.json):
 *   npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
 * 
 * Required environment variables:
 *   AWS_REGION - AWS region (e.g., ap-southeast-1)
 *   S3_BUCKET - S3 bucket name
 *   S3_UPLOAD_PREFIX - Optional prefix for uploads (default: "uploads")
 */

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import path from "path";
import crypto from "crypto";

// S3 Client configuration
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "ap-southeast-1",
});

const BUCKET = process.env.S3_BUCKET || "";
const UPLOAD_PREFIX = process.env.S3_UPLOAD_PREFIX || "uploads";

// Check if S3 is configured
function isS3Configured(): boolean {
  return Boolean(BUCKET && process.env.AWS_REGION);
}

// Generate unique filename
function generateUniqueFilename(originalFilename: string): string {
  const ext = path.extname(originalFilename);
  const timestamp = Date.now();
  const randomHash = crypto.randomBytes(8).toString("hex");
  return `${timestamp}-${randomHash}${ext}`;
}

// Build S3 key with prefix and optional subfolder
function buildS3Key(filename: string, subfolder?: string): string {
  const parts = [UPLOAD_PREFIX];
  if (subfolder) {
    parts.push(subfolder);
  }
  parts.push(filename);
  return parts.join("/");
}

export interface UploadResult {
  success: boolean;
  key?: string;
  url?: string;
  error?: string;
}

export interface PresignedUrlResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Upload a file buffer to S3
 * 
 * @param buffer - File buffer to upload
 * @param originalFilename - Original filename (used for extension)
 * @param contentType - MIME type of the file
 * @param subfolder - Optional subfolder within the upload prefix
 * @returns Upload result with S3 key
 */
export async function uploadToS3(
  buffer: Buffer,
  originalFilename: string,
  contentType: string,
  subfolder?: string
): Promise<UploadResult> {
  if (!isS3Configured()) {
    return {
      success: false,
      error: "S3 is not configured. Set AWS_REGION and S3_BUCKET environment variables.",
    };
  }

  try {
    const filename = generateUniqueFilename(originalFilename);
    const key = buildS3Key(filename, subfolder);

    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      // Server-side encryption
      ServerSideEncryption: "AES256",
    });

    await s3Client.send(command);

    return {
      success: true,
      key,
      url: `s3://${BUCKET}/${key}`,
    };
  } catch (error) {
    console.error("S3 upload error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown upload error",
    };
  }
}

/**
 * Generate a presigned URL for downloading a file from S3
 * 
 * @param key - S3 object key
 * @param expiresInSeconds - URL expiration time (default: 1 hour)
 * @param downloadFilename - Optional filename for Content-Disposition header
 * @returns Presigned URL result
 */
export async function getPresignedDownloadUrl(
  key: string,
  expiresInSeconds: number = 3600,
  downloadFilename?: string
): Promise<PresignedUrlResult> {
  if (!isS3Configured()) {
    return {
      success: false,
      error: "S3 is not configured. Set AWS_REGION and S3_BUCKET environment variables.",
    };
  }

  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ...(downloadFilename && {
        ResponseContentDisposition: `attachment; filename="${downloadFilename}"`,
      }),
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });

    return {
      success: true,
      url,
    };
  } catch (error) {
    console.error("S3 presigned URL error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown presigned URL error",
    };
  }
}

/**
 * Generate a presigned URL for uploading directly to S3 (client-side upload)
 * 
 * @param filename - Filename to upload
 * @param contentType - MIME type of the file
 * @param subfolder - Optional subfolder
 * @param expiresInSeconds - URL expiration time (default: 5 minutes)
 * @returns Presigned URL and key for PUT upload
 */
export async function getPresignedUploadUrl(
  filename: string,
  contentType: string,
  subfolder?: string,
  expiresInSeconds: number = 300
): Promise<{ success: boolean; url?: string; key?: string; error?: string }> {
  if (!isS3Configured()) {
    return {
      success: false,
      error: "S3 is not configured. Set AWS_REGION and S3_BUCKET environment variables.",
    };
  }

  try {
    const uniqueFilename = generateUniqueFilename(filename);
    const key = buildS3Key(uniqueFilename, subfolder);

    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ContentType: contentType,
      ServerSideEncryption: "AES256",
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });

    return {
      success: true,
      url,
      key,
    };
  } catch (error) {
    console.error("S3 presigned upload URL error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown presigned upload URL error",
    };
  }
}

/**
 * Delete a file from S3
 * 
 * @param key - S3 object key to delete
 * @returns Success status
 */
export async function deleteFromS3(key: string): Promise<{ success: boolean; error?: string }> {
  if (!isS3Configured()) {
    return {
      success: false,
      error: "S3 is not configured. Set AWS_REGION and S3_BUCKET environment variables.",
    };
  }

  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: key,
    });

    await s3Client.send(command);

    return { success: true };
  } catch (error) {
    console.error("S3 delete error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown delete error",
    };
  }
}

/**
 * Check if a file exists in S3
 * 
 * @param key - S3 object key
 * @returns Whether the file exists
 */
export async function fileExistsInS3(key: string): Promise<boolean> {
  if (!isS3Configured()) {
    return false;
  }

  try {
    const command = new HeadObjectCommand({
      Bucket: BUCKET,
      Key: key,
    });

    await s3Client.send(command);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Parse an S3 URL or key to extract the key
 * Handles both s3://bucket/key and plain key formats
 * 
 * @param urlOrKey - S3 URL or key
 * @returns The S3 key
 */
export function parseS3Key(urlOrKey: string): string {
  if (urlOrKey.startsWith("s3://")) {
    // s3://bucket/key format
    const parts = urlOrKey.replace("s3://", "").split("/");
    return parts.slice(1).join("/");
  }
  return urlOrKey;
}

/**
 * Helper to determine if a fileUrl is an S3 key vs legacy local path
 * 
 * @param fileUrl - File URL or path from database
 * @returns Whether this is an S3 key
 */
export function isS3Key(fileUrl: string): boolean {
  // S3 keys start with the upload prefix or s3://
  return fileUrl.startsWith("s3://") || fileUrl.startsWith(UPLOAD_PREFIX);
}

// Multer memory storage helper for S3 uploads
// Use this instead of diskStorage when uploading to S3
export const multerMemoryStorage = {
  storage: "memory" as const,
};

// Export the S3 client for advanced usage
export { s3Client, BUCKET, UPLOAD_PREFIX };
