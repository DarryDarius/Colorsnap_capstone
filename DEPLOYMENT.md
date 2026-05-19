# ColorSnap Deployment

This repo deploys as two services:

- Frontend: `ColorSnap` on Vercel, built as a Create React App static site.
- Backend: `ColorSnap/backend` on Render, built from the root app package scripts.

## Backend on Render

Use the repository Blueprint with `render.yaml`, or create a Web Service manually:

```text
Root Directory: ColorSnap
Build Command: npm ci && npm run backend:build
Start Command: npm run backend:start
Health Check Path: /api/v1/health
```

Required environment variables:

```text
NODE_VERSION=20
HOST=0.0.0.0
CLIENT_ORIGIN=https://<vercel-project>.vercel.app
JWT_SECRET=<generated secret>
MOCK_AI=false
GOOGLE_CLIENT_ID=<same Google OAuth web client id used by the frontend>
DATABASE_URL=file:./prisma/colorsnap.db
OPENAI_API_KEY=<your OpenAI API key>
```

For first deployment smoke testing, `CLIENT_ORIGIN=*` is acceptable if CORS is blocking the demo, but switch it back to the exact Vercel origin before the final presentation.

Live OpenAI production settings:

```text
MOCK_AI=false
OPENAI_API_KEY=<your OpenAI API key>
OPENAI_MODEL_PRIMARY=gpt-5.4-mini
OPENAI_MODEL_FAST=gpt-5.4-mini
OPENAI_REASONING_EFFORT=low
OPENAI_IMAGE_DETAIL=high
OPENAI_IMAGE_DETAIL_FALLBACK=low
OPENAI_TIMEOUT_MS=45000
```

Optional AI stability controls:

```text
AI_ANALYSIS_RATE_LIMIT_MAX=3
AI_ANALYSIS_RATE_LIMIT_WINDOW_MS=60000
AI_ANALYSIS_WORKER_CONCURRENCY=1
AI_ANALYSIS_JOB_MAX_ATTEMPTS=3
AI_ANALYSIS_JOB_RETRY_BASE_MS=2000
AI_ANALYSIS_JOB_STALE_MS=300000
AI_ANALYSIS_CACHE_VERSION=korean-pc-v2.0-live
AI_ANALYSIS_CACHE_TTL_MS=10000
AI_ANALYSIS_CACHE_MAX_ENTRIES=100
AI_OPENAI_MAX_CONCURRENCY=2
AI_CIRCUIT_FAILURE_RATIO=0.5
AI_CIRCUIT_MIN_REQUESTS=6
AI_CIRCUIT_WINDOW_MS=120000
AI_CIRCUIT_OPEN_MS=60000
AI_CIRCUIT_HALF_OPEN_SUCCESSES=2
AI_DEGRADED_FALLBACK=false
```

After Render deploys, verify:

```text
https://<render-service>.onrender.com/api/v1/health
```

## Frontend on Vercel

Import the GitHub repository and use:

```text
Root Directory: ColorSnap
Framework Preset: Create React App
Build Command: npm run build
Output Directory: build
```

Required environment variables:

```text
REACT_APP_API_BASE_URL=https://<render-service>.onrender.com
REACT_APP_GOOGLE_CLIENT_ID=<Google OAuth web client id>
```

Redeploy the frontend after changing `REACT_APP_*` variables.

Create React App reads `REACT_APP_*` values at build time, so a Vercel environment variable change does not affect an already-built deployment.

## Google OAuth

In the Google Cloud OAuth web client, add:

```text
http://localhost:3000
https://<vercel-project>.vercel.app
```

## Smoke Test

Run local preflight before deploying:

```text
cd ColorSnap
npm test -- --watchAll=false
npm run backend:build
cd backend_py
pytest
```

Run these checks after every Render or Vercel production deploy:

```text
[ ] Open https://<render-service>.onrender.com/api/v1/health and confirm status is ok.
[ ] Confirm health shows ai_mode=openai and openai_configured=true.
[ ] Open /demo-check and confirm Live analysis ready is ready.
[ ] Open the Vercel frontend URL.
[ ] Refresh deep routes: /login, /booking?expert=ex1, and /share/<known-share-id> if available.
[ ] Register a new user.
[ ] Log out and log back in.
[ ] Upload or capture a photo from /analysis.
[ ] Confirm the Result page completes polling and shows the color report.
[ ] Save the result.
[ ] Create a share link and open it in a new private/incognito window.
[ ] Add at least two recommended products to cart.
[ ] Save one recommendation to a Saved Look.
[ ] Open Saved Looks and add the full look to cart.
[ ] Use "Book with This Look" and confirm the booking form attaches the saved look.
[ ] Submit the booking and confirm a backend booking id appears.
[ ] Continue to demo checkout from the cart.
[ ] Complete demo payment and confirm the order confirmation page appears.
```

Failure-mode checks for presentation readiness:

```text
[ ] Stop the backend locally and confirm /analysis shows Service offline.
[ ] Set MOCK_AI=false without OPENAI_API_KEY locally and confirm /analysis shows OpenAI key missing.
[ ] Confirm MOCK_AI=false and AI_DEGRADED_FALLBACK=false in the presentation environment.
[ ] Force or wait for a failed analysis and confirm /result offers retry and Start New Analysis.
[ ] Upload a poor-quality image and confirm the result page shows retake guidance.
```

Recommended final live presentation mode:

```text
MOCK_AI=false
OPENAI_API_KEY=<set>
AI_DEGRADED_FALLBACK=false
OPENAI_TIMEOUT_MS=45000
AI_ANALYSIS_WORKER_CONCURRENCY=1
AI_OPENAI_MAX_CONCURRENCY=2
CLIENT_ORIGIN=https://<vercel-project>.vercel.app
```

Do not use mock mode for the final live demo. If OpenAI is unavailable, the app should fail transparently with retry and retake options instead of returning a fabricated fallback result.
