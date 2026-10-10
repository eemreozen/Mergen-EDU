import json
from pathlib import Path

from app.schemas.discovery import DiscoveryQuestion


def select_questions(primary, secondary, locale="tr"):
    result = []
    # Product/technology decisions belong to the recommendation, not a generic
    # questionnaire. Keep domain templates for legacy records, not new intake.
    for domain in ["core"]:
        path = Path(__file__).parent / "domains" / f"{domain}.json"
        for item in json.loads(path.read_text()):
            if locale == "en":
                item["text"] = ENGLISH[item["id"]]
            result.append(DiscoveryQuestion(**item, question_id=item["id"]))
    return result


ENGLISH = {
    "goal": "What should the first version deliver?",
    "experience": "Where should we start?",
    "technologies": "Add technologies you already know, if any",
    "platform": "Which platform should the first version run on?",
    "hours": "How much time can you spend each week?",
    "preferred_stack": "Is there a technology you want or need to use? You can leave the choice to us.",
    "constraints": "Do you have a delivery deadline or budget limit for the first version? If not, say flexible.",
    "mobile_stack": "Which mobile stack do you prefer?",
    "ai_strategy": "Will you use an AI API or train your own model?",
    "web_experience": "Do you have frontend/backend experience?",
    "web_features": "Does the first version need user accounts or payments?",
    "engine": "Which game engine?",
    "dimensions": "2D or 3D?",
    "multiplayer": "Do you need multiplayer?",
}
