import { createBooking, createDemoOrder } from './api';
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
