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

    return simplify(schema)
