import axios from 'axios';
import { getAccessToken } from '@/shared/lib/tokenManager';

const baseURL = process.env.NEXT_PUBLIC_COURIER_API_BASE_URL ?? 'http://localhost:8081';

export const courierClient = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

courierClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
