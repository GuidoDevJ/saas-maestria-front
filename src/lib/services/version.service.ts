/**
 * Version Service
 * Handles all API calls related to document versioning
 */

import api, { uploadFileToS3 } from '../api';
import type {
  DocumentVersion,
  VersionUploadUrlResponse,
  VersionConfirmRequest,
  VersionConfirmResponse,
  ListVersionsResponse,
  VersionDownloadResponse,
} from '../types';

/**
 * Generate presigned URL for uploading a new version
 */
export const generateVersionUploadUrl = async (
  documentId: string,
  fileName: string,
  mimeType: string,
  comment?: string
): Promise<VersionUploadUrlResponse> => {
  const response = await api.post<VersionUploadUrlResponse>(
    `/documents/${documentId}/versions/upload-url`,
    {
      fileName,
      mimeType,
      comment,
    }
  );

  return response.data;
};

/**
 * Confirm version upload after uploading to S3
 */
export const confirmVersionUpload = async (
  documentId: string,
  request: VersionConfirmRequest
): Promise<VersionConfirmResponse> => {
  const response = await api.post<VersionConfirmResponse>(
    `/documents/${documentId}/versions/confirm`,
    request
  );

  return response.data;
};

/**
 * Upload a new version of a document
 * Complete flow: generate URL → upload to S3 → confirm
 */
export const uploadNewVersion = async (
  documentId: string,
  file: File,
  comment?: string,
  onProgress?: (progress: number) => void
): Promise<DocumentVersion> => {
  // Step 1: Generate presigned URL
  const uploadUrlResponse = await generateVersionUploadUrl(
    documentId,
    file.name,
    file.type,
    comment
  );

  // Step 2: Upload directly to S3
  await uploadFileToS3(uploadUrlResponse.uploadUrl, file, onProgress);

  // Step 3: Confirm upload
  const confirmResponse = await confirmVersionUpload(documentId, {
    versionId: uploadUrlResponse.versionId,
    s3Key: uploadUrlResponse.s3Key,
    fileName: file.name,
    mimeType: file.type,
    size: file.size,
    comment,
  });

  return confirmResponse.version;
};

/**
 * Get all versions of a document
 */
export const listDocumentVersions = async (
  documentId: string
): Promise<ListVersionsResponse> => {
  const response = await api.get<ListVersionsResponse>(
    `/documents/${documentId}/versions`
  );

  return response.data;
};

/**
 * Get download URL for a specific version
 */
export const getVersionDownloadUrl = async (
  documentId: string,
  versionId: string,
  expiresIn: number = 3600
): Promise<VersionDownloadResponse> => {
  const response = await api.get<VersionDownloadResponse>(
    `/documents/${documentId}/versions/${versionId}/download`,
    {
      params: { expiresIn },
    }
  );

  return response.data;
};

/**
 * Download a specific version (opens in new tab)
 */
export const downloadVersion = async (
  documentId: string,
  versionId: string
): Promise<void> => {
  const response = await getVersionDownloadUrl(documentId, versionId);
  window.open(response.downloadUrl, '_blank');
};
