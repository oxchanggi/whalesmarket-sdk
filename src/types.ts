/**
 * Type definitions for Whales SDK
 */

/**
 * SDK Configuration options
 */
export interface WhalesSDKOptions {
  /**
   * Base URL for API requests
   * @default 'https://api.whales.com/v1'
   */
  baseUrl?: string;
}

/**
 * API Response structure
 */
export interface ApiResponse<T> {
  /**
   * Response data
   */
  data: T;
  
  /**
   * Response status
   */
  status: number;
  
  /**
   * Response message
   */
  message?: string;
} 