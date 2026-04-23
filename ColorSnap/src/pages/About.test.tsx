import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import About from './About';

test('renders the about page hero and key calls to action', () => {
  render(
    <BrowserRouter>
      <About />
    </BrowserRouter>
  );

  expect(
    screen.getByRole('heading', {
      name: /ai color analysis with a practical path into beauty, wardrobe, and shopping choices/i
    })
  ).toBeInTheDocument();
  expect(screen.getAllByRole('link', { name: /start analysis/i }).length).toBeGreaterThan(0);
  expect(screen.getByRole('link', { name: /meet the consultants/i })).toHaveAttribute('href', '/consultation');
});
