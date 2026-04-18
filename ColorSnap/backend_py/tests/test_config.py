from app.config import get_settings, reset_settings_cache


def test_settings_default_to_mock_mode(monkeypatch):
    monkeypatch.delenv("MOCK_AI", raising=False)
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    reset_settings_cache()

    settings = get_settings()

    assert settings.mock_ai is True
    assert settings.ai_mode == "mock"
    assert settings.service_ready is True

    reset_settings_cache()


def test_settings_live_mode_requires_api_key(monkeypatch):
    monkeypatch.setenv("MOCK_AI", "false")
    monkeypatch.setenv("OPENAI_API_KEY", "")
    reset_settings_cache()

    settings = get_settings()

    assert settings.mock_ai is False
    assert settings.ai_mode == "openai"
    assert settings.service_ready is False

    reset_settings_cache()


def test_relative_storage_paths_are_rooted_in_backend_py(monkeypatch):
    monkeypatch.setenv("EVAL_STORAGE_PATH", ".data/custom-evals.json")
    reset_settings_cache()

    settings = get_settings()

    assert settings.eval_storage_path.name == "custom-evals.json"
    assert settings.eval_storage_path.is_absolute()

    reset_settings_cache()
