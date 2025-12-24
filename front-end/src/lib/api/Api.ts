

const API_BASE_URL = 'https://api.in2skincare.com';

export interface QueuedRequest {
  resolve: (value: any) => void;
  reject: (error: any) => void;
  url: string;
  config: RequestInit;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken?: string;
  user?: any;
}

export class BaseApiClient {
  private baseURL: string;
  
  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }


  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getAccessToken();

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      const responseData = await response.json();

      this.handleTokensInResponse(responseData);
      return responseData;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }


  private async handleErrorResponse(response: Response) {
    let errorData: any;

    try {
      errorData = await response.json();
    } catch {
      errorData = {
        message: `HTTP ${response.status}: ${response.statusText}`,
        statusCode: response.status,
      };
    }

    errorData.statusCode = response.status;

    switch (response.status) {
      case 400:
        throw new Error(`Bad request: ${errorData.message}`);
      case 403:
        throw new Error(`Permission denied: ${errorData.message}`);
      case 404:
        throw new Error(`Not found: ${errorData.message}`);
      case 422:
        throw new Error(`Validation error: ${errorData.message}`);
      case 429:
        throw new Error(`Too much requests: ${errorData.message}`);
      case 500:
        throw new Error(`Server error: ${errorData.message}`);
      default:
        throw new Error(errorData.message || 'Error');
    }
  }

  private handleTokensInResponse(responseData: any) {
    if (responseData.accessToken) {
      this.setAccessToken(responseData.accessToken);
    }
  }

  private getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }

  private setAccessToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  // private clearTokens(): void {
  //   if (typeof window !== 'undefined') {
  //     localStorage.removeItem('auth_token');
  //   }
  // }

  public async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', ...options });
  }


  public async post<T>(
    endpoint: string,
    data?: any,
    options?: RequestInit
  ): Promise<T> {
    const isFormData = data instanceof FormData;

    const headers: HeadersInit = {
      ...(this.getAccessToken() && { Authorization: `Bearer ${this.getAccessToken()}` }),
      // Only add Content-Type if NOT FormData
      ...(!isFormData && { 'Content-Type': 'application/json' }),
      ...(options?.headers || {}),
    };

    const body = isFormData ? data : data ? JSON.stringify(data) : undefined;

    return this.request<T>(endpoint, {
      method: 'POST',
      headers,
      body,
      ...options,
    });
  }
  public async put<T>(
    endpoint: string,
    data?: any,
    options?: RequestInit
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  public async patch<T>(
    endpoint: string,
    data?: any,
    options?: RequestInit
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  public async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', ...options });
  }
}

export const apiClient = new BaseApiClient();