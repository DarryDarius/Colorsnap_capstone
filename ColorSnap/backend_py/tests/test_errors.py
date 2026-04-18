from fastapi import APIRouter
from fastapi.testclient import TestClient

from app.errors import ApiError
from app.main import create_app


def test_api_error_uses_standard_error_shape():
    app = create_app()
    router = APIRouter()

    @router.get("/boom")
    def boom():
        raise ApiError(418, "TEAPOT", "Short and stout.")

    app.include_router(router)
    client = TestClient(app)

    response = client.get("/boom")

    assert response.status_code == 418
    assert response.json() == {
        "error": {
            "code": "TEAPOT",
            "message": "Short and stout.",
        }
    }


def test_unknown_route_uses_standard_error_shape():
    app = create_app()
    client = TestClient(app)

    response = client.get("/missing")

    assert response.status_code == 404
    assert response.json() == {
        "error": {
            "code": "NOT_FOUND",
            "message": "Route not found.",
        }
    }
