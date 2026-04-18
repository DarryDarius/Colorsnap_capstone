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

app.listen(port, host, () => {
  console.log(`ColorSnap backend listening on http://${host}:${port}`);
  console.log(`[ColorSnap] AI mode: ${getAiMode()}`);
  console.log(`[ColorSnap] Restored analyses: ${getStoredAnalysisCount()}`);
  console.log(`[ColorSnap] Restored bookings: ${getStoredBookingCount()}`);
  console.log(`[ColorSnap] Restored orders: ${getStoredOrderCount()}`);
  console.log(`[ColorSnap] Restored saved results: ${getStoredSavedResultCount()}`);
  console.log(`[ColorSnap] Restored shares: ${getStoredShareCount()}`);
});
