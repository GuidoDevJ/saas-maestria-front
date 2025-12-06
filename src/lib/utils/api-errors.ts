/**
 * API Error Handling Utilities
 * Maps API error responses to user-friendly messages
 */

import type { ApiErrorResponse } from '../types';

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public error: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Parse error response from API
 */
export function parseApiError(error: unknown): ApiError {
  // Axios error
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as any;
    const status = axiosError.response?.status || 500;
    const data = axiosError.response?.data as ApiErrorResponse | undefined;

    return new ApiError(
      status,
      data?.error || 'Unknown Error',
      data?.message || 'An unexpected error occurred',
      data
    );
  }

  // Generic error
  if (error instanceof Error) {
    return new ApiError(500, 'Internal Error', error.message);
  }

  return new ApiError(500, 'Unknown Error', 'An unexpected error occurred');
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  const apiError = parseApiError(error);

  const errorMessages: Record<number, string> = {
    400: 'Datos inválidos. Por favor, verifica la información e intenta de nuevo.',
    401: 'No autorizado. Por favor, inicia sesión.',
    403: 'No tienes permisos para realizar esta acción.',
    404: 'Recurso no encontrado.',
    409: 'El recurso ya existe o hay un conflicto.',
    413: 'El archivo es demasiado grande.',
    429: 'Demasiadas solicitudes. Por favor, intenta más tarde.',
    500: 'Error del servidor. Por favor, intenta más tarde.',
    503: 'Servicio no disponible. Por favor, intenta más tarde.',
  };

  // Return specific message from API if available
  if (apiError.message && apiError.message !== 'An unexpected error occurred') {
    return apiError.message;
  }

  // Return mapped message based on status code
  return errorMessages[apiError.statusCode] || 'Ocurrió un error inesperado.';
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as Error).message.toLowerCase();
    return (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('connection')
    );
  }
  return false;
}

/**
 * Check if error is a timeout error
 */
export function isTimeoutError(error: unknown): boolean {
  if (error && typeof error === 'object') {
    const axiosError = error as any;
    return axiosError.code === 'ECONNABORTED' || axiosError.code === 'ETIMEDOUT';
  }
  return false;
}

/**
 * Get retry suggestion based on error
 */
export function shouldRetry(error: unknown): boolean {
  const apiError = parseApiError(error);

  // Retry on server errors and rate limiting
  const retryableStatuses = [408, 429, 500, 502, 503, 504];

  return (
    retryableStatuses.includes(apiError.statusCode) ||
    isNetworkError(error) ||
    isTimeoutError(error)
  );
}

/**
 * Format file size error messages
 */
export function getFileSizeErrorMessage(fileSize: number, limit: number): string {
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return `El archivo es demasiado grande (${formatSize(fileSize)}). El tamaño máximo permitido es ${formatSize(limit)}.`;
}
