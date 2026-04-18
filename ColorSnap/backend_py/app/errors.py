from fastapi import Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException


class ApiError(Exception):
    def __init__(self, status_code: int, code: str, message: str) -> None:
        self.status_code = status_code
        self.code = code
        self.message = message
        super().__init__(message)


def error_body(code: str, message: str) -> dict:
    return {
        "error": {
            "code": code,
            "message": message,
        }
    }


async def api_error_handler(_request: Request, exc: ApiError) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content=error_body(exc.code, exc.message),
    )


async def validation_error_handler(_request: Request, _exc: RequestValidationError) -> JSONResponse:
    return JSONResponse(
        status_code=400,
        content=error_body("INVALID_REQUEST", "Request validation failed."),
    )


async def http_error_handler(_request: Request, exc: StarletteHTTPException) -> JSONResponse:
    code = "NOT_FOUND" if exc.status_code == 404 else "HTTP_ERROR"
    message = "Route not found." if exc.status_code == 404 else str(exc.detail)

    return JSONResponse(
        status_code=exc.status_code,
        content=error_body(code, message),
    )


async def generic_error_handler(_request: Request, _exc: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=500,
        content=error_body("INTERNAL_ERROR", "Something went wrong."),
    )
