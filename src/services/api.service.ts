import { ApiResponse, EmergencyActionPayload, EmergencyActionResponse, BackendHealthResponse } from '../types/api.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

class ApiService {
  private token: string | null = null;

  public setAuthToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || {
            code: 'HTTP_ERROR',
            message: `Request failed with status ${response.status}`,
          },
          timestamp: new Date().toISOString(),
        };
      }

      return data;
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error.message || 'Unable to reach backend gateway.',
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Check Backend Service Health
  public async checkHealth(): Promise<ApiResponse<BackendHealthResponse>> {
    return this.request<BackendHealthResponse>('/health');
  }

  // Execute Server-Side Emergency Action / Remote Commands
  public async dispatchEmergencyAction(payload: EmergencyActionPayload): Promise<ApiResponse<EmergencyActionResponse>> {
    return this.request<EmergencyActionResponse>('/emergency/action', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
}

export const apiService = new ApiService();
