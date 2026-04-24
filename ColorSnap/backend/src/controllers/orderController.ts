import type { Request, Response } from 'express';
import { createOrderRecord, getOrderRecord } from '../services/storageService';
import type { CurrencyCode, ProductCategory } from '../types/analysis';
import type { OrderItem } from '../types/commerce';
import { ApiError, toErrorResponse } from '../utils/errors';

const getString = (value: unknown, fallback = '') => (typeof value === 'string' ? value.trim() : fallback);

const normalizeOrderItem = (value: unknown): OrderItem => {
  if (typeof value !== 'object' || value === null) {
    throw new ApiError(400, 'INVALID_ORDER', 'items must contain product objects.');
  }

  const record = value as Record<string, unknown>;
  const id = getString(record.id);
  const name = getString(record.name);
  const price = getString(record.price);
  const quantity = typeof record.quantity === 'number' && Number.isFinite(record.quantity)
    ? Math.floor(record.quantity)
    : 0;

  if (!id || !name || !price || quantity <= 0) {
    throw new ApiError(400, 'INVALID_ORDER', 'Each item requires id, name, price, and quantity.');
  }

  if (!Number.isFinite(parseFloat(price))) {
    throw new ApiError(400, 'INVALID_ORDER', 'Item price must be numeric.');
  }

  return {
    id,
    slug: getString(record.slug) || undefined,
    name,
    brand: getString(record.brand) || undefined,
    category: getString(record.category) as ProductCategory || undefined,
    shade: getString(record.shade) || undefined,
    price,
    currency: getString(record.currency, 'USD') as CurrencyCode,
    image: getString(record.image) || undefined,
    quantity,
    retailerName: getString(record.retailerName) || undefined,
    purchaseUrl: getString(record.purchaseUrl) || undefined
  };
};

export const createOrder = async (req: Request, res: Response) => {
  try {
    const body = req.body as Record<string, unknown>;
    const email = getString(body.email);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new ApiError(400, 'INVALID_ORDER', 'email must be valid.');
    }

    if (!Array.isArray(body.items) || body.items.length === 0) {
      throw new ApiError(400, 'INVALID_ORDER', 'items must include at least one product.');
    }

    const items = body.items.map((item) => normalizeOrderItem(item));
    const total = items
      .reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0)
      .toFixed(2);

    const order = await createOrderRecord({
      user_id: req.user?.id,
      email,
      items,
      total,
      currency: 'USD'
    });

    res.status(201).json(order);
  } catch (error) {
    const response = toErrorResponse(error);
    res.status(response.statusCode).json(response.body);
  }
};

export const fetchOrder = async (req: Request, res: Response) => {
  try {
    const order = await getOrderRecord(req.params.order_id);

    if (!order) {
      throw new ApiError(404, 'ORDER_NOT_FOUND', 'Order was not found.');
    }

    if (order.user_id && order.user_id !== req.user?.id) {
      throw new ApiError(403, 'ORDER_FORBIDDEN', 'You do not have access to this order.');
    }

    res.json(order);
  } catch (error) {
    const response = toErrorResponse(error);
    res.status(response.statusCode).json(response.body);
  }
};
