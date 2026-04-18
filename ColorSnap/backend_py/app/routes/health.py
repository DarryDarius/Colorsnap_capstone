from datetime import datetime, timezone

from fastapi import APIRouter

from app.config import get_settings
from app.schemas.ai_quality import AiQualityFeatures, AiQualityStatusResponse
from app.schemas.common import HealthResponse


router = APIRouter()


@router.get("/py-health", response_model=HealthResponse)
def get_python_health() -> HealthResponse:
    settings = get_settings()

    return HealthResponse(
        status="ok",
        service=settings.service_name,
        version=settings.version,
        ai_mode=settings.ai_mode,
        timestamp=datetime.now(timezone.utc).isoformat(),
    )


@router.get("/ai-quality/status", response_model=AiQualityStatusResponse)
def get_ai_quality_status() -> AiQualityStatusResponse:
    settings = get_settings()

    return AiQualityStatusResponse(
        service_ready=settings.service_ready,
        mock_ai=settings.mock_ai,
        primary_model=settings.primary_model,
        fast_model=settings.fast_model,
        features=AiQualityFeatures(
            eval_runner=True,
            prompt_comparison=True,
            feedback_review=True,
        ),
    )
