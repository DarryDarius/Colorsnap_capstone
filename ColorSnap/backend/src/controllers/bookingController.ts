import type { Request, Response } from 'express';
import { createBookingRecord, getBookingRecord } from '../services/storageService';
import type { BookingDuration } from '../types/commerce';
import { ApiError, toErrorResponse } from '../utils/errors';

const durations = new Set(['30', '45', '60']);

const getString = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

const ensureRequiredString = (body: Record<string, unknown>, key: string) => {
  const value = getString(body[key]);

  if (!value) {
    throw new ApiError(400, 'INVALID_BOOKING', `${key} is required.`);
  }

  return value;
};

export const createBooking = async (req: Request, res: Response) => {
  try {
    const body = req.body as Record<string, unknown>;
    const email = ensureRequiredString(body, 'email');
    const duration = ensureRequiredString(body, 'duration');

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new ApiError(400, 'INVALID_BOOKING', 'email must be valid.');
    }

    if (!durations.has(duration)) {
      throw new ApiError(400, 'INVALID_BOOKING', 'duration must be 30, 45, or 60.');
    }

    const booking = await createBookingRecord({
      user_id: req.user?.id,
      expert_id: ensureRequiredString(body, 'expert_id'),
      expert_name: ensureRequiredString(body, 'expert_name'),
      name: ensureRequiredString(body, 'name'),
      email,
      phone: getString(body.phone) || undefined,
      date: ensureRequiredString(body, 'date'),
      time: ensureRequiredString(body, 'time'),
      duration: duration as BookingDuration,
      message: getString(body.message) || undefined
    });

    res.status(201).json(booking);
  } catch (error) {
    const response = toErrorResponse(error);
    res.status(response.statusCode).json(response.body);
  }
};

export const fetchBooking = async (req: Request, res: Response) => {
  try {
    const booking = await getBookingRecord(req.params.booking_id);

    if (!booking) {
      throw new ApiError(404, 'BOOKING_NOT_FOUND', 'Booking was not found.');
    }

    if (booking.user_id && booking.user_id !== req.user?.id) {
      throw new ApiError(403, 'BOOKING_FORBIDDEN', 'You do not have access to this booking.');
    }

    res.json(booking);
  } catch (error) {
    const response = toErrorResponse(error);
    res.status(response.statusCode).json(response.body);
  }
};
