import type { AnalysisFeedback, AnalysisResult, CreateAnalysisResponse, ProductDetail } from '../types/analysis';
import type { CartItem } from '../utils/cart';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';
export const AUTH_TOKEN_STORAGE_KEY = 'colorsnapAuthToken';

export type BackendHealth = {
  status: 'ok';
  ai_mode: 'mock' | 'openai';
  ai_status?: 'ready' | 'missing_config';
  openai_configured?: boolean;
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
  timezone?: string;
  session_type?: 'video' | 'in_person' | 'written_review';
  add_ons?: Array<'wardrobe_review' | 'makeup_audit'>;
  estimated_price?: string;
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

export type SavedResultRecord = {
  saved_result_id: string;
  analysis_id: string;
  title: string;
  primary_season: string;
  secondary_season: string | null;
  confidence?: number;
  palette: Array<{
    name: string;
    hex: string;
    use_case: string;
  }>;
  summary: string;
  include_photo: boolean;
  created_at: string;
};

export type ShareRecord = {
  share_id: string;
  analysis_id: string;
  saved_result_id?: string;
  visibility: 'unlisted';
  title: string;
  description: string;
  primary_season: string;
  secondary_season: string | null;
  palette: Array<{
    name: string;
    hex: string;
  }>;
  include_photo: boolean;
  image_url: string | null;
  share_url: string;
  created_at: string;
};

export type AuthUser = {
  id: string;
  email: string;
  name?: string;
  role: string;
};

export type AuthResponse = {
  user: AuthUser;
  token: string;
};

type ApiErrorBody = {
  error?: {
    code?: string;
    message?: string;
  };
};

export class ApiClientError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.code = code;
  }
}

const readJson = async <T>(response: Response): Promise<T> => {
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorBody = body as ApiErrorBody;
    throw new ApiClientError(
      errorBody.error?.message || `Request failed with status ${response.status}.`,
      response.status,
      errorBody.error?.code
    );
  }

  return body as T;
};

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const getJsonHeaders = () => ({
  'Content-Type': 'application/json',
  ...getAuthHeaders()
});

export type AnalysisPhotoSource = 'upload' | 'camera';

export const createAnalysis = async (
  image: File,
  source: AnalysisPhotoSource = 'upload'
): Promise<CreateAnalysisResponse> => {
  const formData = new FormData();
  formData.append('image', image);
  formData.append('source', source);

  const response = await fetch(`${API_BASE_URL}/api/v1/analyses`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData
  });

  return readJson<CreateAnalysisResponse>(response);
};

export const getAnalysis = async (analysisId: string): Promise<AnalysisResult> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/analyses/${encodeURIComponent(analysisId)}`, {
    headers: getAuthHeaders()
  });
  return readJson<AnalysisResult>(response);
};

export const createAnalysisFeedback = async (
  analysisId: string,
  input: {
    rating: 1 | 2 | 3 | 4 | 5;
    issue_tags: AnalysisFeedback['issue_tags'];
    user_note?: string;
  }
): Promise<AnalysisFeedback> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/analyses/${encodeURIComponent(analysisId)}/feedback`, {
    method: 'POST',
    headers: getJsonHeaders(),
    body: JSON.stringify(input)
  });

  return readJson<AnalysisFeedback>(response);
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
    headers: getJsonHeaders(),
    body: JSON.stringify(booking)
  });

  return readJson<BookingRecord>(response);
};

export const createDemoOrder = async (email: string, items: CartItem[]): Promise<OrderRecord> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/orders`, {
    method: 'POST',
    headers: getJsonHeaders(),
    body: JSON.stringify({
      email,
      items
    })
  });

  return readJson<OrderRecord>(response);
};

export const createSavedResult = async (
  analysisId: string,
  includePhoto = false
): Promise<SavedResultRecord> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/saved-results`, {
    method: 'POST',
    headers: getJsonHeaders(),
    body: JSON.stringify({
      analysis_id: analysisId,
      include_photo: includePhoto
    })
  });

  return readJson<SavedResultRecord>(response);
};

export const createShare = async (input: {
  analysis_id: string;
  saved_result_id?: string;
  include_photo?: boolean;
}): Promise<ShareRecord> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/shares`, {
    method: 'POST',
    headers: getJsonHeaders(),
    body: JSON.stringify(input)
  });

  return readJson<ShareRecord>(response);
};

export const getShare = async (shareId: string): Promise<ShareRecord> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/shares/${encodeURIComponent(shareId)}`);
  return readJson<ShareRecord>(response);
};

export const registerUser = async (input: {
  email: string;
  password: string;
  name?: string;
}): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
    method: 'POST',
    headers: getJsonHeaders(),
    body: JSON.stringify(input)
  });

  return readJson<AuthResponse>(response);
};

export const loginUser = async (input: {
  email: string;
  password: string;
}): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: getJsonHeaders(),
    body: JSON.stringify(input)
  });

  return readJson<AuthResponse>(response);
};

export const loginWithGoogle = async (credential: string): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/google`, {
    method: 'POST',
    headers: getJsonHeaders(),
    body: JSON.stringify({
      credential
    })
  });

  return readJson<AuthResponse>(response);
};

export const getCurrentUser = async (): Promise<{ user: AuthUser }> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
    headers: getAuthHeaders()
  });

  return readJson<{ user: AuthUser }>(response);
};

export const getMySavedResults = async (): Promise<{ items: SavedResultRecord[] }> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/me/saved-results`, {
    headers: getAuthHeaders()
  });

  return readJson<{ items: SavedResultRecord[] }>(response);
};

export const getMyShares = async (): Promise<{ items: ShareRecord[] }> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/me/shares`, {
    headers: getAuthHeaders()
  });

  return readJson<{ items: ShareRecord[] }>(response);
};
