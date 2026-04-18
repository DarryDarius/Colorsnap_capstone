import type { AnalysisResult, CreateAnalysisResponse, ProductDetail } from '../types/analysis';
import type { CartItem } from '../utils/cart';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

export type BackendHealth = {
  status: 'ok';
  ai_mode: 'mock' | 'openai';
  timestamp: string;
};

export type BookingRequest = {
  expert_id: string;
  expert_name: string;
  name: string;
  email: string;
  phone?: string;
  date: string;
  time: string;
  duration: '30' | '45' | '60';
  message?: string;
};

export type BookingRecord = BookingRequest & {
  booking_id: string;
  status: 'requested';
  created_at: string;
};

export type OrderRecord = {
  order_id: string;
  status: 'confirmed';
  demo: true;
  email: string;
  items: CartItem[];
  total: string;
  currency: 'USD';
  created_at: string;
};

type ApiErrorBody = {
  error?: {
    code?: string;
    message?: string;
  };
};

const readJson = async <T>(response: Response): Promise<T> => {
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorBody = body as ApiErrorBody;
    throw new Error(errorBody.error?.message || `Request failed with status ${response.status}.`);
  }

  return body as T;
};

export const createAnalysis = async (image: File): Promise<CreateAnalysisResponse> => {
  const formData = new FormData();
  formData.append('image', image);
  formData.append('source', 'web');

  const response = await fetch(`${API_BASE_URL}/api/v1/analyses`, {
    method: 'POST',
    body: formData
  });

  return readJson<CreateAnalysisResponse>(response);
};

export const getAnalysis = async (analysisId: string): Promise<AnalysisResult> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/analyses/${encodeURIComponent(analysisId)}`);
  return readJson<AnalysisResult>(response);
};

export const getProductDetail = async (slug: string, analysisId?: string | null): Promise<ProductDetail> => {
  const query = analysisId ? `?analysis_id=${encodeURIComponent(analysisId)}` : '';
  const response = await fetch(`${API_BASE_URL}/api/v1/products/${encodeURIComponent(slug)}${query}`);
  return readJson<ProductDetail>(response);
};

export const getBackendHealth = async (): Promise<BackendHealth> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/health`);
  return readJson<BackendHealth>(response);
};

export const createBooking = async (booking: BookingRequest): Promise<BookingRecord> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(booking)
  });

  return readJson<BookingRecord>(response);
};

export const createDemoOrder = async (email: string, items: CartItem[]): Promise<OrderRecord> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email,
      items
    })
  });

  return readJson<OrderRecord>(response);
};
