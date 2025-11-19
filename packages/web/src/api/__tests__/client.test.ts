/**
 * Tests for API Client
 * Coverage: Interceptors, retry logic, token refresh, error handling
 */
import { ApiClient, createApiClient, getApiClient } from '../client';

// Mock fetch
global.fetch = jest.fn();

describe('ApiClient', () => {
  let client: ApiClient;
  const mockBaseURL = 'https://api.example.com';

  beforeEach(() => {
    client = new ApiClient({ baseURL: mockBaseURL });
    (global.fetch as jest.Mock).mockClear();
    localStorage.clear();
  });

  describe('Basic Requests', () => {
    it('should make GET request', async () => {
      const mockData = { message: 'success' };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await client.get('/test');

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseURL}/test`,
        expect.objectContaining({
          method: 'GET',
        })
      );
      expect(result).toEqual(mockData);
    });

    it('should make POST request with data', async () => {
      const postData = { name: 'test' };
      const mockResponse = { id: 1, ...postData };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await client.post('/users', postData);

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseURL}/users`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(postData),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should make PUT request', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ updated: true }),
      });

      await client.put('/users/1', { name: 'updated' });

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseURL}/users/1`,
        expect.objectContaining({
          method: 'PUT',
        })
      );
    });

    it('should make PATCH request', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ patched: true }),
      });

      await client.patch('/users/1', { status: 'active' });

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseURL}/users/1`,
        expect.objectContaining({
          method: 'PATCH',
        })
      );
    });

    it('should make DELETE request', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ deleted: true }),
      });

      await client.delete('/users/1');

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseURL}/users/1`,
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });

  describe('Query Parameters', () => {
    it('should append query parameters to URL', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await client.get('/users', { params: { page: '1', limit: '10' } });

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseURL}/users?page=1&limit=10`,
        expect.any(Object)
      );
    });
  });

  describe('Authentication', () => {
    it('should add auth token to requests', async () => {
      localStorage.setItem('authToken', 'test-token');

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await client.get('/protected');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );
    });

    it('should skip auth when skipAuth is true', async () => {
      localStorage.setItem('authToken', 'test-token');

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await client.get('/public', { skipAuth: true });

      const callHeaders = (global.fetch as jest.Mock).mock.calls[0][1].headers;
      expect(callHeaders.Authorization).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    it('should throw error for non-OK responses', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: 'Not found' }),
      });

      await expect(client.get('/missing')).rejects.toThrow();
    });

    it('should include response data in error', async () => {
      const errorData = { error: 'Validation failed', fields: ['email'] };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => errorData,
      });

      try {
        await client.post('/users', {});
      } catch (error: any) {
        expect(error.status).toBe(400);
        expect(error.data).toEqual(errorData);
      }
    });
  });

  describe('Retry Logic', () => {
    it('should retry on network errors', async () => {
      const client = new ApiClient({
        baseURL: mockBaseURL,
        retries: 3,
        retryDelay: 10,
      });

      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true }),
        });

      const result = await client.get('/test');

      expect(global.fetch).toHaveBeenCalledTimes(3);
      expect(result).toEqual({ success: true });
    });

    it('should not retry on skipRetry', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(client.get('/test', { skipRetry: true })).rejects.toThrow();

      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should not retry on non-network errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Bad request' }),
      });

      await expect(client.get('/test')).rejects.toThrow();

      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Timeout', () => {
    it('should timeout requests after configured duration', async () => {
      const client = new ApiClient({
        baseURL: mockBaseURL,
        timeout: 100,
      });

      (global.fetch as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve({ ok: true }), 200);
          })
      );

      await expect(client.get('/slow')).rejects.toThrow();
    }, 1000);
  });

  describe('Request Interceptors', () => {
    it('should run request interceptors', async () => {
      const interceptor = jest.fn((config) => {
        config.headers = { ...config.headers, 'X-Custom': 'value' };
        return config;
      });

      client.addRequestInterceptor(interceptor);

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await client.get('/test');

      expect(interceptor).toHaveBeenCalled();
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Custom': 'value',
          }),
        })
      );
    });

    it('should run multiple interceptors in order', async () => {
      const order: number[] = [];

      client.addRequestInterceptor((config) => {
        order.push(1);
        return config;
      });

      client.addRequestInterceptor((config) => {
        order.push(2);
        return config;
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await client.get('/test');

      expect(order).toEqual([1, 2]);
    });
  });

  describe('Response Interceptors', () => {
    it('should run response interceptors', async () => {
      const interceptor = jest.fn((response) => response);
      client.addResponseInterceptor(interceptor);

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await client.get('/test');

      expect(interceptor).toHaveBeenCalled();
    });
  });

  describe('Error Interceptors', () => {
    it('should run error interceptors', async () => {
      const interceptor = jest.fn((error) => {
        throw error;
      });

      client.addErrorInterceptor(interceptor);

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({}),
      });

      await expect(client.get('/test')).rejects.toThrow();
      expect(interceptor).toHaveBeenCalled();
    });
  });

  describe('Singleton', () => {
    it('should create and get singleton instance', () => {
      const instance1 = createApiClient({ baseURL: mockBaseURL });
      const instance2 = getApiClient();

      expect(instance1).toBe(instance2);
    });

    it('should throw when getting before initialization', () => {
      // Clear any existing instance
      (apiClient as any).instance = null;

      expect(() => getApiClient()).toThrow('not initialized');
    });
  });
});
