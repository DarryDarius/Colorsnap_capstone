import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import type { AnalysisFeedback, AnalysisResult } from '../types/analysis';
import type { BookingRecord, OrderRecord } from '../types/commerce';
import type { SavedResultRecord, ShareRecord } from '../types/share';

const storageDirectory = path.resolve(__dirname, '../../.data');
const databasePath = path.join(storageDirectory, 'colorsnap.db').replace(/\\/g, '/');

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = `file:${databasePath}`;
}

fs.mkdirSync(storageDirectory, { recursive: true });

const prisma = new PrismaClient();
let schemaReadyPromise: Promise<void> | null = null;

const createRecordId = (prefix: string) => {
  const timestamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${timestamp}_${random}`;
};

const nowIso = () => new Date().toISOString();

const stringify = (value: unknown) => JSON.stringify(value);

const parseJson = <T>(value: string | null | undefined): T | undefined => {
  if (!value) {
    return undefined;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return undefined;
  }
};

export const ensureDatabaseReady = async () => {
  if (!schemaReadyPromise) {
    schemaReadyPromise = (async () => {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "User" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "email" TEXT NOT NULL UNIQUE,
          "passwordHash" TEXT NOT NULL,
          "name" TEXT,
          "role" TEXT NOT NULL DEFAULT 'user',
          "createdAt" TEXT NOT NULL,
          "updatedAt" TEXT NOT NULL
        )
      `);
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Analysis" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "userId" TEXT,
          "status" TEXT NOT NULL,
          "source" TEXT,
          "imageQualityJson" TEXT,
          "qualityAssessmentJson" TEXT,
          "seasonResultJson" TEXT,
          "attributesJson" TEXT,
          "evidenceJson" TEXT,
          "criticJson" TEXT,
          "summaryJson" TEXT,
          "recommendedPaletteJson" TEXT,
          "beautyRecommendationsJson" TEXT,
          "fashionRecommendationsJson" TEXT,
          "productsJson" TEXT,
          "betaFeaturesJson" TEXT,
          "errorJson" TEXT,
          "createdAt" TEXT NOT NULL,
          "completedAt" TEXT,
          "updatedAt" TEXT NOT NULL
        )
      `);
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "AnalysisFeedback" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "analysisId" TEXT NOT NULL,
          "userId" TEXT,
          "rating" INTEGER NOT NULL,
          "issueTagsJson" TEXT NOT NULL,
          "userNote" TEXT,
          "createdAt" TEXT NOT NULL
        )
      `);
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "SavedResult" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "userId" TEXT,
          "analysisId" TEXT NOT NULL,
          "title" TEXT NOT NULL,
          "primarySeason" TEXT NOT NULL,
          "secondarySeason" TEXT,
          "confidence" REAL,
          "paletteJson" TEXT NOT NULL,
          "summary" TEXT NOT NULL,
          "includePhoto" BOOLEAN NOT NULL DEFAULT false,
          "createdAt" TEXT NOT NULL
        )
      `);
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "ShareRecord" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "userId" TEXT,
          "analysisId" TEXT NOT NULL,
          "savedResultId" TEXT,
          "visibility" TEXT NOT NULL DEFAULT 'unlisted',
          "title" TEXT NOT NULL,
          "description" TEXT NOT NULL,
          "primarySeason" TEXT NOT NULL,
          "secondarySeason" TEXT,
          "paletteJson" TEXT NOT NULL,
          "includePhoto" BOOLEAN NOT NULL DEFAULT false,
          "imageUrl" TEXT,
          "shareUrl" TEXT NOT NULL,
          "disabledAt" TEXT,
          "expiresAt" TEXT,
          "createdAt" TEXT NOT NULL
        )
      `);
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Booking" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "userId" TEXT,
          "expertId" TEXT NOT NULL,
          "expertName" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "email" TEXT NOT NULL,
          "phone" TEXT,
          "date" TEXT NOT NULL,
          "time" TEXT NOT NULL,
          "duration" TEXT NOT NULL,
          "message" TEXT,
          "status" TEXT NOT NULL,
          "createdAt" TEXT NOT NULL
        )
      `);
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Order" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "userId" TEXT,
          "status" TEXT NOT NULL,
          "demo" BOOLEAN NOT NULL DEFAULT true,
          "email" TEXT NOT NULL,
          "total" TEXT NOT NULL,
          "currency" TEXT NOT NULL,
          "createdAt" TEXT NOT NULL
        )
      `);
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "OrderItem" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "orderId" TEXT NOT NULL,
          "productId" TEXT NOT NULL,
          "slug" TEXT,
          "name" TEXT NOT NULL,
          "brand" TEXT,
          "category" TEXT,
          "shade" TEXT,
          "price" TEXT NOT NULL,
          "currency" TEXT NOT NULL,
          "image" TEXT,
          "quantity" INTEGER NOT NULL,
          "retailerName" TEXT,
          "purchaseUrl" TEXT
        )
      `);
    })();
  }

  return schemaReadyPromise;
};

type AnalysisRow = Awaited<ReturnType<typeof prisma.analysis.findUnique>>;
type FeedbackRow = Awaited<ReturnType<typeof prisma.analysisFeedback.findFirst>>;
type SavedResultRow = Awaited<ReturnType<typeof prisma.savedResult.findUnique>>;
type ShareRow = Awaited<ReturnType<typeof prisma.shareRecord.findUnique>>;
type BookingRow = Awaited<ReturnType<typeof prisma.booking.findUnique>>;
type OrderRow = Awaited<ReturnType<typeof prisma.order.findUnique>>;

const toAnalysisResult = (row: NonNullable<AnalysisRow>): AnalysisResult => ({
  analysis_id: row.id,
  status: row.status as AnalysisResult['status'],
  created_at: row.createdAt,
  completed_at: row.completedAt || undefined,
  image_quality: parseJson<AnalysisResult['image_quality']>(row.imageQualityJson),
  quality_assessment: parseJson<AnalysisResult['quality_assessment']>(row.qualityAssessmentJson),
  season_result: parseJson<AnalysisResult['season_result']>(row.seasonResultJson),
  attributes: parseJson<AnalysisResult['attributes']>(row.attributesJson),
  evidence: parseJson<AnalysisResult['evidence']>(row.evidenceJson),
  critic: parseJson<AnalysisResult['critic']>(row.criticJson),
  summary: parseJson<AnalysisResult['summary']>(row.summaryJson),
  recommended_palette: parseJson<AnalysisResult['recommended_palette']>(row.recommendedPaletteJson),
  beauty_recommendations: parseJson<AnalysisResult['beauty_recommendations']>(row.beautyRecommendationsJson),
  fashion_recommendations: parseJson<AnalysisResult['fashion_recommendations']>(row.fashionRecommendationsJson),
  products: parseJson<AnalysisResult['products']>(row.productsJson),
  beta_features: parseJson<AnalysisResult['beta_features']>(row.betaFeaturesJson),
  error: parseJson<AnalysisResult['error']>(row.errorJson)
});

const toFeedbackRecord = (row: NonNullable<FeedbackRow>): AnalysisFeedback => ({
  feedback_id: row.id,
  analysis_id: row.analysisId,
  rating: row.rating as AnalysisFeedback['rating'],
  issue_tags: parseJson<AnalysisFeedback['issue_tags']>(row.issueTagsJson) || [],
  user_note: row.userNote || undefined,
  created_at: row.createdAt
});

const toSavedResultRecord = (row: NonNullable<SavedResultRow>): SavedResultRecord => ({
  saved_result_id: row.id,
  analysis_id: row.analysisId,
  user_id: row.userId || undefined,
  title: row.title,
  primary_season: row.primarySeason as SavedResultRecord['primary_season'],
  secondary_season: row.secondarySeason as SavedResultRecord['secondary_season'],
  confidence: row.confidence || undefined,
  palette: parseJson<SavedResultRecord['palette']>(row.paletteJson) || [],
  summary: row.summary,
  include_photo: row.includePhoto,
  created_at: row.createdAt
});

const toShareRecord = (row: NonNullable<ShareRow>): ShareRecord => ({
  share_id: row.id,
  analysis_id: row.analysisId,
  user_id: row.userId || undefined,
  saved_result_id: row.savedResultId || undefined,
  visibility: 'unlisted',
  title: row.title,
  description: row.description,
  primary_season: row.primarySeason as ShareRecord['primary_season'],
  secondary_season: row.secondarySeason as ShareRecord['secondary_season'],
  palette: parseJson<ShareRecord['palette']>(row.paletteJson) || [],
  include_photo: row.includePhoto,
  image_url: row.imageUrl,
  share_url: row.shareUrl,
  created_at: row.createdAt
});

const toBookingRecord = (row: NonNullable<BookingRow>): BookingRecord => ({
  booking_id: row.id,
  user_id: row.userId || undefined,
  expert_id: row.expertId,
  expert_name: row.expertName,
  name: row.name,
  email: row.email,
  phone: row.phone || undefined,
  date: row.date,
  time: row.time,
  duration: row.duration as BookingRecord['duration'],
  message: row.message || undefined,
  status: 'requested',
  created_at: row.createdAt
});

const toOrderRecord = (row: NonNullable<OrderRow> & { items?: Array<{
  productId: string;
  slug: string | null;
  name: string;
  brand: string | null;
  category: string | null;
  shade: string | null;
  price: string;
  currency: string;
  image: string | null;
  quantity: number;
  retailerName: string | null;
  purchaseUrl: string | null;
}> }): OrderRecord => ({
  order_id: row.id,
  user_id: row.userId || undefined,
  status: 'confirmed',
  demo: true,
  email: row.email,
  total: row.total,
  currency: row.currency as OrderRecord['currency'],
  created_at: row.createdAt,
  items: (row.items || []).map((item) => ({
    id: item.productId,
    slug: item.slug || undefined,
    name: item.name,
    brand: item.brand || undefined,
    category: item.category as OrderRecord['items'][number]['category'],
    shade: item.shade || undefined,
    price: item.price,
    currency: item.currency as OrderRecord['items'][number]['currency'],
    image: item.image || undefined,
    quantity: item.quantity,
    retailerName: item.retailerName || undefined,
    purchaseUrl: item.purchaseUrl || undefined
  }))
});

export const createProcessingAnalysis = async (
  userId?: string | null,
  source: 'upload' | 'camera' | 'web' = 'web'
) => {
  await ensureDatabaseReady();
  const timestamp = nowIso();
  const analysis = await prisma.analysis.create({
    data: {
      id: createRecordId('ana'),
      userId: userId || null,
      status: 'processing',
      source,
      createdAt: timestamp,
      updatedAt: timestamp
    }
  });

  return toAnalysisResult(analysis);
};

export const getAnalysis = async (analysisId: string) => {
  await ensureDatabaseReady();
  const analysis = await prisma.analysis.findUnique({
    where: { id: analysisId }
  });

  return analysis ? toAnalysisResult(analysis) : null;
};

export const completeAnalysis = async (
  analysisId: string,
  result: Omit<AnalysisResult, 'analysis_id' | 'status' | 'created_at' | 'completed_at'>
) => {
  await ensureDatabaseReady();
  const current = await prisma.analysis.findUnique({
    where: { id: analysisId }
  });

  if (!current) return null;

  const completed = await prisma.analysis.update({
    where: { id: analysisId },
    data: {
      status: 'completed',
      imageQualityJson: result.image_quality ? stringify(result.image_quality) : null,
      qualityAssessmentJson: result.quality_assessment ? stringify(result.quality_assessment) : null,
      seasonResultJson: result.season_result ? stringify(result.season_result) : null,
      attributesJson: result.attributes ? stringify(result.attributes) : null,
      evidenceJson: result.evidence ? stringify(result.evidence) : null,
      criticJson: result.critic ? stringify(result.critic) : null,
      summaryJson: result.summary ? stringify(result.summary) : null,
      recommendedPaletteJson: result.recommended_palette ? stringify(result.recommended_palette) : null,
      beautyRecommendationsJson: result.beauty_recommendations ? stringify(result.beauty_recommendations) : null,
      fashionRecommendationsJson: result.fashion_recommendations ? stringify(result.fashion_recommendations) : null,
      productsJson: result.products ? stringify(result.products) : null,
      betaFeaturesJson: result.beta_features ? stringify(result.beta_features) : null,
      errorJson: null,
      completedAt: nowIso(),
      updatedAt: nowIso()
    }
  });

  return toAnalysisResult(completed);
};

export const failAnalysis = async (analysisId: string, code: string, message: string) => {
  await ensureDatabaseReady();
  const current = await prisma.analysis.findUnique({
    where: { id: analysisId }
  });

  if (!current) return null;

  const failed = await prisma.analysis.update({
    where: { id: analysisId },
    data: {
      status: 'failed',
      completedAt: nowIso(),
      updatedAt: nowIso(),
      errorJson: stringify({ code, message })
    }
  });

  return toAnalysisResult(failed);
};

export const getStoredAnalysisCount = async () => {
  await ensureDatabaseReady();
  return prisma.analysis.count();
};

export const createBookingRecord = async (
  input: Omit<BookingRecord, 'booking_id' | 'status' | 'created_at'>
) => {
  await ensureDatabaseReady();
  const booking = await prisma.booking.create({
    data: {
      id: createRecordId('book'),
      userId: input.user_id || null,
      expertId: input.expert_id,
      expertName: input.expert_name,
      name: input.name,
      email: input.email,
      phone: input.phone || null,
      date: input.date,
      time: input.time,
      duration: input.duration,
      message: input.message || null,
      status: 'requested',
      createdAt: nowIso()
    }
  });

  return toBookingRecord(booking);
};

export const getBookingRecord = async (bookingId: string) => {
  await ensureDatabaseReady();
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId }
  });

  return booking ? toBookingRecord(booking) : null;
};

export const createOrderRecord = async (
  input: Omit<OrderRecord, 'order_id' | 'status' | 'demo' | 'created_at'>
) => {
  await ensureDatabaseReady();
  const order = await prisma.order.create({
    data: {
      id: createRecordId('ord'),
      userId: input.user_id || null,
      status: 'confirmed',
      demo: true,
      email: input.email,
      total: input.total,
      currency: input.currency,
      createdAt: nowIso(),
      items: {
        create: input.items.map((item) => ({
          id: createRecordId('item'),
          productId: item.id,
          slug: item.slug || null,
          name: item.name,
          brand: item.brand || null,
          category: item.category || null,
          shade: item.shade || null,
          price: item.price,
          currency: item.currency,
          image: item.image || null,
          quantity: item.quantity,
          retailerName: item.retailerName || null,
          purchaseUrl: item.purchaseUrl || null
        }))
      }
    },
    include: {
      items: true
    }
  });

  return toOrderRecord(order);
};

export const getOrderRecord = async (orderId: string) => {
  await ensureDatabaseReady();
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true
    }
  });

  return order ? toOrderRecord(order) : null;
};

export const getStoredBookingCount = async () => {
  await ensureDatabaseReady();
  return prisma.booking.count();
};
export const getStoredOrderCount = async () => {
  await ensureDatabaseReady();
  return prisma.order.count();
};

export const createSavedResultRecord = async (
  input: Omit<SavedResultRecord, 'saved_result_id' | 'created_at'>
) => {
  await ensureDatabaseReady();
  const savedResult = await prisma.savedResult.create({
    data: {
      id: createRecordId('save'),
      userId: input.user_id || null,
      analysisId: input.analysis_id,
      title: input.title,
      primarySeason: input.primary_season,
      secondarySeason: input.secondary_season || null,
      confidence: input.confidence || null,
      paletteJson: stringify(input.palette),
      summary: input.summary,
      includePhoto: input.include_photo,
      createdAt: nowIso()
    }
  });

  return toSavedResultRecord(savedResult);
};

export const getSavedResultRecord = async (savedResultId: string) => {
  await ensureDatabaseReady();
  const savedResult = await prisma.savedResult.findUnique({
    where: { id: savedResultId }
  });

  return savedResult ? toSavedResultRecord(savedResult) : null;
};

export const listSavedResultRecordsForUser = async (userId: string) => {
  await ensureDatabaseReady();
  const savedResults = await prisma.savedResult.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });

  return savedResults.map(toSavedResultRecord);
};

export const createShareRecord = async (
  input: Omit<ShareRecord, 'share_id' | 'share_url' | 'created_at'>
) => {
  await ensureDatabaseReady();
  const shareId = createRecordId('shr');
  const share = await prisma.shareRecord.create({
    data: {
      id: shareId,
      userId: input.user_id || null,
      analysisId: input.analysis_id,
      savedResultId: input.saved_result_id || null,
      visibility: input.visibility,
      title: input.title,
      description: input.description,
      primarySeason: input.primary_season,
      secondarySeason: input.secondary_season || null,
      paletteJson: stringify(input.palette),
      includePhoto: input.include_photo,
      imageUrl: input.image_url,
      shareUrl: `/share/${shareId}`,
      createdAt: nowIso()
    }
  });

  return toShareRecord(share);
};

export const getShareRecord = async (shareId: string) => {
  await ensureDatabaseReady();
  const share = await prisma.shareRecord.findFirst({
    where: {
      id: shareId,
      disabledAt: null
    }
  });

  return share ? toShareRecord(share) : null;
};

export const listShareRecordsForUser = async (userId: string) => {
  await ensureDatabaseReady();
  const shares = await prisma.shareRecord.findMany({
    where: {
      userId,
      disabledAt: null
    },
    orderBy: { createdAt: 'desc' }
  });

  return shares.map(toShareRecord);
};

export const getStoredSavedResultCount = async () => {
  await ensureDatabaseReady();
  return prisma.savedResult.count();
};
export const getStoredShareCount = async () => {
  await ensureDatabaseReady();
  return prisma.shareRecord.count();
};

export const createAnalysisFeedbackRecord = async (
  input: Omit<AnalysisFeedback, 'feedback_id' | 'created_at'> & { user_id?: string | null }
) => {
  await ensureDatabaseReady();
  const feedback = await prisma.analysisFeedback.create({
    data: {
      id: createRecordId('fb'),
      analysisId: input.analysis_id,
      userId: input.user_id || null,
      rating: input.rating,
      issueTagsJson: stringify(input.issue_tags),
      userNote: input.user_note || null,
      createdAt: nowIso()
    }
  });

  return toFeedbackRecord(feedback);
};

export const getAnalysisFeedbackRecords = async (analysisId: string) => {
  await ensureDatabaseReady();
  const feedback = await prisma.analysisFeedback.findMany({
    where: { analysisId },
    orderBy: { createdAt: 'desc' }
  });

  return feedback.map(toFeedbackRecord);
};

export const disconnectStorage = async () => prisma.$disconnect();

export { prisma };
