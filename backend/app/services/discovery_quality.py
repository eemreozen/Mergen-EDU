"""Shared discovery checks; never silently turn invalid AI questions into readiness."""
import re

from app.errors import AppError


def question_data(item, used_fields):
    text = item.text.strip()
    options = list(dict.fromkeys(option.strip() for option in item.options if option.strip()))
    invalid = (len(text) > 180 or not item.target_field.startswith("projectDetail")
               or item.target_field in used_fields or len(options) > 6
               or any(len(option) > 90 for option in options))
    # Ask about the product's environment when relevant; never outsource the
    # implementation stack choice to a novice. Do not ban whole topic words.
    invalid = invalid or bool(re.search(
        r"hangi teknolojilerle|hangi framework|hangi programlama dili|nasıl öğrenmek|"
        r"which framework|which programming language|what tech stack|how (?:do you want|would you like) to learn",
        text.casefold()))
    if item.type != "short_text" and len(options) < 2:
        invalid = True
    if invalid:
        raise AppError("AI_INVALID_OUTPUT", "Proje keşif sorusu geçerli ve net olmalı; tekrar deneyin.", 502, True)
    return {**item.model_dump(), "text": text,
            "options": [*options, *[sentinel for sentinel in ("other", "recommend") if sentinel not in options]]
            if item.type != "short_text" else []}
