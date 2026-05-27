import { Platform } from 'react-native';
import { CONFIG } from '@/utils/config';

export type ReportType = 'bug' | 'suggestion' | 'other';

export type CreateReportData = {
  type: ReportType;
  title: string;
  description: string;
  device_info?: string;
  app_version?: string;
};

export type CreateReportResponse = {
  report: unknown;
  emailSent: boolean;
};

class ReportsApi {
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

  async createReport(token: string, data: Omit<CreateReportData, 'device_info' | 'app_version'>) {
    return this.request<CreateReportResponse>('/reports', token, {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        device_info: `${Platform.OS} ${Platform.Version}`,
        app_version: '1.0.0',
      }),
    });
  }
}

export const reportsApi = new ReportsApi();
