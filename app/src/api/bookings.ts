import { CONFIG } from '@/utils/config';

class BookingsApi {
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

  async createBooking(token: string, data: {
    trip_id: string;
    meeting_point_name?: string;
    meeting_point_lat?: number;
    meeting_point_lng?: number;
  }) {
    return this.request('/bookings', token, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMyBookings(token: string) {
    return this.request<Booking[]>('/bookings/my', token);
  }

  async getDriverBookings(token: string) {
    return this.request<Booking[]>('/bookings/driver/trips', token);
  }

  async cancelBooking(token: string, id: string) {
    return this.request(`/bookings/${id}/cancel`, token, {
      method: 'PUT',
    });
  }

  async confirmBooking(token: string, id: string) {
    return this.request(`/bookings/${id}/confirm`, token, {
      method: 'PUT',
    });
  }
}

export interface Booking {
  id: string;
  trip: {
    id: string;
    origin_name: string;
    destination_name: string;
    departure_time: string;
    price: number;
    status: string;
    driver: {
      id: string;
      full_name: string;
      faculty?: string;
    };
  };
  passenger: {
    id: string;
    full_name: string;
  };
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  booked_at: string;
  meeting_point_name?: string;
}

export const bookingsApi = new BookingsApi();
