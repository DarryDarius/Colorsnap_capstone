import React, { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import ProductRecommendations from './ProductRecommendations';
import type { ProductRecommendation } from '../../types/analysis';

const products: ProductRecommendation[] = [
  {
    id: 'lip_001',
    slug: 'rose-lipstick',
    name: 'Rose Lipstick',
    brand: 'Example Beauty',
    category: 'lipstick',
    shade: 'Rose',
    image: '/images/pd1.jpg',
    short_description: 'A rose lipstick.',
    reason: 'Matches a soft palette.',
    url: '/products/rose-lipstick',
    purchase_url: 'https://www.sephora.com/product/rose-lipstick',
    score: 88,
    price: '25.00',
    currency: 'USD',
    best_for: ['Soft Autumn'],
    retailer_name: 'Sephora',
    badges: ['Soft Autumn']
  },
  {
    id: 'blush_001',
    slug: 'budget-blush',
    name: 'Budget Blush',
    brand: 'Example Color',
    category: 'blush',
    shade: 'Peach',
    image: '/images/pd4.jpg',
    short_description: 'A peach blush.',
    reason: 'Adds warmth.',
    url: '/products/budget-blush',
    purchase_url: 'https://www.ulta.com/p/budget-blush',
    score: 72,
    price: '8.00',
    currency: 'USD',
    best_for: ['Warm Spring'],
    retailer_name: 'Ulta Beauty',
    badges: ['Warm Spring']
  }
];

const StatefulRecommendations = () => {
  const [activeFilter, setActiveFilter] = useState('all');

  return (
    <BrowserRouter>
      <ProductRecommendations
        products={products}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        onAddToCart={jest.fn()}
        analysisId="ana_test"
      />
    </BrowserRouter>
  );
};

test('filters recommendations by category and price', () => {
  render(<StatefulRecommendations />);

  expect(screen.getByText('Rose Lipstick')).toBeInTheDocument();
  expect(screen.getByText('Budget Blush')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: /blush/i }));
  expect(screen.queryByText('Rose Lipstick')).not.toBeInTheDocument();
  expect(screen.getByText('Budget Blush')).toBeInTheDocument();

  fireEvent.change(screen.getByLabelText(/price range/i), { target: { value: 'under-25' } });
  expect(screen.getByText('Budget Blush')).toBeInTheDocument();
});

test('filters recommendations by retailer', () => {
  render(<StatefulRecommendations />);

  fireEvent.change(screen.getByLabelText(/retailer/i), { target: { value: 'Sephora' } });

  expect(screen.getByText('Rose Lipstick')).toBeInTheDocument();
  expect(screen.queryByText('Budget Blush')).not.toBeInTheDocument();
});
