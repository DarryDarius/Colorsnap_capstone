from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.config import get_settings
from app.errors import ApiError, api_error_handler, generic_error_handler, http_error_handler, validation_error_handler
from app.routes import health


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title="ColorSnap AI Quality Service",
        version=settings.version,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=[settings.client_origin],
        allow_credentials=False,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization"],
    )

    app.add_exception_handler(ApiError, api_error_handler)
    app.add_exception_handler(StarletteHTTPException, http_error_handler)
    app.add_exception_handler(RequestValidationError, validation_error_handler)
    app.add_exception_handler(Exception, generic_error_handler)

    app.include_router(health.router, prefix="/api/v1")

    return app


app = create_app()
