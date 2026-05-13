import type { CurrencyCode, ProductCategory } from './analysis';

export type BookingDuration = '30' | '45' | '60';
export type BookingSessionType = 'video' | 'in_person' | 'written_review';
export type BookingAddOn = 'wardrobe_review' | 'makeup_audit';

export type BookingRecord = {
  booking_id: string;
  user_id?: string;
  analysis_id?: string;
  saved_look_id?: string;
  status: 'requested';
  expert_id: string;
  expert_name: string;
  name: string;
  email: string;
  phone?: string;
  date: string;
  time: string;
  duration: BookingDuration;
  timezone?: string;
  session_type?: BookingSessionType;
  add_ons?: BookingAddOn[];
  estimated_price?: string;
  user_questions?: string;
  message?: string;
  created_at: string;
};

export type OrderItem = {
  id: string;
  slug?: string;
  name: string;
  brand?: string;
  category?: ProductCategory;
  shade?: string;
  price: string;
  currency: CurrencyCode;
  image?: string;
  quantity: number;
  retailerName?: string;
  purchaseUrl?: string;
  analysisId?: string | null;
  matchReason?: string;
  matchScore?: number;
  sourceLookId?: string;
};

export type OrderRecord = {
  order_id: string;
  user_id?: string;
  status: 'confirmed';
  demo: true;
  email: string;
  items: OrderItem[];
  total: string;
  currency: CurrencyCode;
  created_at: string;
};
