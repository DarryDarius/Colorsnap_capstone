from pathlib import Path

import pytest

from app.errors import ApiError
from app.services.storage_service import append_json_record, read_json_list, write_json_list


def test_read_missing_json_list_returns_empty_list(tmp_path: Path):
    assert read_json_list(tmp_path / "missing.json") == []


def test_read_empty_json_list_returns_empty_list(tmp_path: Path):
    file_path = tmp_path / "empty.json"
    file_path.write_text("", encoding="utf-8")

    assert read_json_list(file_path) == []


def test_write_and_read_json_list(tmp_path: Path):
    file_path = tmp_path / "nested" / "records.json"
    records = [{"id": "one"}, {"id": "two"}]

    write_json_list(file_path, records)

    assert read_json_list(file_path) == records


def test_append_json_record(tmp_path: Path):
    file_path = tmp_path / "records.json"

    append_json_record(file_path, {"id": "one"})
    append_json_record(file_path, {"id": "two"})

    assert read_json_list(file_path) == [{"id": "one"}, {"id": "two"}]


def test_invalid_json_raises_api_error(tmp_path: Path):
    file_path = tmp_path / "broken.json"
    file_path.write_text("{not-json", encoding="utf-8")

    with pytest.raises(ApiError) as exc_info:
        read_json_list(file_path)

    assert exc_info.value.code == "STORAGE_INVALID_JSON"


def test_non_array_storage_raises_api_error(tmp_path: Path):
    file_path = tmp_path / "object.json"
    file_path.write_text('{"id": "one"}', encoding="utf-8")

    with pytest.raises(ApiError) as exc_info:
        read_json_list(file_path)

    assert exc_info.value.code == "STORAGE_INVALID_SHAPE"
