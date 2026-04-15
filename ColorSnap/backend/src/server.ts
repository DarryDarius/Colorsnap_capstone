import './config/loadEnv';
import app from './app';
import { getAiMode } from './services/aiAnalysisService';
import { getStoredAnalysisCount } from './services/storageService';

const port = Number(process.env.PORT || 4000);
const host = process.env.HOST || '127.0.0.1';

app.listen(port, host, () => {
  console.log(`ColorSnap backend listening on http://${host}:${port}`);
  console.log(`[ColorSnap] AI mode: ${getAiMode()}`);
  console.log(`[ColorSnap] Restored analyses: ${getStoredAnalysisCount()}`);
});
