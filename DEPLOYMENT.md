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
CLIENT_ORIGIN=*
JWT_SECRET=<generated secret>
MOCK_AI=true
GOOGLE_CLIENT_ID=<same Google OAuth web client id used by the frontend>
```

Optional OpenAI production mode:

```text
MOCK_AI=false
OPENAI_API_KEY=<your OpenAI API key>
OPENAI_MODEL_PRIMARY=gpt-5.4-mini
OPENAI_MODEL_FAST=gpt-5.4-mini
OPENAI_REASONING_EFFORT=low
OPENAI_IMAGE_DETAIL=high
OPENAI_IMAGE_DETAIL_FALLBACK=low
OPENAI_TIMEOUT_MS=30000
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

## Google OAuth

In the Google Cloud OAuth web client, add:

```text
http://localhost:3000
https://<vercel-project>.vercel.app
```

## Smoke Test

1. Open the Render health URL.
2. Open the Vercel frontend URL.
3. Register or log in.
4. Create an analysis.
5. Save a result.
6. Create a booking.
7. Refresh nested routes such as `/login` and `/booking`.
