import { addProductToCart, clearCartItems, readCartItems } from './cart';
import type { ProductRecommendation } from '../types/analysis';

const product: ProductRecommendation = {
  id: 'lip_001',
  slug: 'terracotta-lip',
  name: 'Terracotta Lip',
  brand: 'Example Beauty',
  category: 'lipstick',
  shade: 'Terracotta',
  image: '/images/pd1.jpg',
  short_description: 'A warm muted lipstick.',
  reason: 'Matches Warm Autumn undertone and muted saturation.',
  url: '/products/terracotta-lip',
  purchase_url: 'https://example.com/terracotta-lip',
  score: 94,
  price: '18.00',
  currency: 'USD',
  best_for: ['Warm Autumn'],
  retailer_name: 'Example Retailer',
  badges: ['Warm Autumn']
};

beforeEach(() => {
  localStorage.clear();
});

test('addProductToCart preserves recommendation and saved look context', () => {
  addProductToCart(product, {
    analysisId: 'ana_test',
    sourceLookId: 'look_test',
    source: 'recommendation'
  });

  const [item] = readCartItems();

  expect(item.analysisId).toBe('ana_test');
  expect(item.sourceLookId).toBe('look_test');
  expect(item.matchScore).toBe(94);
  expect(item.matchReason).toMatch(/Warm Autumn/);
});

test('clearCartItems removes persisted cart items', () => {
  addProductToCart(product);
  clearCartItems();

  expect(readCartItems()).toEqual([]);
});
