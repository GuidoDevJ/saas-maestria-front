import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { getApiBaseUrl } from './config/api.config';
import { parseApiError } from './utils/api-errors';
import { fetchAuthSession } from 'aws-amplify/auth';

/**
 * Axios instance configured with base URL and interceptors
 */
const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor to add authentication token from AWS Cognito
 */
api.interceptors.request.use(
  async (config) => {
    if (typeof window !== 'undefined') {
      try {
        // Get the current session from Amplify/Cognito
        const session = await fetchAuthSession();
        const token = session.tokens?.idToken?.toString();

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('Auth token added to request');
        } else {
          console.warn('No auth token available');
        }
      } catch (error) {
        console.warn('Failed to get auth session:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor for error handling
 */
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const apiError = parseApiError(error);
    console.error('API Error:', {
      status: apiError.statusCode,
      error: apiError.error,
      message: apiError.message,
    });
    return Promise.reject(error);
  }
);

/**
 * Upload file directly to S3 using presigned URL
 */
export const uploadFileToS3 = async (
  uploadUrl: string,
  file: File,
  onUploadProgress?: (progress: number) => void
): Promise<void> => {
  const config: AxiosRequestConfig = {
    headers: {
      'Content-Type': file.type,
    },
    onUploadProgress: onUploadProgress
      ? (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onUploadProgress(percentCompleted);
          }
        }
      : undefined,
  };

  await axios.put(uploadUrl, file, config);
};

/**
 * Convert File to base64 string
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:image/png;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Format file size to human-readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Get MIME type from file extension
 */
export const getMimeTypeFromExtension = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    txt: 'text/plain',
    md: 'text/markdown',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    mp4: 'video/mp4',
    zip: 'application/zip',
  };
  return mimeTypes[extension || ''] || 'application/octet-stream';
};

// Re-export document service functions for convenience
export { getDocument as getDocumentById } from './services/document.service';
export { getDocumentsByUser } from './services/document.service';
export { deleteDocument } from './services/document.service';
export { updateDocumentStatus } from './services/document.service';

export default api;
