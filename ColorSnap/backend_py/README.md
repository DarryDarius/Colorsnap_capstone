# ColorSnap Python AI Quality Service

This is a Python FastAPI sidecar for ColorSnap AI quality and evaluation tooling.

It does not replace the existing TypeScript backend. The current product backend can keep running on port `4000`, while this service runs separately on port `4001`.

## Setup

```bash
cd ColorSnap/backend_py
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

## Run

```bash
uvicorn app.main:app --reload --port 4001
```

## Test

```bash
pytest
```

## Current Scope

Phase 1-3 are implemented:

- FastAPI app scaffold
- Health and AI quality status APIs
- Centralized config
- Unified error response shape
- Local JSON storage service
- Tests for the scaffold, config behavior, errors, and storage
