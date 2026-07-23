import { useQuery } from '@tanstack/react-query';
import { api } from './api';

interface HealthResponse {
  status: string;
  message: string;
}

export function useHealthCheck() {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => api.get<HealthResponse>('/health'),
  });
}
