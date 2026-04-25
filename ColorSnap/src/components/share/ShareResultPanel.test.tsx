import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ShareResultPanel from './ShareResultPanel';
import type { AnalysisResult } from '../../types/analysis';
import * as api from '../../services/api';
import * as shareUtils from '../../utils/share';

const analysis: AnalysisResult = {
  analysis_id: 'ana_test',
  status: 'completed',
  season_result: {
    primary: 'Warm Autumn',
    secondary: 'Soft Autumn',
    confidence: 0.78
  },
  summary: {
    headline: 'Warm Autumn',
    one_liner: 'Warm, muted, earthy tones suit you best.',
    explanations: []
  },
  recommended_palette: [
    { name: 'Terracotta', hex: '#C96A4A', use_case: 'lipstick' },
    { name: 'Olive', hex: '#7A8448', use_case: 'fashion' }
  ],
  products: [
    {
      id: 'lip_001',
      slug: 'brick-red',
      name: 'Brick Red Lipstick',
      brand: 'Example',
      category: 'lipstick',
      shade: 'Brick Red',
      image: '/images/pd1.jpg',
      short_description: 'A warm lipstick.',
      reason: 'Matches warmth.',
      url: '/products/brick-red',
      purchase_url: 'https://www.sephora.com/product/brick-red',
      score: 88,
      price: '25.00',
      currency: 'USD',
      best_for: ['Warm Autumn'],
      retailer_name: 'Sephora',
      badges: ['Warm Autumn']
    }
  ]
};

jest.mock('../../services/api');
jest.mock('../../utils/share');

const mockedApi = api as jest.Mocked<typeof api>;
const mockedShareUtils = shareUtils as jest.Mocked<typeof shareUtils>;

beforeEach(() => {
  jest.resetAllMocks();
  mockedApi.createSavedResult.mockResolvedValue({
    saved_result_id: 'save_test',
    analysis_id: 'ana_test',
    title: 'My ColorSnap Result: Warm Autumn',
    primary_season: 'Warm Autumn',
    secondary_season: 'Soft Autumn',
    palette: [],
    summary: 'Warm and muted.',
    include_photo: false,
    created_at: '2026-04-18T00:00:00.000Z'
  });
  mockedApi.createShare.mockResolvedValue({
    share_id: 'shr_test',
    analysis_id: 'ana_test',
    saved_result_id: 'save_test',
    visibility: 'unlisted',
    title: 'My ColorSnap Result: Warm Autumn',
    description: 'Warm and muted.',
    primary_season: 'Warm Autumn',
    secondary_season: 'Soft Autumn',
    palette: [],
    include_photo: false,
    image_url: null,
    share_url: '/share/shr_test',
    created_at: '2026-04-18T00:00:00.000Z'
  });
  mockedShareUtils.copyToClipboard.mockResolvedValue(undefined);
  mockedShareUtils.createShareCardBlob.mockResolvedValue(new Blob(['card'], { type: 'image/png' }));
  mockedShareUtils.shareWithNativeSheet.mockResolvedValue('shared');
});

test('saves analysis results from the share panel', async () => {
  render(<ShareResultPanel analysis={analysis} />);

  fireEvent.click(screen.getByRole('button', { name: /save result/i }));

  await waitFor(() => expect(mockedApi.createSavedResult).toHaveBeenCalledWith('ana_test', false));
  expect(await screen.findByText(/result saved/i)).toBeInTheDocument();
});

test('creates a share record and copies the public link', async () => {
  render(<ShareResultPanel analysis={analysis} />);

  fireEvent.click(screen.getByRole('button', { name: /copy link/i }));

  await waitFor(() => expect(mockedApi.createShare).toHaveBeenCalledWith(expect.objectContaining({
    analysis_id: 'ana_test',
    saved_result_id: 'save_test'
  })));
  expect(mockedShareUtils.copyToClipboard).toHaveBeenCalledWith('http://localhost/share/shr_test');
});
