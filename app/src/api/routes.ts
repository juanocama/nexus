import { CONFIG } from '@/utils/config';

export interface FrequentRoute {
  origin_name: string;
  destination_name: string;
  type: 'booking' | 'publication';
  count: number;
}

class RoutesApi {
  private baseURL: string;

  constructor() {
    this.baseURL = CONFIG.API.BASE_URL;
  }

  private async request<T>(endpoint: string, token: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    return response.json();
  }

  async getFrequentRoutes(token: string): Promise<FrequentRoute[]> {
    return this.request<FrequentRoute[]>('/users/me/frequent-routes', token);
  }
}

export const routesApi = new RoutesApi();
