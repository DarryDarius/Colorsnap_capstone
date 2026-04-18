from pydantic import BaseModel


class AiQualityFeatures(BaseModel):
    eval_runner: bool
    prompt_comparison: bool
    feedback_review: bool


class AiQualityStatusResponse(BaseModel):
    service_ready: bool
    mock_ai: bool
    primary_model: str
    fast_model: str
    features: AiQualityFeatures
