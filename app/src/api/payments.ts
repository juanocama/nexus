import { CONFIG } from '@/utils/config';

export interface CreatePreferenceResponse {
  checkout_url: string;
  sandbox_url: string;
  preference_id: string;
}

export interface VerifyPaymentResponse {
  payment_status: 'pending' | 'success' | 'failed' | 'refunded';
  paid_at: string | null;
}

export interface SavedPaymentCard {
  id: string;
  brand: string;
  payment_type: string | null;
  last_four: string;
  exp_month: number;
  exp_year: number;
  cardholder_name: string | null;
  is_default: boolean;
  created_at: string;
}

export interface AddPaymentCardPayload {
  card_token?: string;
  dev_card_data?: {
    card_number: string;
    expiration_month: string;
    expiration_year: string;
    security_code: string;
  };
  is_default?: boolean;
}

export interface PayWithSavedCardPayload {
  booking_id: string;
  card_id: string;
  security_code: string;
  installments?: number;
}

class PaymentsApi {
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
      const errorBody = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(errorBody.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async createPreference(token: string, bookingId: string): Promise<CreatePreferenceResponse> {
    return this.request<CreatePreferenceResponse>('/payments/create-preference', token, {
      method: 'POST',
      body: JSON.stringify({ booking_id: bookingId }),
    });
  }

  async verifyPayment(token: string, payload: {
    external_reference: string;
    preference_id?: string;
    collection_status?: string;
  }): Promise<VerifyPaymentResponse> {
    return this.request<VerifyPaymentResponse>('/payments/verify', token, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async listCards(token: string): Promise<SavedPaymentCard[]> {
    return this.request<SavedPaymentCard[]>('/payments/cards', token);
  }

  async addCard(token: string, payload: AddPaymentCardPayload): Promise<SavedPaymentCard> {
    return this.request<SavedPaymentCard>('/payments/cards', token, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async setDefaultCard(token: string, cardId: string): Promise<SavedPaymentCard> {
    return this.request<SavedPaymentCard>(`/payments/cards/${cardId}/default`, token, {
      method: 'PATCH',
      body: JSON.stringify({ is_default: true }),
    });
  }

  async deleteCard(token: string, cardId: string): Promise<{ deleted: true }> {
    return this.request<{ deleted: true }>(`/payments/cards/${cardId}`, token, {
      method: 'DELETE',
    });
  }

  async payWithSavedCard(token: string, payload: PayWithSavedCardPayload): Promise<VerifyPaymentResponse & {
    provider_reference: string | null;
  }> {
    return this.request<VerifyPaymentResponse & { provider_reference: string | null }>('/payments/pay-with-card', token, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
}

export const paymentsApi = new PaymentsApi();
