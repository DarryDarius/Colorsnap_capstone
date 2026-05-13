import {
  createAnalysis,
  createBooking,
  createDemoOrder,
  createSavedResult,
  createShare,
  addProductToSavedLook,
  deleteSavedLook,
  getSavedLooks,
  getShare,
  loginWithGoogle,
  saveBeautyPreferences,
  updateSavedLook
} from './api';
import type { ProductRecommendation } from '../types/analysis';
import type { CartItem } from '../utils/cart';

const mockFetch = jest.fn();

beforeEach(() => {
  mockFetch.mockReset();
  Object.assign(global, {
    fetch: mockFetch
  });
});

test('createBooking posts booking data to the backend', async () => {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      booking_id: 'book_test',
      status: 'requested',
      expert_id: 'ex1',
      expert_name: 'Yuna Lee',
      name: 'Test User',
      email: 'test@example.com',
      date: '2026-05-01',
      time: '10:00',
      duration: '30',
      created_at: '2026-04-18T00:00:00.000Z'
    })
  });

  const booking = await createBooking({
    expert_id: 'ex1',
    expert_name: 'Yuna Lee',
    name: 'Test User',
    email: 'test@example.com',
    date: '2026-05-01',
    time: '10:00',
    duration: '30'
  });

  expect(booking.booking_id).toBe('book_test');
  expect(mockFetch).toHaveBeenCalledWith('/api/v1/bookings', expect.objectContaining({
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  }));
  expect(JSON.parse(mockFetch.mock.calls[0][1].body)).toMatchObject({
    expert_id: 'ex1',
    email: 'test@example.com'
  });
});

test('createAnalysis posts camera source with the image file', async () => {
  const image = new File(['image-data'], 'selfie.jpg', { type: 'image/jpeg' });

  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      analysis_id: 'ana_test',
      status: 'processing',
      created_at: '2026-04-18T00:00:00.000Z',
      poll_url: '/api/v1/analyses/ana_test'
    })
  });

  const response = await createAnalysis(image, 'camera');
  const body = mockFetch.mock.calls[0][1].body as FormData;

  expect(response.analysis_id).toBe('ana_test');
  expect(mockFetch).toHaveBeenCalledWith('/api/v1/analyses', expect.objectContaining({
    method: 'POST'
  }));
  expect(body.get('image')).toBe(image);
  expect(body.get('source')).toBe('camera');
});

test('createDemoOrder posts cart items to the backend', async () => {
  const item: CartItem = {
    id: 'lip_001',
    slug: 'clinique-almost-lipstick-black-honey',
    name: 'Almost Lipstick in Black Honey',
    brand: 'Clinique',
    category: 'lipstick',
    shade: 'Black Honey',
    price: '25.00',
    currency: 'USD',
    image: '/images/pd1.jpg',
    description: 'A sheer berry tint.',
    quantity: 1,
    source: 'recommendation',
    addedAt: '2026-04-18T00:00:00.000Z'
  };

  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      order_id: 'ord_test',
      status: 'confirmed',
      demo: true,
      email: 'test@example.com',
      items: [item],
      total: '25.00',
      currency: 'USD',
      created_at: '2026-04-18T00:00:00.000Z'
    })
  });

  const order = await createDemoOrder('test@example.com', [item]);

  expect(order.order_id).toBe('ord_test');
  expect(mockFetch).toHaveBeenCalledWith('/api/v1/orders', expect.objectContaining({
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  }));
  expect(JSON.parse(mockFetch.mock.calls[0][1].body)).toMatchObject({
    email: 'test@example.com',
    items: [expect.objectContaining({ id: 'lip_001' })]
  });
});

test('createSavedResult posts analysis id and privacy setting', async () => {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      saved_result_id: 'save_test',
      analysis_id: 'ana_test',
      title: 'My ColorSnap Result: Warm Autumn',
      primary_season: 'Warm Autumn',
      secondary_season: 'Soft Autumn',
      palette: [],
      summary: 'Warm and muted.',
      include_photo: false,
      created_at: '2026-04-18T00:00:00.000Z'
    })
  });

  const savedResult = await createSavedResult('ana_test', false);

  expect(savedResult.saved_result_id).toBe('save_test');
  expect(mockFetch).toHaveBeenCalledWith('/api/v1/saved-results', expect.objectContaining({
    method: 'POST'
  }));
  expect(JSON.parse(mockFetch.mock.calls[0][1].body)).toMatchObject({
    analysis_id: 'ana_test',
    include_photo: false
  });
});

