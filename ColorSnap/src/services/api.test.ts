import { createBooking, createDemoOrder, createSavedResult, createShare, getShare, loginWithGoogle } from './api';
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
