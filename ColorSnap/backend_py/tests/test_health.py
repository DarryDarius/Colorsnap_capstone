from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_python_health_returns_service_status():
    response = client.get("/api/v1/py-health")

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["service"] == "colorsnap-ai-quality"
    assert body["version"] == "0.1.0"
    assert body["ai_mode"] in {"mock", "openai"}
    assert isinstance(body["timestamp"], str)


def test_ai_quality_status_reports_features():
    response = client.get("/api/v1/ai-quality/status")

    assert response.status_code == 200
    body = response.json()
    assert body["service_ready"] is True
    assert body["mock_ai"] is True
    assert body["primary_model"]
    assert body["fast_model"]
    assert body["features"] == {
        "eval_runner": True,
        "prompt_comparison": True,
        "feedback_review": True,
    }
