// lib/interfaces/i-storage-provider.ts
//
// Contract for uploading files and resolving their public URLs.
// In Step 8.1–8.2: MockStorageProvider returns placeholder URLs.
// In Step 8.3+: GcsStorageProvider uploads to Google Cloud Storage.

export interface UploadResult {
  publicUrl: string;
}

export interface IStorageProvider {
  /**
   * Upload a file buffer and return its public-access URL.
   * @param path   Target path within the storage bucket/namespace.
   * @param buffer File content as a Buffer.
   * @param contentType MIME type, e.g. "image/png".
   */
  upload(
    path: string,
    buffer: Buffer,
    contentType: string,
  ): Promise<UploadResult>;

  /**
   * Resolve the public URL for an already-stored file.
   * Returns null if the file does not exist.
   */
  getPublicUrl(path: string): Promise<string | null>;
}
