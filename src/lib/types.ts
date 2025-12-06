export type Role = 'Admin' | 'Editor' | 'Reader';

export interface User {
  id: string;
  username: string;
  email: string;
  role: Role;
  token: string;
}

// Document Status Types
export type DocumentStatus = 'pending' | 'processing' | 'completed' | 'failed';

// API Response Types
export interface Document {
  documentId: string;
  userId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  s3Key: string;
  s3VersionId?: string | null;
  uploadedAt: string;
  status: DocumentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface UploadUrlResponse {
  message: string;
  uploadUrl: string;
  documentId: string;
  s3Key: string;
  expiresIn: number;
}

export interface ConfirmUploadRequest {
  documentId: string;
  s3Key: string;
  fileSize: number;
  userId: string;
  fileName: string;
  mimeType: string;
}

export interface GetDocumentResponse {
  document: Document;
  downloadUrl?: string;
}

export interface GetDocumentsByUserResponse {
  userId: string;
  count: number;
  documents: Document[];
}

export interface DeleteDocumentResponse {
  message: string;
  documentId: string;
}

export interface UpdateStatusResponse {
  message: string;
  document: {
    documentId: string;
    status: DocumentStatus;
    updatedAt: string;
  };
}

// Upload Types
export interface UploadDocumentBase64Request {
  fileName: string;
  mimeType: string;
  fileContent: string; // base64 encoded
  userId: string;
}

export interface UploadDocumentBase64Response {
  statusCode: number;
  body: {
    message: string;
    document: Document;
  };
}

// Error Response Types
export interface ApiErrorResponse {
  error: string;
  message: string;
}

// Document Versioning Types
export interface DocumentVersion {
  versionId: string;
  versionNumber: number;
  uploadedAt: string;
  uploadedBy: string;
  size: number;
  fileName: string;
  isActive: boolean;
  comment?: string;
}

export interface VersionUploadUrlResponse {
  message: string;
  uploadUrl: string;
  versionId: string;
  versionNumber: number;
  s3Key: string;
  expiresIn: number;
  instructions: string;
}

export interface VersionConfirmRequest {
  versionId: string;
  s3Key: string;
  fileName: string;
  mimeType: string;
  size: number;
  checksum?: string;
  comment?: string;
}

export interface VersionConfirmResponse {
  success: boolean;
  message: string;
  version: DocumentVersion;
}

export interface ListVersionsResponse {
  message: string;
  documentId: string;
  totalVersions: number;
  versions: DocumentVersion[];
}

export interface VersionDownloadResponse {
  message: string;
  downloadUrl: string;
  expiresIn: number;
  version: DocumentVersion;
}
