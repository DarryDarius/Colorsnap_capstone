import fs from 'fs';
import path from 'path';
import type { AnalysisResult } from '../types/analysis';
import type { BookingRecord, OrderRecord } from '../types/commerce';
import type { SavedResultRecord, ShareRecord } from '../types/share';

const analyses = new Map<string, AnalysisResult>();
const bookings = new Map<string, BookingRecord>();
const orders = new Map<string, OrderRecord>();
const savedResults = new Map<string, SavedResultRecord>();
const shares = new Map<string, ShareRecord>();
const storageDirectory = path.resolve(__dirname, '../../.data');
const analysesFilePath = path.join(storageDirectory, 'analyses.json');
const bookingsFilePath = path.join(storageDirectory, 'bookings.json');
const ordersFilePath = path.join(storageDirectory, 'orders.json');
const savedResultsFilePath = path.join(storageDirectory, 'saved-results.json');
const sharesFilePath = path.join(storageDirectory, 'shares.json');

const persistMap = <T>(filePath: string, records: Map<string, T>) => {
  fs.mkdirSync(storageDirectory, { recursive: true });
  fs.writeFileSync(
    filePath,
    JSON.stringify(Object.fromEntries(records.entries()), null, 2),
    'utf8'
  );
};

const hydrateMap = <T>(filePath: string, records: Map<string, T>, label: string) => {
  try {
    if (!fs.existsSync(filePath)) {
      return;
    }

    const rawContent = fs.readFileSync(filePath, 'utf8').trim();
    if (!rawContent) {
      return;
    }

    const parsed = JSON.parse(rawContent) as Record<string, T>;

    for (const [recordId, record] of Object.entries(parsed)) {
      records.set(recordId, record);
    }
  } catch (error) {
    console.warn(`[ColorSnap] Failed to hydrate stored ${label}.`, error);
  }
};

const createRecordId = (prefix: string) => {
  const timestamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${timestamp}_${random}`;
};

const persistAnalyses = () => persistMap(analysesFilePath, analyses);
const persistBookings = () => persistMap(bookingsFilePath, bookings);
const persistOrders = () => persistMap(ordersFilePath, orders);
const persistSavedResults = () => persistMap(savedResultsFilePath, savedResults);
const persistShares = () => persistMap(sharesFilePath, shares);

hydrateMap(analysesFilePath, analyses, 'analyses');
hydrateMap(bookingsFilePath, bookings, 'bookings');
hydrateMap(ordersFilePath, orders, 'orders');
hydrateMap(savedResultsFilePath, savedResults, 'saved results');
hydrateMap(sharesFilePath, shares, 'shares');

export const createProcessingAnalysis = () => {
  const analysis: AnalysisResult = {
    analysis_id: createRecordId('ana'),
    status: 'processing',
    created_at: new Date().toISOString()
  };

  analyses.set(analysis.analysis_id, analysis);
  persistAnalyses();
  return analysis;
};

export const getAnalysis = (analysisId: string) => {
  return analyses.get(analysisId) || null;
};

export const completeAnalysis = (
  analysisId: string,
  result: Omit<AnalysisResult, 'analysis_id' | 'status' | 'created_at' | 'completed_at'>
) => {
  const current = analyses.get(analysisId);
  if (!current) return null;

  const completed: AnalysisResult = {
    ...current,
    ...result,
    status: 'completed',
    completed_at: new Date().toISOString()
  };

  analyses.set(analysisId, completed);
  persistAnalyses();
  return completed;
};

export const failAnalysis = (analysisId: string, code: string, message: string) => {
  const current = analyses.get(analysisId);
  if (!current) return null;

  const failed: AnalysisResult = {
    ...current,
    status: 'failed',
    completed_at: new Date().toISOString(),
    error: {
      code,
      message
    }
  };

  analyses.set(analysisId, failed);
  persistAnalyses();
  return failed;
};

export const getStoredAnalysisCount = () => analyses.size;

export const createBookingRecord = (
  input: Omit<BookingRecord, 'booking_id' | 'status' | 'created_at'>
) => {
  const booking: BookingRecord = {
    ...input,
    booking_id: createRecordId('book'),
    status: 'requested',
    created_at: new Date().toISOString()
  };

  bookings.set(booking.booking_id, booking);
  persistBookings();
  return booking;
};

export const getBookingRecord = (bookingId: string) => {
  return bookings.get(bookingId) || null;
};

export const createOrderRecord = (
  input: Omit<OrderRecord, 'order_id' | 'status' | 'demo' | 'created_at'>
) => {
  const order: OrderRecord = {
    ...input,
    order_id: createRecordId('ord'),
    status: 'confirmed',
    demo: true,
    created_at: new Date().toISOString()
  };

  orders.set(order.order_id, order);
  persistOrders();
  return order;
};

export const getOrderRecord = (orderId: string) => {
  return orders.get(orderId) || null;
};

export const getStoredBookingCount = () => bookings.size;
export const getStoredOrderCount = () => orders.size;

export const createSavedResultRecord = (
  input: Omit<SavedResultRecord, 'saved_result_id' | 'created_at'>
) => {
  const savedResult: SavedResultRecord = {
    ...input,
    saved_result_id: createRecordId('save'),
    created_at: new Date().toISOString()
  };

  savedResults.set(savedResult.saved_result_id, savedResult);
  persistSavedResults();
  return savedResult;
};

export const getSavedResultRecord = (savedResultId: string) => {
  return savedResults.get(savedResultId) || null;
};

export const createShareRecord = (
  input: Omit<ShareRecord, 'share_id' | 'share_url' | 'created_at'>
) => {
  const shareId = createRecordId('shr');
  const share: ShareRecord = {
    ...input,
    share_id: shareId,
    share_url: `/share/${shareId}`,
    created_at: new Date().toISOString()
  };

  shares.set(share.share_id, share);
  persistShares();
  return share;
};

export const getShareRecord = (shareId: string) => {
  return shares.get(shareId) || null;
};

export const getStoredSavedResultCount = () => savedResults.size;
export const getStoredShareCount = () => shares.size;
