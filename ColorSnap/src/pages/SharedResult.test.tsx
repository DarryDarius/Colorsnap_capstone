import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import SharedResult from './SharedResult';
import * as api from '../services/api';

jest.mock('../services/api');

const mockedApi = api as jest.Mocked<typeof api>;

test('renders public shared result data', async () => {
  mockedApi.getShare.mockResolvedValue({
    share_id: 'shr_test',
    analysis_id: 'ana_test',
    visibility: 'unlisted',
    title: 'My ColorSnap Result: Warm Autumn',
    description: 'Warm, muted, earthy tones suit you best.',
    primary_season: 'Warm Autumn',
    secondary_season: 'Soft Autumn',
    palette: [
      { name: 'Terracotta', hex: '#C96A4A' }
    ],
    include_photo: false,
    image_url: null,
    share_url: '/share/shr_test',
    created_at: '2026-04-18T00:00:00.000Z'
  });

  render(
    <MemoryRouter initialEntries={['/share/shr_test']}>
      <Routes>
        <Route path="/share/:shareId" element={<SharedResult />} />
      </Routes>
    </MemoryRouter>
  );

  expect(await screen.findByRole('heading', { name: 'Warm Autumn' })).toBeInTheDocument();
  expect(screen.getByText('Terracotta')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /create your own analysis/i })).toHaveAttribute('href', '/analysis');
});
