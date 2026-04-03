/**
 * Pure TypeScript REST client for localization endpoints
 * NO React dependencies - compatible with Node.js, browser, and React Native
 */

import axios, { AxiosError } from 'axios';
import type { AxiosInstance } from 'axios';
import type {
  LocalizationClientConfig,
  BCP47Language,
  ListLocalizationsResponse,
  SaveLocalizationsRequest,
  SaveLocalizationsResponse,
  LocalizationRequest,
  LocalizationRequestResponse,
} from './types';

/**
 * LocalizationClient - Pure TypeScript REST client for POI localizations
 */
export class LocalizationClient {
  private axiosInstance: AxiosInstance;
  private config: LocalizationClientConfig;

  constructor(config: LocalizationClientConfig) {
    this.config = config;

    // Create Axios instance with base configuration
    this.axiosInstance = axios.create({
      baseURL: config.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Build HTTP headers based on authentication mode
   */
  private buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};

    switch (this.config.authMode) {
      case 'bearer':
        if (this.config.token) {
          headers['Authorization'] = `Bearer ${this.config.token}`;
        }
        break;
      case 'session':
        // Session cookie is automatically sent by axios
        this.axiosInstance.defaults.withCredentials = true;
        break;
      case 'public':
        // No special headers needed for public access
        break;
    }

    return headers;
  }

  /**
   * Fetch all localizations for a POI
   * @param poiId - The POI identifier
   * @returns Promise with localizations list and metadata
   */
  async listPoiLocalizations(
    poiId: string
  ): Promise<ListLocalizationsResponse> {
    const headers = this.buildHeaders();

    const response = await this.axiosInstance.get<ListLocalizationsResponse>(
      `/pois/${poiId}/localizations`,
      { headers }
    );

    return response.data;
  }

  /**
   * Save/update localizations for a POI with conflict detection
   * @param poiId - The POI identifier
   * @param request - The save request payload with lastSyncedAt for concurrency control
   * @returns Promise with save response and new lastSyncedAt
   * @throws AxiosError with 409 status on conflict (stale lastSyncedAt)
   */
  async savePoiLocalizations(
    poiId: string,
    request: SaveLocalizationsRequest
  ): Promise<SaveLocalizationsResponse> {
    const headers = this.buildHeaders();

    const response = await this.axiosInstance.put<SaveLocalizationsResponse>(
      `/pois/${poiId}/localizations`,
      request,
      { headers }
    );

    return response.data;
  }

  /**
   * Delete a specific language localization for a POI
   * @param poiId - The POI identifier
   * @param language - The language code to delete in BCP 47 format
   * @returns Promise<void>
   */
  async deletePoiLocalization(
    poiId: string,
    language: BCP47Language
  ): Promise<void> {
    const headers = this.buildHeaders();

    await this.axiosInstance.delete(
      `/pois/${poiId}/localizations/${language}`,
      { headers }
    );
  }

  /**
   * Request localization for a language (text, audio, or both)
   * @param request - The localization request payload
   * @returns Promise with request response containing requestId and status
   */
  async requestLocalization(
    request: LocalizationRequest
  ): Promise<LocalizationRequestResponse> {
    const headers = this.buildHeaders();

    const response =
      await this.axiosInstance.post<LocalizationRequestResponse>(
        `/localization-requests`,
        request,
        { headers }
      );

    return response.data;
  }
}

/**
 * Factory function to create a localization client
 * @param config - LocalizationClientConfig with baseUrl, authMode, and optional token
 * @returns LocalizationClient instance
 */
export function createLocalizationClient(
  config: LocalizationClientConfig
): LocalizationClient {
  return new LocalizationClient(config);
}

/**
 * Type export for Axios errors that may be thrown by the client
 */
export type { AxiosError as LocalizationClientError };
