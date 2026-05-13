import { CONFIG } from '@/utils/config';

class TripsApi {
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

  async createTrip(token: string, data: {
    origin_name: string;
    origin_lat: number;
    origin_lng: number;
    destination_name: string;
    destination_lat: number;
    destination_lng: number;
    departure_time: string;
    total_seats: number;
    price: number;
    notes?: string;
    vehicle_id?: string;
  }) {
    return this.request('/trips', token, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async searchTrips(token: string, params?: {
    origin?: string;
    destination?: string;
    date?: string;
    seats?: number;
  }) {
    const query = new URLSearchParams();
    if (params?.origin) query.set('origin', params.origin);
    if (params?.destination) query.set('destination', params.destination);
    if (params?.date) query.set('date', params.date);
    if (params?.seats) query.set('seats', String(params.seats));

    const endpoint = query.toString() ? `/trips?${query.toString()}` : '/trips';
    return this.request(endpoint, token);
  }

  async getTrip(token: string, id: string) {
    return this.request(`/trips/${id}`, token);
  }

  async getMyTrips(token: string) {
    return this.request('/trips/driver/my', token);
  }

  async cancelTrip(token: string, id: string) {
    return this.request(`/trips/${id}/cancel`, token, {
      method: 'PUT',
    });
  }

  async updateTrip(token: string, id: string, data: {
    origin_name?: string;
    origin_lat?: number;
    origin_lng?: number;
    destination_name?: string;
    destination_lat?: number;
    destination_lng?: number;
    departure_time?: string;
    total_seats?: number;
    price?: number;
    notes?: string;
    vehicle_id?: string;
  }) {
    return this.request(`/trips/${id}`, token, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
}

export const tripsApi = new TripsApi();
