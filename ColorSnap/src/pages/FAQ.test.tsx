import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import FAQ from './FAQ';

test('toggles faq items open and closed', () => {
  render(
    <BrowserRouter>
      <FAQ />
    </BrowserRouter>
  );

  const qualityButton = screen.getByRole('button', { name: /how accurate is the ai color analysis/i });
  const checkoutButton = screen.getByRole('button', { name: /is checkout real/i });

  expect(qualityButton).toHaveAttribute('aria-expanded', 'true');
  expect(checkoutButton).toHaveAttribute('aria-expanded', 'false');

  fireEvent.click(checkoutButton);
  expect(checkoutButton).toHaveAttribute('aria-expanded', 'true');

  fireEvent.click(qualityButton);
  expect(qualityButton).toHaveAttribute('aria-expanded', 'false');
});
