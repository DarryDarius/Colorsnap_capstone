import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import ShoppingCart from './ShoppingCart';
import type { CartItem } from '../utils/cart';
import { writeCartItems } from '../utils/cart';

const cartItem: CartItem = {
  id: 'lip_001',
  slug: 'clinique-almost-lipstick-black-honey',
  name: 'Almost Lipstick in Black Honey',
  brand: 'Clinique',
  category: 'lipstick',
  shade: 'Black Honey',
  price: '25.00',
  currency: 'USD',
  image: '/images/pd1.jpg',
  description: 'A sheer berry tint for soft depth.',
  quantity: 1,
  source: 'recommendation',
  addedAt: '2026-04-18T00:00:00.000Z',
  analysisId: 'ana_test',
  matchReason: 'Matches your muted autumn palette.',
  retailerName: 'Sephora',
  purchaseUrl: 'https://www.sephora.com/product/almost-lipstick-P122751'
};

const renderCart = () => {
  render(
    <BrowserRouter>
      <ShoppingCart />
    </BrowserRouter>
  );
};

beforeEach(() => {
  localStorage.clear();
});

test('renders cart items with external purchase links', async () => {
  writeCartItems([cartItem]);
  renderCart();

  expect(await screen.findByRole('heading', { name: /your shopping cart/i })).toBeInTheDocument();
  expect(screen.getByText('Almost Lipstick in Black Honey')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /buy from sephora/i })).toHaveAttribute('href', cartItem.purchaseUrl);
  expect(screen.getByRole('link', { name: /view details/i })).toHaveAttribute(
    'href',
    '/products/clinique-almost-lipstick-black-honey?analysis_id=ana_test'
  );
});

test('updates quantity in local storage', async () => {
  writeCartItems([cartItem]);
  renderCart();

  fireEvent.click(await screen.findByRole('button', { name: '+' }));

  const storedItems = JSON.parse(localStorage.getItem('shoppingCart') || '[]') as CartItem[];
  expect(storedItems[0].quantity).toBe(2);
});
