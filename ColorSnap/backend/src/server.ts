import './config/loadEnv';
import app from './app';
import { getAiMode } from './services/aiAnalysisService';
import {
  getStoredAnalysisCount,
  getStoredBookingCount,
  getStoredOrderCount,
  getStoredSavedResultCount,
  getStoredShareCount
} from './services/storageService';

const port = Number(process.env.PORT || 4000);
const host = process.env.HOST || '127.0.0.1';

app.listen(port, host, async () => {
  console.log(`ColorSnap backend listening on http://${host}:${port}`);
  console.log(`[ColorSnap] AI mode: ${getAiMode()}`);

  try {
    console.log(`[ColorSnap] Stored analyses: ${await getStoredAnalysisCount()}`);
    console.log(`[ColorSnap] Stored bookings: ${await getStoredBookingCount()}`);
    console.log(`[ColorSnap] Stored orders: ${await getStoredOrderCount()}`);
    console.log(`[ColorSnap] Stored saved results: ${await getStoredSavedResultCount()}`);
    console.log(`[ColorSnap] Stored shares: ${await getStoredShareCount()}`);
  } catch (error) {
    console.warn('[ColorSnap] Database counts are unavailable. Run npm.cmd run db:push before starting the backend.', error);
  }
});
