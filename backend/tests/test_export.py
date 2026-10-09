import json
from pathlib import Path

import pytest
from jsonschema import Draft202012Validator

from app.errors import AppError
from app.graph.validator import validate_bundle
from app.schemas.export import ExportBundle

ROOT = Path(__file__).resolve().parents[1]


@pytest.mark.parametrize(
    "name", ["discovery.json", "roadmap.json", "roadmap-updated.json", "roadmap-public.json"]
)
def test_examples_match_generated_contract(name):
    payload = json.loads((ROOT / "contracts/examples" / name).read_text())
    schema = json.loads((ROOT / "contracts/mergen-v1.schema.json").read_text())
    Draft202012Validator(schema).validate(payload)
    validate_bundle(ExportBundle.model_validate(payload))
    assert payload["metadata"]["demo"]
    if name.endswith("public.json"):
        assert "correctIndex" not in str(payload)


@pytest.mark.parametrize("mutation", ["child", "parent", "assessment", "status", "remedial"])
def test_bad_export_references_are_rejected(mutation):
    bundle = ExportBundle.model_validate_json((ROOT / "contracts/examples/roadmap-updated.json").read_text())
    if mutation == "child":
        bundle.maps[0].nodes[0].child_map_id = "missing"
    elif mutation == "parent":
        bundle.maps[1].parent_node_id = "missing"
    elif mutation == "assessment":
        bundle.maps[0].nodes[0].assessment_id = "missing"
    elif mutation == "status":
        next(n for n in bundle.maps[0].nodes if n.status == "locked").status = "available"
    else:
        next(n for n in bundle.maps[1].nodes if n.type == "remedial").remediation_for_node_id = "missing"
    with pytest.raises(AppError):
        validate_bundle(bundle)


def test_schema_files_are_current():
    stored = json.loads((ROOT / "contracts/mergen-v1.schema.json").read_text())
    stored.pop("$schema")
    assert stored == ExportBundle.model_json_schema(by_alias=True, mode="serialization")
    public = json.loads((ROOT / "contracts/assessment.schema.json").read_text())
    assert "correctIndex" not in json.dumps(public)
