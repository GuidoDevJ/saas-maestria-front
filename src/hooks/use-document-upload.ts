/**
 * Custom hook for document upload functionality
 * Handles both base64 and presigned URL upload methods
 */

import { useState, useCallback } from 'react';
import { uploadFileToS3 } from '@/lib/api';
import {
  uploadDocumentBase64,
  generateUploadUrl,
  confirmUpload,
} from '@/lib/services/document.service';
import { getErrorMessage, getFileSizeErrorMessage } from '@/lib/utils/api-errors';
import type { Document } from '@/lib/types';

const MAX_BASE64_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024; // 5GB (S3 limit)

export type UploadStatus = 'idle' | 'uploading' | 'processing' | 'completed' | 'error';

interface UseDocumentUploadReturn {
  uploadDocument: (file: File, userId: string, onProgress?: (progress: number) => void) => Promise<Document | null>;
  uploadProgress: number;
  status: UploadStatus;
  error: string | null;
  reset: () => void;
  cancel: () => void;
}

export function useDocumentUpload(): UseDocumentUploadReturn {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  /**
   * Reset upload state
   */
  const reset = useCallback(() => {
    setUploadProgress(0);
    setStatus('idle');
    setError(null);
    setAbortController(null);
  }, []);

  /**
   * Cancel ongoing upload
   */
  const cancel = useCallback(() => {
    if (abortController) {
      abortController.abort();
      setStatus('idle');
      setError('Subida cancelada');
    }
  }, [abortController]);

  /**
   * Upload via base64 encoding (for files < 10MB)
   */
  const uploadViaBase64 = async (file: File, userId: string, onProgress?: (progress: number) => void): Promise<Document> => {
    setStatus('uploading');
    setUploadProgress(50); // Simulated progress for base64 encoding
    onProgress?.(50);

    const document = await uploadDocumentBase64(file, userId);

    setUploadProgress(100);
    onProgress?.(100);
    return document;
  };

  /**
   * Upload via presigned URL (for files >= 10MB)
   */
  const uploadViaPresignedUrl = async (
    file: File,
    userId: string,
    onProgress?: (progress: number) => void
  ): Promise<Document> => {
    setStatus('uploading');

    // Step 1: Generate presigned URL
    const { uploadUrl, documentId, s3Key } = await generateUploadUrl(
      file.name,
      file.type,
      userId
    );

    // Step 2: Upload directly to S3
    await uploadFileToS3(uploadUrl, file, (progress) => {
      setUploadProgress(progress);
      onProgress?.(progress);
    });

    setStatus('processing');

    // Step 3: Confirm upload
    const document = await confirmUpload({
      documentId,
      s3Key,
      fileSize: file.size,
      userId,
      fileName: file.name,
      mimeType: file.type,
    });

    return document;
  };

  /**
   * Main upload function - determines method based on file size
   */
  const uploadDocument = useCallback(
    async (file: File, userId: string, onProgress?: (progress: number) => void): Promise<Document | null> => {
      try {
        // Reset state
        setError(null);
        setUploadProgress(0);
        onProgress?.(0);

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
          const errorMsg = getFileSizeErrorMessage(file.size, MAX_FILE_SIZE);
          setError(errorMsg);
          setStatus('error');
          return null;
        }

        // Create abort controller for cancellation
        const controller = new AbortController();
        setAbortController(controller);

        let document: Document;

        // Choose upload method based on file size
        if (file.size < MAX_BASE64_SIZE) {
          document = await uploadViaBase64(file, userId, onProgress);
        } else {
          document = await uploadViaPresignedUrl(file, userId, onProgress);
        }

        setStatus('completed');
        setUploadProgress(100);
        onProgress?.(100);
        setAbortController(null);

        return document;
      } catch (err: any) {
        // Handle abort
        if (err.name === 'AbortError' || err.message === 'canceled') {
          setStatus('idle');
          setError('Subida cancelada');
          return null;
        }

        // Handle other errors
        const errorMsg = getErrorMessage(err);
        setError(errorMsg);
        setStatus('error');
        console.error('Upload error:', err);
        return null;
      }
    },
    []
  );

  return {
    uploadDocument,
    uploadProgress,
    status,
    error,
    reset,
    cancel,
  };
}
