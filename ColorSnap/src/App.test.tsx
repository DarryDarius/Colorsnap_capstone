import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the ColorSnap home route and navigation', () => {
  render(<App />);

  expect(screen.getByRole('link', { name: 'ColorSnap' })).toBeInTheDocument();
  expect(screen.getAllByRole('link', { name: 'Start Analysis' }).length).toBeGreaterThan(0);
  expect(screen.getByRole('heading', { name: /discover your signature colors/i })).toBeInTheDocument();
});
