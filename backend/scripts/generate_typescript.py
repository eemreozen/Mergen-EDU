"""Bu projenin JSON Schema alt kümesinden frontend tiplerini bağımlılıksız üretir."""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def type_of(schema):
    if "$ref" in schema:
        return schema["$ref"].rsplit("/", 1)[-1]
    if "const" in schema:
        return json.dumps(schema["const"], ensure_ascii=False)
    if "enum" in schema:
        return " | ".join(json.dumps(value) for value in schema["enum"])
    if "anyOf" in schema:
        return " | ".join(type_of(value) for value in schema["anyOf"])
    kind = schema.get("type")
    if kind == "array":
        return f"Array<{type_of(schema['items'])}>"
    if kind == "object":
        required = schema.get("required", [])
        properties = schema.get("properties", {})
        return (
            "{\n"
            + "\n".join(
                f"  {name}{'' if name in required else '?'}: {type_of(value)};"
                for name, value in properties.items()
            )
            + "\n}"
        )
    if kind in {"integer", "number"}:
        return "number"
    if kind in {"string", "boolean", "null"}:
        return kind
    raise ValueError(f"Desteklenmeyen şema: {schema}")


def generate():
    schema = json.loads((ROOT / "contracts/mergen-v1.schema.json").read_text())
    models = {**schema.get("$defs", {}), "ExportBundle": schema}
    lines = ["// Otomatik üretilmiştir. Kaynak: mergen-v1.schema.json; elle değiştirmeyin."]
    for name, value in models.items():
        lines.append(f"export type {name} = {type_of(value)};")
    (ROOT / "contracts/mergen-v1.ts").write_text("\n\n".join(lines) + "\n")


if __name__ == "__main__":
    generate()
