export type AnalysisStatus = 'processing' | 'completed' | 'failed';
export type Undertone = 'warm' | 'cool' | 'neutral';
export type Brightness = 'low' | 'medium-low' | 'medium' | 'medium-high' | 'high';
export type Saturation = 'muted' | 'medium' | 'bright';
export type Contrast = 'low' | 'medium' | 'high';

export type Season =
  | 'Light Spring'
  | 'Warm Spring'
  | 'Bright Spring'
  | 'Light Summer'
  | 'Cool Summer'
  | 'Soft Summer'
  | 'Soft Autumn'
  | 'Warm Autumn'
  | 'Deep Autumn'
  | 'Deep Winter'
  | 'Cool Winter'
  | 'Bright Winter';

export type ProductCategory = 'lipstick' | 'blush' | 'eyeshadow' | 'base_makeup' | 'fashion';
export type ProductFinish = 'matte' | 'satin' | 'dewy' | 'natural' | 'shimmer';
export type ProductIntensity = 'soft' | 'medium' | 'bold';
export type CurrencyCode = 'USD';

export type ImageQuality = {
  passed: boolean;
  score: number;
  issues: string[];
  retry_advice: string | null;
};

export type SeasonResult = {
  primary: Season;
  secondary: Season | null;
  confidence: number;
};

export type ColorAttributes = {
  undertone: Undertone;
  brightness: Brightness;
  saturation: Saturation;
  contrast: Contrast;
};

export type PaletteColor = {
  name: string;
  hex: string;
  use_case: 'lipstick' | 'blush' | 'eyeshadow' | 'fashion';
};

export type RecommendationItem = {
  shade?: string;
  tip?: string;
  reason?: string;
};

export type ProductRecommendation = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: ProductCategory;
  shade: string;
  image: string;
  short_description: string;
  reason: string;
  url: string;
  purchase_url: string;
  score: number;
  price: string;
  currency: CurrencyCode;
  finish?: ProductFinish;
  intensity?: ProductIntensity;
  badges: string[];
};

export type AnalysisResult = {
  analysis_id: string;
  status: AnalysisStatus;
  created_at?: string;
  completed_at?: string;
  image_quality?: ImageQuality;
  season_result?: SeasonResult;
  attributes?: ColorAttributes;
  summary?: {
    headline: string;
    one_liner: string;
    explanations: string[];
  };
  recommended_palette?: PaletteColor[];
  beauty_recommendations?: {
    lipstick: RecommendationItem[];
    blush: RecommendationItem[];
    eyeshadow: RecommendationItem[];
    base_makeup: RecommendationItem[];
  };
  fashion_recommendations?: {
    best_colors: string[];
    avoid_colors: string[];
    metals: string[];
  };
  products?: ProductRecommendation[];
  beta_features?: {
    virtual_try_on_available: boolean;
  };
  error?: {
    code: string;
    message: string;
  };
};

export type ModelAnalysisOutput = Omit<
  AnalysisResult,
  'analysis_id' | 'status' | 'created_at' | 'completed_at' | 'products' | 'error'
>;

export type UploadedImage = {
  fieldName: string;
  originalName: string;
  mimeType: string;
  size: number;
  buffer: Buffer;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: ProductCategory;
  shade: string;
  image: string;
  gallery?: string[];
  url: string;
  price: string;
  currency: CurrencyCode;
  seasons: Season[];
  undertones: Undertone[];
  saturation: Saturation;
  brightness: Brightness;
  contrast_support?: Contrast[];
  finish?: ProductFinish;
  intensity?: ProductIntensity;
  use_cases?: string[];
  ingredients_highlights?: string[];
  description: string;
  short_description: string;
  why_it_matches_template?: string;
  retailer: {
    name: string;
    url: string;
    affiliate?: boolean;
  };
  active: boolean;
};
