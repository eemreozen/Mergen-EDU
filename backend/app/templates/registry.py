import json
from pathlib import Path

from app.schemas.discovery import DiscoveryQuestion


def select_questions(primary, secondary, locale="tr"):
    result = []
    for domain in dict.fromkeys(["core", primary, *secondary]):
        path = Path(__file__).parent / "domains" / f"{domain}.json"
        for item in json.loads(path.read_text()):
            if locale == "en":
                item["text"] = ENGLISH[item["id"]]
            result.append(DiscoveryQuestion(**item, question_id=item["id"]))
    return result


ENGLISH = {
    "goal": "What is your primary goal?",
    "experience": "What is your current level? (Self-reported)",
    "technologies": "Which technologies do you know? (Comma-separated)",
    "platform": "Which platform are you targeting?",
    "hours": "How many hours per week can you spend?",
    "mobile_stack": "Which mobile stack do you prefer?",
    "ai_strategy": "Will you use an AI API or train your own model?",
    "web_experience": "Do you have frontend/backend experience?",
    "web_features": "Which features do you need?",
    "engine": "Which game engine?",
    "dimensions": "2D or 3D?",
    "multiplayer": "Do you need multiplayer?",
}
