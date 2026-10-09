"""İzole SQLite üzerinde gerçek API akışından etiketli demo paketleri üretir."""

import asyncio
import json
import sys
import tempfile
from pathlib import Path
from uuid import uuid4

from httpx import ASGITransport, AsyncClient

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from app.config import Settings  # noqa: E402
from app.db.base import Base  # noqa: E402
from app.graph.validator import validate_bundle  # noqa: E402
from app.main import create_app  # noqa: E402
from app.schemas.export import ExportBundle  # noqa: E402


def write_bundle(name, payload):
    validate_bundle(ExportBundle.model_validate(payload))
    (ROOT / "contracts" / "examples" / name).write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n"
    )


def checked(response):
    if response.status_code >= 400:
        raise RuntimeError(f"{response.status_code}: {response.text}")
    return response.json()


async def run():
    with tempfile.TemporaryDirectory(prefix="mergen-demo-") as directory:
        app = create_app(
            Settings(
                database_url=f"sqlite+aiosqlite:///{directory}/demo.db",
                demo_mode=True,
                demo_fixtures=True,
                app_env="development",
            )
        )
        async with app.state.engine.begin() as connection:
            await connection.run_sync(Base.metadata.create_all)
        try:
            async with AsyncClient(
                transport=ASGITransport(app=app),
                base_url="http://demo",
                headers={"X-Demo-Session": str(uuid4())},
            ) as client:
                project = checked(
                    await client.post(
                        "/api/v1/projects",
                        json={
                            "idea": "Yapay zekâ destekli fitness uygulaması geliştirmek istiyorum.",
                            "locale": "tr",
                        },
                    )
                )
                project_id = project["id"]
                export_path = f"/api/v1/projects/{project_id}/export?mode=demo"
                write_bundle("discovery.json", checked(await client.get(export_path)))
                defaults = {
                    "goal": "mvp",
                    "experienceLevel": "beginner",
                    "knownTechnologies": "JavaScript",
                    "platform": "mobile",
                    "weeklyHours": "10",
                    "mobileStack": "react_native",
                    "aiStrategy": "train_model",
                    "pythonExperience": "Başlangıç seviyesindeyim.",
                }
                for _ in range(3):
                    discovery = checked(await client.get(f"/api/v1/projects/{project_id}/discovery"))
                    if discovery["readyForRoadmap"]:
                        break
                    checked(
                        await client.post(
                            f"/api/v1/projects/{project_id}/discovery/answers",
                            json={
                                "answers": [
                                    {"questionId": q["id"], "value": defaults[q["targetField"]]}
                                    for q in discovery["questions"]
                                    if not q["completed"]
                                ]
                            },
                        )
                    )
                root = checked(await client.post(f"/api/v1/projects/{project_id}/roadmap/generate"))
                ml = next(n for n in root["nodes"] if n["type"] == "submap")
                child = checked(await client.post(f"/api/v1/nodes/{ml['id']}/submap"))
                python = next(n for n in child["nodes"] if n["title"] == "Python")
                checked(await client.get(f"/api/v1/nodes/{python['id']}"))
                quiz = checked(await client.get(f"/api/v1/nodes/{python['id']}/assessment"))
                bundle = checked(await client.get(export_path))
                write_bundle("roadmap.json", bundle)
                internal = next(a for a in bundle["assessments"] if a["id"] == quiz["id"])
                answers = [
                    {
                        "questionId": q["id"],
                        "selectedIndex": (q["correctIndex"] + 1) % len(q["options"])
                        if q["targetSkill"] == "python.functions"
                        else q["correctIndex"],
                    }
                    for q in internal["questions"]
                ]
                result = checked(
                    await client.post(
                        f"/api/v1/nodes/{python['id']}/assessment/submit",
                        json={
                            "assessmentId": quiz["id"],
                            "version": quiz["version"],
                            "submissionId": str(uuid4()),
                            "answers": answers,
                        },
                    )
                )
                assert not result["passed"] and result["weakSkills"] == ["python.functions"]
                remedial = next(n for n in result["map"]["nodes"] if n["type"] == "remedial")
                checked(await client.get(f"/api/v1/nodes/{remedial['id']}"))
                checked(await client.get(f"/api/v1/nodes/{remedial['id']}/assessment"))
                advisor = checked(
                    await client.post(
                        "/api/v1/advisor/chat",
                        json={
                            "projectId": project_id,
                            "currentMapId": child["id"],
                            "currentNodeId": remedial["id"],
                            "message": "Bu ek görev neden eklendi?",
                        },
                    )
                )
                write_bundle("roadmap-updated.json", checked(await client.get(export_path)))
                write_bundle(
                    "roadmap-public.json", checked(await client.get(f"/api/v1/projects/{project_id}/export"))
                )
                print("Demo fixture: 3 aşamalı örnek ve public export doğrulandı.")
                print("Danışman:", advisor["reply"])
        finally:
            await app.state.gateway.close()
            await app.state.engine.dispose()


if __name__ == "__main__":
    asyncio.run(run())
