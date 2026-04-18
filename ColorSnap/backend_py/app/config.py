import os
from functools import lru_cache
from pathlib import Path

try:
    from dotenv import load_dotenv
except ImportError:  # pragma: no cover - python-dotenv is optional at runtime
    load_dotenv = None


ROOT_DIR = Path(__file__).resolve().parents[1]

if load_dotenv:
    load_dotenv(ROOT_DIR / ".env")


def _get_bool(name: str, default: bool) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def _get_int(name: str, default: int) -> int:
    value = os.getenv(name)
    if value is None:
        return default

    try:
        parsed = int(value)
    except ValueError:
        return default

    return parsed if parsed > 0 else default


def _get_path(name: str, default: str) -> Path:
    value = os.getenv(name, default).strip() or default
    path = Path(value)
    return path if path.is_absolute() else ROOT_DIR / path


class Settings:
    service_name = "colorsnap-ai-quality"
    version = "0.1.0"

    host: str
    port: int
    client_origin: str
    mock_ai: bool
    openai_api_key: str
    primary_model: str
    fast_model: str
    reasoning_effort: str
    openai_timeout_ms: int
    eval_storage_path: Path
    feedback_review_path: Path

    def __init__(self) -> None:
        self.host = os.getenv("PY_BACKEND_HOST", "127.0.0.1")
        self.port = _get_int("PY_BACKEND_PORT", 4001)
        self.client_origin = os.getenv("CLIENT_ORIGIN", "http://localhost:3000")
        self.mock_ai = _get_bool("MOCK_AI", True)
        self.openai_api_key = os.getenv("OPENAI_API_KEY", "").strip()
        self.primary_model = os.getenv("OPENAI_MODEL_PRIMARY", "gpt-5.4-mini")
        self.fast_model = os.getenv("OPENAI_MODEL_FAST", "gpt-5.4-mini")
        self.reasoning_effort = os.getenv("OPENAI_REASONING_EFFORT", "low")
        self.openai_timeout_ms = _get_int("OPENAI_TIMEOUT_MS", 30000)
        self.eval_storage_path = _get_path("EVAL_STORAGE_PATH", ".data/eval-results.json")
        self.feedback_review_path = _get_path("FEEDBACK_REVIEW_PATH", ".data/feedback-review.json")

    @property
    def ai_mode(self) -> str:
        return "mock" if self.mock_ai else "openai"

    @property
    def service_ready(self) -> bool:
        return self.mock_ai or bool(self.openai_api_key)


@lru_cache
def get_settings() -> Settings:
    return Settings()


def reset_settings_cache() -> None:
    get_settings.cache_clear()
