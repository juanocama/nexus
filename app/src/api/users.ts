import { CONFIG } from '@/utils/config';

export interface ProfileData {
  id: string;
  email: string;
  full_name: string;
  faculty?: string;
  phone?: string;
  profile_photo_url?: string;
  average_rating?: number;
  total_trips?: number;
  status?: string;
  roles: string[];
  created_at?: string;
  updated_at?: string;
}

class UsersApi {
  private baseURL: string;

  constructor() {
    this.baseURL = CONFIG.API.BASE_URL;
  }

  private async request<T>(endpoint: string, token: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async getProfile(token: string) {
    return this.request<ProfileData>('/users/me', token);
  }

  async updateRoles(token: string, roles: string[]) {
    return this.request<ProfileData & { accessToken: string }>('/users/me/roles', token, {
      method: 'PATCH',
      body: JSON.stringify({ roles }),
    });
  }
}

export const usersApi = new UsersApi();
