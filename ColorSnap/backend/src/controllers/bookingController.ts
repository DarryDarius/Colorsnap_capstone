import type { Request, Response } from 'express';
import { createBookingRecord, getAnalysis, getBookingRecord, getSavedLookRecord } from '../services/storageService';
import type { BookingAddOn, BookingDuration, BookingSessionType } from '../types/commerce';
import { ApiError, toErrorResponse } from '../utils/errors';

const durations = new Set(['30', '45', '60']);
const sessionTypes = new Set(['video', 'in_person', 'written_review']);
const addOns = new Set(['wardrobe_review', 'makeup_audit']);

const getString = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

const ensureRequiredString = (body: Record<string, unknown>, key: string) => {
  const value = getString(body[key]);

  if (!value) {
    throw new ApiError(400, 'INVALID_BOOKING', `${key} is required.`);
  }

  return value;
};

const getOptionalStringList = (body: Record<string, unknown>, key: string, allowedValues: Set<string>) => {
  const rawValue = body[key];

  if (!Array.isArray(rawValue)) {
    return undefined;
  }

  const values = rawValue
    .filter((value): value is string => typeof value === 'string')
    .map((value) => value.trim())
    .filter(Boolean);

  if (values.some((value) => !allowedValues.has(value))) {
    throw new ApiError(400, 'INVALID_BOOKING', `${key} contains an unsupported value.`);
  }

  return values;
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

    const sessionType = getString(body.session_type) || undefined;
    if (sessionType && !sessionTypes.has(sessionType)) {
      throw new ApiError(400, 'INVALID_BOOKING', 'session_type must be video, in_person, or written_review.');
    }

    const analysisId = getString(body.analysis_id) || undefined;
    if (analysisId) {
      const analysis = await getAnalysis(analysisId);

      if (!analysis || analysis.status !== 'completed') {
        throw new ApiError(400, 'INVALID_BOOKING', 'analysis_id must reference a completed analysis.');
      }
    }

    const savedLookId = getString(body.saved_look_id) || undefined;
    if (savedLookId) {
      const savedLook = await getSavedLookRecord(savedLookId);

      if (!savedLook) {
        throw new ApiError(400, 'INVALID_BOOKING', 'saved_look_id must reference an existing saved look.');
      }

      if (savedLook.user_id && savedLook.user_id !== req.user?.id) {
        throw new ApiError(403, 'BOOKING_FORBIDDEN', 'You do not have access to this saved look.');
      }
    }

    const booking = await createBookingRecord({
      user_id: req.user?.id,
      analysis_id: analysisId,
      saved_look_id: savedLookId,
      expert_id: ensureRequiredString(body, 'expert_id'),
      expert_name: ensureRequiredString(body, 'expert_name'),
      name: ensureRequiredString(body, 'name'),
      email,
      phone: getString(body.phone) || undefined,
      date: ensureRequiredString(body, 'date'),
      time: ensureRequiredString(body, 'time'),
      duration: duration as BookingDuration,
      timezone: getString(body.timezone) || undefined,
      session_type: sessionType as BookingSessionType | undefined,
      add_ons: getOptionalStringList(body, 'add_ons', addOns) as BookingAddOn[] | undefined,
      estimated_price: getString(body.estimated_price) || undefined,
      user_questions: getString(body.user_questions) || undefined,
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
