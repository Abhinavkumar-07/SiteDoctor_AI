// lib/mock/engines/mock-storage-provider.ts
//
// Satisfies IStorageProvider without touching any cloud storage.
// upload() pretends to store a file and returns a constructed fake URL.
// getPublicUrl() returns the same fake URL for any path.
// Replaced by GcsStorageProvider in Step 8.3+.

import type {
  IStorageProvider,
  UploadResult,
} from "@/lib/interfaces/i-storage-provider";

const MOCK_BUCKET_BASE = "https://storage.mock.sitedoctor.dev";

export class MockStorageProvider implements IStorageProvider {
  async upload(
    path: string,
    _buffer: Buffer,
    _contentType: string,
  ): Promise<UploadResult> {
    return { publicUrl: `${MOCK_BUCKET_BASE}/${path}` };
  }

  async getPublicUrl(path: string): Promise<string | null> {
    return `${MOCK_BUCKET_BASE}/${path}`;
  }
}
