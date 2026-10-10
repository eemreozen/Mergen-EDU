"""Keep constrained decoding small; enforce full constraints after generation."""


def generation_schema(response_model):
    schema = response_model.model_json_schema(by_alias=True)
    bounds = {
        "minItems": "Minimum items",
        "maxItems": "Maximum items",
        "minLength": "Minimum characters",
        "maxLength": "Maximum characters",
        "minimum": "Minimum value",
        "maximum": "Maximum value",
        "exclusiveMinimum": "Value greater than",
        "exclusiveMaximum": "Value less than",
        "pattern": "Required pattern",
    }

    def simplify(value):
        if isinstance(value, list):
            return [simplify(item) for item in value]
        if not isinstance(value, dict):
            return value
        result = {}
        for key, item in value.items():
            if key not in bounds:
                # Property/definition names are data, not schema keywords.
                result[key] = (
                    {name: simplify(child) for name, child in item.items()}
                    if key in {"properties", "$defs"}
                    else simplify(item)
                )
        hints = [f"{label}: {value[key]}." for key, label in bounds.items() if key in value]
        if hints:
            result["description"] = " ".join([value.get("description", ""), *hints]).strip()
        return result

    result = simplify(schema)
    node_schema = result.get("$defs", {}).get("NodeDraft")
    if node_schema:
        node_schema["required"] = [*node_schema.get("required", []), "resourceQuery"]
        node_schema["properties"]["resourceQuery"].pop("default", None)
    if response_model.__name__ == "RootRoadmapDraft":
        # This provider ignores described array minima and rejects bounded arrays
        # for this nested schema. Required object slots enforce 12 real AI stages
        # without inventing extra lessons locally or padding a short response.
        item = result["properties"]["nodes"]["items"]
        slots = {f"stage{i:02d}": item.copy() for i in range(1, 21)}
        for endpoint in ("source", "target"):
            result["$defs"]["EdgeDraft"]["properties"][endpoint]["enum"] = list(slots)
        result["properties"]["nodes"] = {
            "type": "object", "properties": slots,
            "required": list(slots)[:12], "additionalProperties": False,
            "description": "Produce stages 01-12; stages 13-20 are optional for a larger project.",
        }
    return result
