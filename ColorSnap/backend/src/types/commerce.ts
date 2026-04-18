import type { CurrencyCode, ProductCategory } from './analysis';

export type BookingDuration = '30' | '45' | '60';

export type BookingRecord = {
  booking_id: string;
  status: 'requested';
  expert_id: string;
  expert_name: string;
  name: string;
  email: string;
  phone?: string;
  date: string;
  time: string;
  duration: BookingDuration;
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
};

export type OrderRecord = {
  order_id: string;
  status: 'confirmed';
  demo: true;
  email: string;
  items: OrderItem[];
  total: string;
  currency: CurrencyCode;
  created_at: string;
};
