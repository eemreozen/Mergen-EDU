"""Pydantic modellerinden sürümlü JSON Schema dosyalarını üretir."""

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from app.schemas.assessment import AssessmentView, DemoAssessmentView  # noqa: E402
from app.schemas.discovery import DiscoveryView  # noqa: E402
from app.schemas.export import ExportBundle  # noqa: E402
from app.schemas.memory import MemoryChallenge, MemoryResult, TimeMachineView  # noqa: E402
from app.schemas.roadmap import MapView  # noqa: E402


def generate():
    for name, model in [
        ("mergen-v1", ExportBundle),
        ("discovery", DiscoveryView),
        ("roadmap", MapView),
        ("assessment", AssessmentView),
        ("assessment-demo", DemoAssessmentView),
        ("time-machine", TimeMachineView),
        ("memory-challenge", MemoryChallenge),
        ("memory-result", MemoryResult),
    ]:
        schema = model.model_json_schema(by_alias=True, mode="serialization")
        schema["$schema"] = "https://json-schema.org/draft/2020-12/schema"
        (ROOT / "contracts" / f"{name}.schema.json").write_text(
            json.dumps(schema, ensure_ascii=False, indent=2) + "\n"
        )


if __name__ == "__main__":
    generate()
