import { ApiResponse } from '@kapda/shared';
import { getAuthHeaders } from '@/context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
  };
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers,
    ...options,
  });
  const data: ApiResponse<T> = await response.json();
  if (!response.ok) throw new Error(data.message || 'Something went wrong');
  return data;
}

export const api = {
  get: <T>(endpoint: string) => fetchApi<T>(endpoint),
  post: <T>(endpoint: string, body: unknown) =>
    fetchApi<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  put: <T>(endpoint: string, body: unknown) =>
    fetchApi<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
  delete: <T>(endpoint: string) =>
    fetchApi<T>(endpoint, {
      method: 'DELETE',
    }),
};