test('createShare posts saved result context and getShare fetches by id', async () => {
  mockFetch
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({
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
      })
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        share_id: 'shr_test',
        analysis_id: 'ana_test',
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
      })
    });

  const share = await createShare({
    analysis_id: 'ana_test',
    saved_result_id: 'save_test',
    include_photo: false
  });
  const fetchedShare = await getShare('shr_test');

  expect(share.share_url).toBe('/share/shr_test');
  expect(fetchedShare.share_id).toBe('shr_test');
  expect(mockFetch).toHaveBeenNthCalledWith(1, '/api/v1/shares', expect.objectContaining({
    method: 'POST'
  }));
  expect(mockFetch).toHaveBeenNthCalledWith(2, '/api/v1/shares/shr_test');
});

test('loginWithGoogle posts the Google credential to the auth endpoint', async () => {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      user: {
        id: 'usr_google',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user'
      },
      token: 'jwt_test'
    })
  });

  const response = await loginWithGoogle('google-id-token');

  expect(response.token).toBe('jwt_test');
  expect(mockFetch).toHaveBeenCalledWith('/api/v1/auth/google', expect.objectContaining({
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  }));
  expect(JSON.parse(mockFetch.mock.calls[0][1].body)).toMatchObject({
    credential: 'google-id-token'
  });
});

test('saveBeautyPreferences posts preference data and receives personalized products', async () => {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      preference: {
        preference_id: 'pref_test',
        analysis_id: 'ana_test',
        makeup_style: 'natural',
        budget_range: 'drugstore',
        shopping_goal: 'lipstick',
        preferred_finishes: ['satin'],
        preferred_brands: ['NYX'],
        avoid_colors: ['orange'],
        created_at: '2026-04-18T00:00:00.000Z',
        updated_at: '2026-04-18T00:00:00.000Z'
      },
      products: []
    })
  });

  const response = await saveBeautyPreferences({
    analysis_id: 'ana_test',
    makeup_style: 'natural',
    budget_range: 'drugstore',
    shopping_goal: 'lipstick',
    preferred_finishes: ['satin'],
    preferred_brands: ['NYX'],
    avoid_colors: ['orange']
  });

  expect(response.preference.preference_id).toBe('pref_test');
  expect(mockFetch).toHaveBeenCalledWith('/api/v1/preferences', expect.objectContaining({
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  }));
  expect(JSON.parse(mockFetch.mock.calls[0][1].body)).toMatchObject({
    analysis_id: 'ana_test',
    makeup_style: 'natural',
    budget_range: 'drugstore',
    shopping_goal: 'lipstick',
    preferred_finishes: ['satin'],
    preferred_brands: ['NYX'],
    avoid_colors: ['orange']
  });
});

test('saved look helpers call the saved look API', async () => {
  const product: ProductRecommendation = {
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
  };

  mockFetch
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        look_id: 'look_test',
        analysis_id: 'ana_test',
        name: 'Personalized Color Look',
        occasion: 'Everyday',
        products: [product],
        created_at: '2026-04-18T00:00:00.000Z',
        updated_at: '2026-04-18T00:00:00.000Z'
      })
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ items: [] })
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        look_id: 'look_test',
        analysis_id: 'ana_test',
        name: 'Work Look',
        occasion: 'Office',
        products: [product],
        created_at: '2026-04-18T00:00:00.000Z',
        updated_at: '2026-04-18T00:00:00.000Z'
      })
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({})
    });

  await addProductToSavedLook({ analysis_id: 'ana_test', product });
  await getSavedLooks('ana_test');
  await updateSavedLook('look_test', { name: 'Work Look', occasion: 'Office' });
  await deleteSavedLook('look_test');

  expect(mockFetch).toHaveBeenNthCalledWith(1, '/api/v1/saved-looks/products', expect.objectContaining({
    method: 'POST'
  }));
  expect(JSON.parse(mockFetch.mock.calls[0][1].body)).toMatchObject({
    analysis_id: 'ana_test',
    product: expect.objectContaining({ id: 'lip_001' })
  });
  expect(mockFetch).toHaveBeenNthCalledWith(2, '/api/v1/saved-looks?analysis_id=ana_test', expect.any(Object));
  expect(mockFetch).toHaveBeenNthCalledWith(3, '/api/v1/saved-looks/look_test', expect.objectContaining({
    method: 'PATCH'
  }));
  expect(mockFetch).toHaveBeenNthCalledWith(4, '/api/v1/saved-looks/look_test', expect.objectContaining({
    method: 'DELETE'
  }));
});
