import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import type { AnalysisFeedback, AnalysisResult, BeautyPreferenceRecord, ProductRecommendation, SavedLookRecord } from '../types/analysis';
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

const addColumnIfMissing = async (table: string, column: string, definition: string) => {
  const rows = await prisma.$queryRawUnsafe<Array<{ name: string }>>(`PRAGMA table_info("${table}")`);

  if (!rows.some((row) => row.name === column)) {
    await prisma.$executeRawUnsafe(`ALTER TABLE "${table}" ADD COLUMN "${column}" ${definition}`);
  }
};

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
        CREATE TABLE IF NOT EXISTS "AnalysisJob" (
          "analysisId" TEXT NOT NULL PRIMARY KEY,
          "userId" TEXT,
          "source" TEXT,
          "imageHash" TEXT NOT NULL,
          "mimeType" TEXT NOT NULL,
          "originalName" TEXT NOT NULL,
          "imageBytes" BLOB NOT NULL,
          "status" TEXT NOT NULL,
          "attempts" INTEGER NOT NULL DEFAULT 0,
          "maxAttempts" INTEGER NOT NULL DEFAULT 3,
          "availableAt" TEXT NOT NULL,
          "lockedAt" TEXT,
          "lastErrorJson" TEXT,
          "createdAt" TEXT NOT NULL,
          "updatedAt" TEXT NOT NULL
        )
      `);
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "AnalysisCache" (
          "imageHash" TEXT NOT NULL PRIMARY KEY,
          "resultJson" TEXT NOT NULL,
          "createdAt" TEXT NOT NULL,
          "updatedAt" TEXT NOT NULL,
          "expiresAt" TEXT NOT NULL
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
        CREATE TABLE IF NOT EXISTS "BeautyPreference" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "userId" TEXT,
          "analysisId" TEXT NOT NULL UNIQUE,
          "makeupStyle" TEXT NOT NULL,
          "budgetRange" TEXT NOT NULL,
          "shoppingGoal" TEXT NOT NULL,
          "preferredFinishesJson" TEXT NOT NULL,
          "preferredBrandsJson" TEXT NOT NULL,
          "avoidColorsJson" TEXT NOT NULL,
          "createdAt" TEXT NOT NULL,
          "updatedAt" TEXT NOT NULL
        )
      `);
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "SavedLook" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "userId" TEXT,
          "analysisId" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "occasion" TEXT NOT NULL,
          "productsJson" TEXT NOT NULL,
          "notes" TEXT,
          "createdAt" TEXT NOT NULL,
          "updatedAt" TEXT NOT NULL
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
          "analysisId" TEXT,
          "savedLookId" TEXT,
          "expertId" TEXT NOT NULL,
          "expertName" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "email" TEXT NOT NULL,
          "phone" TEXT,
          "date" TEXT NOT NULL,
          "time" TEXT NOT NULL,
          "duration" TEXT NOT NULL,
          "message" TEXT,
          "userQuestions" TEXT,
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
          "purchaseUrl" TEXT,
          "analysisId" TEXT,
          "matchReason" TEXT,
          "matchScore" INTEGER,
          "sourceLookId" TEXT
        )
      `);
      await addColumnIfMissing('Booking', 'analysisId', 'TEXT');
      await addColumnIfMissing('Booking', 'savedLookId', 'TEXT');
      await addColumnIfMissing('Booking', 'userQuestions', 'TEXT');
      await addColumnIfMissing('OrderItem', 'analysisId', 'TEXT');
      await addColumnIfMissing('OrderItem', 'matchReason', 'TEXT');
      await addColumnIfMissing('OrderItem', 'matchScore', 'INTEGER');
      await addColumnIfMissing('OrderItem', 'sourceLookId', 'TEXT');
      await prisma.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS "AnalysisJob_status_availableAt_idx" ON "AnalysisJob" ("status", "availableAt")');
      await prisma.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS "AnalysisJob_imageHash_idx" ON "AnalysisJob" ("imageHash")');
      await prisma.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS "AnalysisCache_expiresAt_idx" ON "AnalysisCache" ("expiresAt")');
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

type BeautyPreferenceRow = {
  id: string;
  userId: string | null;
  analysisId: string;
  makeupStyle: string;
  budgetRange: string;
  shoppingGoal: string;
  preferredFinishesJson: string;
  preferredBrandsJson: string;
  avoidColorsJson: string;
  createdAt: string;
  updatedAt: string;
};

type SavedLookRow = {
  id: string;
  userId: string | null;
  analysisId: string;
  name: string;
  occasion: string;
  productsJson: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AnalysisJobRecord = {
  analysis_id: string;
  user_id?: string;
  source: 'upload' | 'camera' | 'web';
  image_hash: string;
  mime_type: string;
  original_name: string;
  image_buffer: Buffer;
  attempts: number;
  max_attempts: number;
};

type AnalysisJobRow = {
  analysisId: string;
  userId: string | null;
  source: string | null;
  imageHash: string;
  mimeType: string;
  originalName: string;
  imageBytes: Buffer | Uint8Array;
  status: string;
  attempts: number;
  maxAttempts: number;
  availableAt: string;
  lockedAt: string | null;
  lastErrorJson: string | null;
  createdAt: string;
  updatedAt: string;
};

type AnalysisCacheRow = {
  imageHash: string;
  resultJson: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
};

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

const toBeautyPreferenceRecord = (row: BeautyPreferenceRow): BeautyPreferenceRecord => ({
  preference_id: row.id,
  user_id: row.userId || undefined,
  analysis_id: row.analysisId,
  makeup_style: row.makeupStyle as BeautyPreferenceRecord['makeup_style'],
  budget_range: row.budgetRange as BeautyPreferenceRecord['budget_range'],
  shopping_goal: row.shoppingGoal as BeautyPreferenceRecord['shopping_goal'],
  preferred_finishes: parseJson<BeautyPreferenceRecord['preferred_finishes']>(row.preferredFinishesJson) || [],
  preferred_brands: parseJson<BeautyPreferenceRecord['preferred_brands']>(row.preferredBrandsJson) || [],
  avoid_colors: parseJson<BeautyPreferenceRecord['avoid_colors']>(row.avoidColorsJson) || [],
  created_at: row.createdAt,
  updated_at: row.updatedAt
});

const toSavedLookRecord = (row: SavedLookRow): SavedLookRecord => ({
  look_id: row.id,
  user_id: row.userId || undefined,
  analysis_id: row.analysisId,
  name: row.name,
  occasion: row.occasion,
  products: parseJson<ProductRecommendation[]>(row.productsJson) || [],
  notes: row.notes || undefined,
  created_at: row.createdAt,
  updated_at: row.updatedAt
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
  analysis_id: row.analysisId || undefined,
  saved_look_id: row.savedLookId || undefined,
  expert_id: row.expertId,
  expert_name: row.expertName,
  name: row.name,
  email: row.email,
  phone: row.phone || undefined,
  date: row.date,
  time: row.time,
  duration: row.duration as BookingRecord['duration'],
  user_questions: row.userQuestions || undefined,
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
  analysisId: string | null;
  matchReason: string | null;
  matchScore: number | null;
  sourceLookId: string | null;
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
    purchaseUrl: item.purchaseUrl || undefined,
    analysisId: item.analysisId || null,
    matchReason: item.matchReason || undefined,
    matchScore: item.matchScore || undefined,
    sourceLookId: item.sourceLookId || undefined
  }))
});

const toAnalysisJobRecord = (row: AnalysisJobRow): AnalysisJobRecord => ({
  analysis_id: row.analysisId,
  user_id: row.userId || undefined,
  source: row.source === 'upload' || row.source === 'camera' || row.source === 'web' ? row.source : 'web',
  image_hash: row.imageHash,
  mime_type: row.mimeType,
  original_name: row.originalName,
  image_buffer: Buffer.from(row.imageBytes),
  attempts: row.attempts,
  max_attempts: row.maxAttempts
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

export const updateAnalysisProducts = async (
  analysisId: string,
  products: NonNullable<AnalysisResult['products']>
) => {
  await ensureDatabaseReady();
  const updated = await prisma.analysis.update({
    where: { id: analysisId },
    data: {
      productsJson: stringify(products),
      updatedAt: nowIso()
    }
  });

  return toAnalysisResult(updated);
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

export const enqueueAnalysisJob = async (input: {
  analysisId: string;
  userId?: string | null;
  source: 'upload' | 'camera' | 'web';
  imageHash: string;
  mimeType: string;
  originalName: string;
  imageBuffer: Buffer;
  maxAttempts?: number;
}) => {
  await ensureDatabaseReady();
  const timestamp = nowIso();

  await prisma.$executeRawUnsafe(
    `INSERT OR REPLACE INTO "AnalysisJob"
     ("analysisId", "userId", "source", "imageHash", "mimeType", "originalName", "imageBytes",
      "status", "attempts", "maxAttempts", "availableAt", "lockedAt", "lastErrorJson", "createdAt", "updatedAt")
     VALUES (?, ?, ?, ?, ?, ?, ?, 'queued', 0, ?, ?, NULL, NULL, ?, ?)`,
    input.analysisId,
    input.userId || null,
    input.source,
    input.imageHash,
    input.mimeType,
    input.originalName,
    input.imageBuffer,
    input.maxAttempts || 3,
    timestamp,
    timestamp,
    timestamp
  );
};

export const claimNextAnalysisJob = async () => {
  await ensureDatabaseReady();
  const timestamp = nowIso();
  const rows = await prisma.$queryRawUnsafe<AnalysisJobRow[]>(
    `SELECT * FROM "AnalysisJob"
     WHERE "status" = 'queued' AND "availableAt" <= ?
     ORDER BY "availableAt" ASC, "createdAt" ASC
     LIMIT 1`,
    timestamp
  );
  const row = rows[0];

  if (!row) {
    return null;
  }

  const updatedRows = await prisma.$executeRawUnsafe(
    `UPDATE "AnalysisJob"
     SET "status" = 'running', "attempts" = "attempts" + 1, "lockedAt" = ?, "updatedAt" = ?
     WHERE "analysisId" = ? AND "status" = 'queued'`,
    timestamp,
    timestamp,
    row.analysisId
  );

  if (updatedRows === 0) {
    return null;
  }

  const claimedRows = await prisma.$queryRawUnsafe<AnalysisJobRow[]>(
    'SELECT * FROM "AnalysisJob" WHERE "analysisId" = ? LIMIT 1',
    row.analysisId
  );
  const claimed = claimedRows[0];

  return claimed && claimed.status === 'running' ? toAnalysisJobRecord(claimed) : null;
};

export const completeAnalysisJob = async (analysisId: string) => {
  await ensureDatabaseReady();
  await prisma.$executeRawUnsafe(
    `UPDATE "AnalysisJob"
     SET "status" = 'completed', "lockedAt" = NULL, "updatedAt" = ?
     WHERE "analysisId" = ?`,
    nowIso(),
    analysisId
  );
};

export const requeueAnalysisJob = async (analysisId: string, code: string, message: string, delayMs: number) => {
  await ensureDatabaseReady();
  const nextAvailableAt = new Date(Date.now() + delayMs).toISOString();
  await prisma.$executeRawUnsafe(
    `UPDATE "AnalysisJob"
     SET "status" = 'queued', "availableAt" = ?, "lockedAt" = NULL, "lastErrorJson" = ?, "updatedAt" = ?
     WHERE "analysisId" = ?`,
    nextAvailableAt,
    stringify({ code, message }),
    nowIso(),
    analysisId
  );
};

export const failAnalysisJobPermanently = async (analysisId: string, code: string, message: string) => {
  await ensureDatabaseReady();
  await prisma.$executeRawUnsafe(
    `UPDATE "AnalysisJob"
     SET "status" = 'failed', "lockedAt" = NULL, "lastErrorJson" = ?, "updatedAt" = ?
     WHERE "analysisId" = ?`,
    stringify({ code, message }),
    nowIso(),
    analysisId
  );
};

export const releaseStaleAnalysisJobs = async (staleAfterMs: number) => {
  await ensureDatabaseReady();
  const staleBefore = new Date(Date.now() - staleAfterMs).toISOString();
  const timestamp = nowIso();

  await prisma.$executeRawUnsafe(
    `UPDATE "AnalysisJob"
     SET "status" = 'queued', "availableAt" = ?, "lockedAt" = NULL, "updatedAt" = ?
     WHERE "status" = 'running' AND "lockedAt" IS NOT NULL AND "lockedAt" < ?`,
    timestamp,
    timestamp,
    staleBefore
  );
};

export const getAnalysisQueueStats = async () => {
  await ensureDatabaseReady();
  const rows = await prisma.$queryRawUnsafe<Array<{ status: string; count: bigint | number }>>(
    'SELECT "status", COUNT(*) as "count" FROM "AnalysisJob" GROUP BY "status"'
  );

  return rows.reduce<Record<string, number>>((acc, row) => {
    acc[row.status] = Number(row.count);
    return acc;
  }, {
    queued: 0,
    running: 0,
    completed: 0,
    failed: 0
  });
};

export const getCachedAnalysisResult = async (
  imageHash: string
): Promise<Omit<AnalysisResult, 'analysis_id' | 'status' | 'created_at' | 'completed_at' | 'error'> | null> => {
  await ensureDatabaseReady();
  const timestamp = nowIso();
  const rows = await prisma.$queryRawUnsafe<AnalysisCacheRow[]>(
    'SELECT * FROM "AnalysisCache" WHERE "imageHash" = ? AND "expiresAt" > ? LIMIT 1',
    imageHash,
    timestamp
  );
  const row = rows[0];

  if (!row) {
    return null;
  }

  return parseJson<Omit<AnalysisResult, 'analysis_id' | 'status' | 'created_at' | 'completed_at' | 'error'>>(row.resultJson) || null;
};

export const upsertCachedAnalysisResult = async (
  imageHash: string,
  result: Omit<AnalysisResult, 'analysis_id' | 'status' | 'created_at' | 'completed_at' | 'error'>,
  ttlMs: number
) => {
  await ensureDatabaseReady();
  const timestamp = nowIso();
  const expiresAt = new Date(Date.now() + ttlMs).toISOString();

  await prisma.$executeRawUnsafe(
    `INSERT INTO "AnalysisCache" ("imageHash", "resultJson", "createdAt", "updatedAt", "expiresAt")
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT("imageHash") DO UPDATE SET
       "resultJson" = excluded."resultJson",
       "updatedAt" = excluded."updatedAt",
       "expiresAt" = excluded."expiresAt"`,
    imageHash,
    stringify(result),
    timestamp,
    timestamp,
    expiresAt
  );
};

export const pruneExpiredAnalysisCache = async () => {
  await ensureDatabaseReady();
  await prisma.$executeRawUnsafe('DELETE FROM "AnalysisCache" WHERE "expiresAt" <= ?', nowIso());
};

export const getStoredAnalysisCacheCount = async () => {
  await ensureDatabaseReady();
  await pruneExpiredAnalysisCache();
  const rows = await prisma.$queryRawUnsafe<Array<{ count: bigint | number }>>(
    'SELECT COUNT(*) as "count" FROM "AnalysisCache"'
  );

  return Number(rows[0]?.count || 0);
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
      analysisId: input.analysis_id || null,
      savedLookId: input.saved_look_id || null,
      expertId: input.expert_id,
      expertName: input.expert_name,
      name: input.name,
      email: input.email,
      phone: input.phone || null,
      date: input.date,
      time: input.time,
      duration: input.duration,
      message: input.message || null,
      userQuestions: input.user_questions || null,
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
          purchaseUrl: item.purchaseUrl || null,
          analysisId: item.analysisId || null,
          matchReason: item.matchReason || null,
          matchScore: item.matchScore || null,
          sourceLookId: item.sourceLookId || null
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

export const createOrUpdateBeautyPreferenceRecord = async (
  input: Omit<BeautyPreferenceRecord, 'preference_id' | 'created_at' | 'updated_at'>
) => {
  await ensureDatabaseReady();
  const existing = await prisma.$queryRawUnsafe<BeautyPreferenceRow[]>(
    'SELECT * FROM "BeautyPreference" WHERE "analysisId" = ? LIMIT 1',
    input.analysis_id
  );
  const timestamp = nowIso();

  if (existing[0]) {
    await prisma.$executeRawUnsafe(
      `UPDATE "BeautyPreference"
       SET "userId" = ?, "makeupStyle" = ?, "budgetRange" = ?, "shoppingGoal" = ?,
           "preferredFinishesJson" = ?, "preferredBrandsJson" = ?, "avoidColorsJson" = ?, "updatedAt" = ?
       WHERE "analysisId" = ?`,
      input.user_id || null,
      input.makeup_style,
      input.budget_range,
      input.shopping_goal,
      stringify(input.preferred_finishes),
      stringify(input.preferred_brands),
      stringify(input.avoid_colors),
      timestamp,
      input.analysis_id
    );
  } else {
    await prisma.$executeRawUnsafe(
      `INSERT INTO "BeautyPreference"
       ("id", "userId", "analysisId", "makeupStyle", "budgetRange", "shoppingGoal",
        "preferredFinishesJson", "preferredBrandsJson", "avoidColorsJson", "createdAt", "updatedAt")
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      createRecordId('pref'),
      input.user_id || null,
      input.analysis_id,
      input.makeup_style,
      input.budget_range,
      input.shopping_goal,
      stringify(input.preferred_finishes),
      stringify(input.preferred_brands),
      stringify(input.avoid_colors),
      timestamp,
      timestamp
    );
  }

  const rows = await prisma.$queryRawUnsafe<BeautyPreferenceRow[]>(
    'SELECT * FROM "BeautyPreference" WHERE "analysisId" = ? LIMIT 1',
    input.analysis_id
  );

  if (!rows[0]) {
    throw new Error('Beauty preference could not be saved.');
  }

  return toBeautyPreferenceRecord(rows[0]);
};

