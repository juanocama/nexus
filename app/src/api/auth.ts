import { CONFIG } from '@/utils/config';

class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = CONFIG.API.BASE_URL;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async register(data: { email: string; password: string; full_name: string; faculty?: string; phone?: string }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async authenticateWithMicrosoft(accessToken: string, refreshToken?: string) {
    return this.request('/auth/microsoft', {
      method: 'POST',
      body: JSON.stringify({ accessToken, refreshToken }),
    });
  }

  async verifyEmailDomain(email: string) {
    return this.request<{ valid: boolean; registered: boolean }>('/auth/verify-domain', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async getProfile(token: string) {
    return this.request('/users/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}

export const apiClient = new ApiClient();
