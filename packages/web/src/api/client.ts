/**
 * API Client with Interceptors
 * Unified API client with authentication, retry logic, and error handling
 */

export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
  retries?: number;
  retryDelay?: number;
}

export interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, string>;
  timeout?: number;
  skipAuth?: boolean;
  skipRetry?: boolean;
}

export interface ApiError extends Error {
  status?: number;
  code?: string;
  data?: any;
}

type RequestInterceptor = (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;
type ResponseInterceptor = (response: Response) => Response | Promise<Response>;
type ErrorInterceptor = (error: ApiError) => ApiError | Promise<ApiError>;

export class ApiClient {
  private config: Required<ApiClientConfig>;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private errorInterceptors: ErrorInterceptor[] = [];
  private tokenRefreshPromise: Promise<string> | null = null;

  constructor(config: ApiClientConfig) {
    this.config = {
      baseURL: config.baseURL,
      timeout: config.timeout || 30000,
      headers: config.headers || {},
      retries: config.retries || 3,
      retryDelay: config.retryDelay || 1000,
    };

    // Default interceptors
    this.setupDefaultInterceptors();
  }

  private setupDefaultInterceptors() {
    // Add auth token to requests
    this.addRequestInterceptor(async (config) => {
      if (!config.skipAuth) {
        const token = await this.getAuthToken();
        if (token) {
          config.headers = {
            ...config.headers,
            Authorization: `Bearer ${token}`,
          };
        }
      }
      return config;
    });

    // Handle 401 unauthorized errors
    this.addErrorInterceptor(async (error) => {
      if (error.status === 401 && !error.config?.skipAuth) {
        try {
          const newToken = await this.refreshToken();
          if (newToken) {
            // Retry original request with new token
            return this.request(error.config!.url!, {
              ...error.config,
              headers: {
                ...error.config?.headers,
                Authorization: `Bearer ${newToken}`,
              },
            });
          }
        } catch (refreshError) {
          // Token refresh failed, clear auth and redirect to login
          this.clearAuth();
          window.location.href = '/login';
        }
      }
      throw error;
    });
  }

  public addRequestInterceptor(interceptor: RequestInterceptor) {
    this.requestInterceptors.push(interceptor);
  }

  public addResponseInterceptor(interceptor: ResponseInterceptor) {
    this.responseInterceptors.push(interceptor);
  }

  public addErrorInterceptor(interceptor: ErrorInterceptor) {
    this.errorInterceptors.push(interceptor);
  }

  private async getAuthToken(): Promise<string | null> {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('authToken');
  }

  private async setAuthToken(token: string): Promise<void> {
    if (typeof window === 'undefined') return;
    localStorage.setItem('authToken', token);
  }

  private clearAuth(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
  }

  private async refreshToken(): Promise<string | null> {
    // Prevent multiple simultaneous refresh requests
    if (this.tokenRefreshPromise) {
      return this.tokenRefreshPromise;
    }

    this.tokenRefreshPromise = (async () => {
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await fetch(`${this.config.baseURL}/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) {
          throw new Error('Token refresh failed');
        }

        const data = await response.json();
        const newToken = data.accessToken;

        await this.setAuthToken(newToken);
        return newToken;
      } finally {
        this.tokenRefreshPromise = null;
      }
    })();

    return this.tokenRefreshPromise;
  }

  private buildURL(path: string, params?: Record<string, string>): string {
    const url = new URL(path, this.config.baseURL);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    return url.toString();
  }

  private async executeRequest(
    url: string,
    config: RequestConfig,
    attempt: number = 1
  ): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), config.timeout || this.config.timeout);

    try {
      let requestConfig = { ...config };

      // Run request interceptors
      for (const interceptor of this.requestInterceptors) {
        requestConfig = await interceptor(requestConfig);
      }

      const response = await fetch(url, {
        method: requestConfig.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...this.config.headers,
          ...requestConfig.headers,
        },
        body: requestConfig.body ? JSON.stringify(requestConfig.body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      // Run response interceptors
      let finalResponse = response;
      for (const interceptor of this.responseInterceptors) {
        finalResponse = await interceptor(finalResponse);
      }

      // Handle non-OK responses
      if (!finalResponse.ok) {
        const error: ApiError = new Error(`HTTP ${finalResponse.status}`);
        error.status = finalResponse.status;
        error.config = { url, ...config };

        try {
          error.data = await finalResponse.json();
        } catch {
          error.data = await finalResponse.text();
        }

        throw error;
      }

      return finalResponse;
    } catch (error: any) {
      clearTimeout(timeout);

      // Run error interceptors
      let finalError = error as ApiError;
      for (const interceptor of this.errorInterceptors) {
        try {
          finalError = await interceptor(finalError);
        } catch (interceptorError) {
          // If interceptor throws, continue with that error
          finalError = interceptorError as ApiError;
        }
      }

      // Retry logic for network errors
      const shouldRetry =
        !config.skipRetry &&
        attempt < this.config.retries &&
        (error.name === 'AbortError' || error.message.includes('network'));

      if (shouldRetry) {
        await this.delay(this.config.retryDelay * attempt);
        return this.executeRequest(url, config, attempt + 1);
      }

      throw finalError;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  public async request<T = any>(path: string, config: RequestConfig = {}): Promise<T> {
    const url = this.buildURL(path, config.params);
    const response = await this.executeRequest(url, config);
    return response.json();
  }

  public async get<T = any>(path: string, config: RequestConfig = {}): Promise<T> {
    return this.request<T>(path, { ...config, method: 'GET' });
  }

  public async post<T = any>(path: string, data?: any, config: RequestConfig = {}): Promise<T> {
    return this.request<T>(path, { ...config, method: 'POST', body: data });
  }

  public async put<T = any>(path: string, data?: any, config: RequestConfig = {}): Promise<T> {
    return this.request<T>(path, { ...config, method: 'PUT', body: data });
  }

  public async patch<T = any>(path: string, data?: any, config: RequestConfig = {}): Promise<T> {
    return this.request<T>(path, { ...config, method: 'PATCH', body: data });
  }

  public async delete<T = any>(path: string, config: RequestConfig = {}): Promise<T> {
    return this.request<T>(path, { ...config, method: 'DELETE' });
  }
}

// Singleton instance
let apiClientInstance: ApiClient | null = null;

export function createApiClient(config: ApiClientConfig): ApiClient {
  apiClientInstance = new ApiClient(config);
  return apiClientInstance;
}

export function getApiClient(): ApiClient {
  if (!apiClientInstance) {
    throw new Error('API client not initialized. Call createApiClient first.');
  }
  return apiClientInstance;
}

// Export default instance creator
export const apiClient = {
  init: createApiClient,
  get: getApiClient,
};
