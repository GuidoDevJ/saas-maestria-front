/**
 * API Configuration
 * Manages API base URLs for different environments
 */

type Environment = 'local' | 'dev' | 'staging' | 'prod';

interface ApiConfig {
  baseUrl: string;
  environment: Environment;
  apiId: string;
}

/**
 * Get the base URL for the API based on environment
 */
export function getApiBaseUrl(): string {
  const environment = (process.env.NEXT_PUBLIC_ENVIRONMENT || 'local') as Environment;
  const apiId = process.env.NEXT_PUBLIC_API_ID || '{api-id}';

  const region = process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-2';

  const baseUrls: Record<Environment, string> = {
    local: `http://localhost:4566/restapis/${apiId}/local/_user_request_`,
    dev: `https://${apiId}.execute-api.${region}.amazonaws.com/dev`,
    staging: `https://${apiId}.execute-api.${region}.amazonaws.com/staging`,
    prod: `https://${apiId}.execute-api.${region}.amazonaws.com/prod`,
  };

  // Use explicit env variable if provided, otherwise construct from environment
  return process.env.NEXT_PUBLIC_API_URL || baseUrls[environment];
}

/**
 * Get the current API configuration
 */
export function getApiConfig(): ApiConfig {
  const environment = (process.env.NEXT_PUBLIC_ENVIRONMENT || 'local') as Environment;
  const apiId = process.env.NEXT_PUBLIC_API_ID || '{api-id}';

  return {
    baseUrl: getApiBaseUrl(),
    environment,
    apiId,
  };
}

/**
 * Check if running in local development mode
 */
export function isLocalEnvironment(): boolean {
  return getApiConfig().environment === 'local';
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return getApiConfig().environment === 'prod';
}

export const API_CONFIG = getApiConfig();
