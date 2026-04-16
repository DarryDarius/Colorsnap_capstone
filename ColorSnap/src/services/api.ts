import type { AnalysisResult, CreateAnalysisResponse, ProductDetail } from '../types/analysis';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

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
