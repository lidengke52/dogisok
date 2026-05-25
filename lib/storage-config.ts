/**
 * Storage Configuration - Centralized URL management for easy migration
 * 
 * This module abstracts storage URL handling to support migration from:
 * - Vercel Blob → Aliyun OSS
 * - Supabase → Aliyun RDS
 * 
 * To migrate: Simply change environment variables, no code changes needed.
 */

/**
 * Get the full storage URL for a file path
 * Supports both Vercel Blob and Aliyun OSS based on environment configuration
 * 
 * @param path - File path or relative URL (with or without leading slash)
 * @returns Full storage URL
 * 
 * @example
 * getStorageUrl('/uploads/product-123.jpg')
 * // Current (Vercel Blob): https://public.blob.vercel-storage.com/uploads/product-123.jpg
 * // After migration (OSS): https://dogisok.oss-cn-hangzhou.aliyuncs.com/uploads/product-123.jpg
 */
export function getStorageUrl(path?: string | null): string {
  if (!path) {
    return ""
  }

  // Remove leading slash if present for consistency
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path

  // Current configuration: Vercel Blob
  const blobUrl = process.env.NEXT_PUBLIC_BLOB_URL
  if (blobUrl) {
    return `${blobUrl}/${normalizedPath}`
  }

  // After migration: Aliyun OSS
  const ossUrl = process.env.NEXT_PUBLIC_OSS_URL
  if (ossUrl) {
    return `${ossUrl}/${normalizedPath}`
  }

  // Fallback: return path as-is if no storage URL configured
  return path
}

/**
 * Get storage configuration info (for debugging/logging)
 */
export function getStorageConfig() {
  const blobUrl = process.env.NEXT_PUBLIC_BLOB_URL
  const ossUrl = process.env.NEXT_PUBLIC_OSS_URL

  return {
    provider: blobUrl ? "vercel-blob" : ossUrl ? "aliyun-oss" : "unknown",
    blobUrl,
    ossUrl,
  }
}

/**
 * Validate that storage is properly configured
 */
export function isStorageConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_BLOB_URL || process.env.NEXT_PUBLIC_OSS_URL)
}
