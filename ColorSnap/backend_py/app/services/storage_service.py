import json
from pathlib import Path
from typing import Any

from app.errors import ApiError


def _ensure_parent(file_path: Path) -> None:
    file_path.parent.mkdir(parents=True, exist_ok=True)


def read_json_list(file_path: Path) -> list[dict[str, Any]]:
    if not file_path.exists():
        return []

    try:
        raw_content = file_path.read_text(encoding="utf-8").strip()
        if not raw_content:
            return []

        parsed = json.loads(raw_content)
    except json.JSONDecodeError as exc:
        raise ApiError(500, "STORAGE_INVALID_JSON", f"Storage file is not valid JSON: {file_path.name}.") from exc
    except OSError as exc:
        raise ApiError(500, "STORAGE_READ_FAILED", f"Could not read storage file: {file_path.name}.") from exc

    if not isinstance(parsed, list):
        raise ApiError(500, "STORAGE_INVALID_SHAPE", f"Storage file must contain a JSON array: {file_path.name}.")

    return [item for item in parsed if isinstance(item, dict)]


def write_json_list(file_path: Path, records: list[dict[str, Any]]) -> None:
    _ensure_parent(file_path)

    try:
        file_path.write_text(json.dumps(records, indent=2), encoding="utf-8")
    except OSError as exc:
        raise ApiError(500, "STORAGE_WRITE_FAILED", f"Could not write storage file: {file_path.name}.") from exc


def append_json_record(file_path: Path, record: dict[str, Any]) -> dict[str, Any]:
    records = read_json_list(file_path)
    records.append(record)
    write_json_list(file_path, records)
    return record
