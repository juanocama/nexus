import { CONFIG } from '@/utils/config';

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  color: string;
  plate: string;
}

class VehiclesApi {
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

  async getMyVehicles(token: string): Promise<Vehicle[]> {
    return this.request('/vehicles', token);
  }

  async createVehicle(token: string, data: { brand: string; model: string; color: string; plate: string }): Promise<Vehicle> {
    return this.request('/vehicles', token, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateVehicle(token: string, id: string, data: Partial<Vehicle>): Promise<Vehicle> {
    return this.request(`/vehicles/${id}`, token, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteVehicle(token: string, id: string): Promise<void> {
    await this.request(`/vehicles/${id}`, token, {
      method: 'DELETE',
    });
  }
}

export const vehiclesApi = new VehiclesApi();
