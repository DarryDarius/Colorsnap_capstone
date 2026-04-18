import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import Payment from './Payment';
import type { CartItem } from '../utils/cart';
import { writeCartItems } from '../utils/cart';

const cartItem: CartItem = {
  id: 'blush_001',
  slug: 'rare-beauty-soft-pinch-liquid-blush-joy',
  name: 'Soft Pinch Liquid Blush',
  brand: 'Rare Beauty by Selena Gomez',
  category: 'blush',
  shade: 'Joy',
  price: '25.00',
  currency: 'USD',
  image: '/images/pd4.jpg',
  description: 'A dewy peach blush for warm palettes.',
  quantity: 2,
  source: 'recommendation',
  addedAt: '2026-04-18T00:00:00.000Z'
};

beforeEach(() => {
  localStorage.clear();
});

test('renders demo checkout notice and total', () => {
  writeCartItems([cartItem]);

  render(
    <BrowserRouter>
      <Payment />
    </BrowserRouter>
  );

  expect(screen.getByText(/demo checkout - no real payment will be processed/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /pay \$50.00/i })).toBeInTheDocument();
  expect(screen.getByText('Soft Pinch Liquid Blush')).toBeInTheDocument();
});