export const getBeautyPreferenceRecord = async (analysisId: string) => {
  await ensureDatabaseReady();
  const rows = await prisma.$queryRawUnsafe<BeautyPreferenceRow[]>(
    'SELECT * FROM "BeautyPreference" WHERE "analysisId" = ? LIMIT 1',
    analysisId
  );

  return rows[0] ? toBeautyPreferenceRecord(rows[0]) : null;
};

export const createSavedLookRecord = async (
  input: Omit<SavedLookRecord, 'look_id' | 'created_at' | 'updated_at'>
) => {
  await ensureDatabaseReady();
  const timestamp = nowIso();
  const id = createRecordId('look');

  await prisma.$executeRawUnsafe(
    `INSERT INTO "SavedLook"
     ("id", "userId", "analysisId", "name", "occasion", "productsJson", "notes", "createdAt", "updatedAt")
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    id,
    input.user_id || null,
    input.analysis_id,
    input.name,
    input.occasion,
    stringify(input.products),
    input.notes || null,
    timestamp,
    timestamp
  );

  const rows = await prisma.$queryRawUnsafe<SavedLookRow[]>(
    'SELECT * FROM "SavedLook" WHERE "id" = ? LIMIT 1',
    id
  );

  return toSavedLookRecord(rows[0]);
};

export const getSavedLookRecord = async (lookId: string) => {
  await ensureDatabaseReady();
  const rows = await prisma.$queryRawUnsafe<SavedLookRow[]>(
    'SELECT * FROM "SavedLook" WHERE "id" = ? LIMIT 1',
    lookId
  );

  return rows[0] ? toSavedLookRecord(rows[0]) : null;
};

export const listSavedLookRecords = async (input: { userId?: string | null; analysisId?: string | null }) => {
  await ensureDatabaseReady();
  const rows = input.analysisId
    ? await prisma.$queryRawUnsafe<SavedLookRow[]>(
      'SELECT * FROM "SavedLook" WHERE "analysisId" = ? ORDER BY "updatedAt" DESC',
      input.analysisId
    )
    : input.userId
      ? await prisma.$queryRawUnsafe<SavedLookRow[]>(
        'SELECT * FROM "SavedLook" WHERE "userId" = ? ORDER BY "updatedAt" DESC',
        input.userId
      )
      : await prisma.$queryRawUnsafe<SavedLookRow[]>(
        'SELECT * FROM "SavedLook" ORDER BY "updatedAt" DESC LIMIT 20'
      );

  return rows.map(toSavedLookRecord);
};

export const updateSavedLookRecord = async (
  lookId: string,
  input: Partial<Pick<SavedLookRecord, 'name' | 'occasion' | 'products' | 'notes'>>
) => {
  await ensureDatabaseReady();
  const current = await getSavedLookRecord(lookId);

  if (!current) return null;

  await prisma.$executeRawUnsafe(
    `UPDATE "SavedLook"
     SET "name" = ?, "occasion" = ?, "productsJson" = ?, "notes" = ?, "updatedAt" = ?
     WHERE "id" = ?`,
    input.name || current.name,
    input.occasion || current.occasion,
    stringify(input.products || current.products),
    input.notes === undefined ? current.notes || null : input.notes || null,
    nowIso(),
    lookId
  );

  return getSavedLookRecord(lookId);
};

export const deleteSavedLookRecord = async (lookId: string) => {
  await ensureDatabaseReady();
  await prisma.$executeRawUnsafe('DELETE FROM "SavedLook" WHERE "id" = ?', lookId);
};

export const addProductToDefaultSavedLook = async (
  input: {
    userId?: string | null;
    analysisId: string;
    product: ProductRecommendation;
  }
) => {
  await ensureDatabaseReady();
  const existingRows = await prisma.$queryRawUnsafe<SavedLookRow[]>(
    'SELECT * FROM "SavedLook" WHERE "analysisId" = ? AND "name" = ? LIMIT 1',
    input.analysisId,
    'Personalized Color Look'
  );
  const existing = existingRows[0] ? toSavedLookRecord(existingRows[0]) : null;

  if (!existing) {
    return createSavedLookRecord({
      user_id: input.userId || undefined,
      analysis_id: input.analysisId,
      name: 'Personalized Color Look',
      occasion: 'Everyday',
      products: [input.product],
      notes: 'Built from ColorSnap personalized recommendations.'
    });
  }

  const nextProducts = existing.products.some((product) => product.id === input.product.id)
    ? existing.products.map((product) => (product.id === input.product.id ? input.product : product))
    : [...existing.products, input.product];

  return updateSavedLookRecord(existing.look_id, {
    products: nextProducts
  }) as Promise<SavedLookRecord>;
};

export const disconnectStorage = async () => prisma.$disconnect();

export { prisma };
