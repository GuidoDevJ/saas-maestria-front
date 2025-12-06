/**
 * Document Service
 * Handles all API calls related to document management
 */

import api, { fileToBase64 } from '../api';
import type {
  Document,
  DocumentStatus,
  UploadDocumentBase64Request,
  UploadUrlResponse,
  ConfirmUploadRequest,
  GetDocumentResponse,
  GetDocumentsByUserResponse,
  DeleteDocumentResponse,
  UpdateStatusResponse,
} from '../types';

/**
 * Upload a document encoded in base64
 * For files smaller than 10MB
 */
export const uploadDocumentBase64 = async (
  file: File,
  userId: string
): Promise<Document> => {
  const fileContent = await fileToBase64(file);

  const requestData: UploadDocumentBase64Request = {
    fileName: file.name,
    mimeType: file.type,
    fileContent,
    userId,
  };

  const response = await api.post<{ message: string; document: Document }>(
    '/documents',
    requestData
  );

  return response.data.document;
};

/**
 * Generate presigned URL for direct S3 upload
 * For files larger than 10MB
 */
export const generateUploadUrl = async (
  fileName: string,
  mimeType: string,
  userId: string
): Promise<UploadUrlResponse> => {
  const response = await api.post<UploadUrlResponse>('/documents/upload-url', {
    fileName,
    mimeType,
    userId,
  });

  return response.data;
};

/**
 * Confirm upload after direct S3 upload
 */
export const confirmUpload = async (
  data: ConfirmUploadRequest
): Promise<Document> => {
  const response = await api.post<{ message: string; document: Document }>(
    '/documents/confirm',
    data
  );

  return response.data.document;
};

/**
 * Get document by ID
 * Optionally include download URL
 */
export const getDocument = async (
  documentId: string,
  includeDownloadUrl: boolean = false
): Promise<GetDocumentResponse> => {
  const params = includeDownloadUrl ? { includeDownloadUrl: 'true' } : {};

  const response = await api.get<GetDocumentResponse>(
    `/documents/${documentId}`,
    { params }
  );

  return response.data;
};

/**
 * Get all documents for a user
 */
export const getDocumentsByUser = async (
  userId: string
): Promise<GetDocumentsByUserResponse> => {
  const response = await api.get<GetDocumentsByUserResponse>(
    `/documents/user/${userId}`
  );

  return response.data;
};

/**
 * Delete a document
 * Removes from both S3 and DynamoDB
 */
export const deleteDocument = async (
  documentId: string
): Promise<DeleteDocumentResponse> => {
  const response = await api.delete<DeleteDocumentResponse>(
    `/documents/${documentId}`
  );

  return response.data;
};

/**
 * Update document status
 */
export const updateDocumentStatus = async (
  documentId: string,
  status: DocumentStatus
): Promise<UpdateStatusResponse> => {
  const response = await api.patch<UpdateStatusResponse>(
    `/documents/${documentId}/status`,
    { status }
  );

  return response.data;
};

/**
 * Batch delete documents
 */
export const deleteMultipleDocuments = async (
  documentIds: string[]
): Promise<{ success: number; failed: number; errors: string[] }> => {
  const results = await Promise.allSettled(
    documentIds.map((id) => deleteDocument(id))
  );

  const success = results.filter((r) => r.status === 'fulfilled').length;
  const failed = results.filter((r) => r.status === 'rejected').length;
  const errors = results
    .filter((r) => r.status === 'rejected')
    .map((r) => (r as PromiseRejectedResult).reason.message);

  return { success, failed, errors };
};

/**
 * Check if document exists
 */
export const documentExists = async (documentId: string): Promise<boolean> => {
  try {
    await getDocument(documentId);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Get document count for user
 */
export const getDocumentCount = async (userId: string): Promise<number> => {
  const response = await getDocumentsByUser(userId);
  return response.count;
};
