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
    "goal": "What should the first version deliver?",
    "experience": "What is your current experience with building this project?",
    "technologies": "Which technologies can you already use for this project? You can say you are starting from scratch.",
    "platform": "Which platform should the first version run on?",
    "hours": "How many hours per week can you spend building this project?",
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
