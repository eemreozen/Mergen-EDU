"""Opt-in smoke: gerçek AI ile analiz, kök harita, alt harita ve kalıcı export."""

import os
from uuid import uuid4

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import select

from app.config import Settings
from app.db.base import Base
from app.graph.validator import validate_bundle
from app.main import create_app
from app.models.assessment import Assessment
from app.schemas.export import ExportBundle


@pytest.mark.live
@pytest.mark.skipif(
    os.getenv("RUN_LIVE_AI") != "1", reason="Canlı test için RUN_LIVE_AI=1 ve LLM ayarları gerekli."
)
async def test_real_project_root_submap_export(tmp_path):
    settings = Settings(
        demo_fixtures=False, demo_mode=True, database_url=f"sqlite+aiosqlite:///{tmp_path}/live.db"
    )
    if not (
        settings.llm_api_key.get_secret_value() and settings.llm_model_fast and settings.llm_model_strong
    ):
        pytest.skip("LLM_API_KEY / LLM_MODEL_FAST / LLM_MODEL_STRONG eksik; gerçek AI doğrulanmadı.")
    app = create_app(settings)
    async with app.state.engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)

    def checked(response):
        assert response.status_code < 400, response.text
        return response.json()

    try:
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://live", headers={"X-Demo-Session": str(uuid4())}
        ) as client:
            project = checked(
                await client.post(
                    "/api/v1/projects",
                    json={
                        "idea": "Yapay zekâ destekli fitness mobil uygulaması geliştirmek ve kendi ML modelimi eğitmek istiyorum."
                    },
                )
            )
            project_id = project["id"]
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
            for _ in range(4):
                discovery = checked(await client.get(f"/api/v1/projects/{project_id}/discovery"))
                if discovery["readyForRoadmap"]:
                    break
                answers = []
                for q in discovery["questions"]:
                    if not q["completed"]:
                        value = defaults.get(
                            q["targetField"],
                            q["options"][:1]
                            if q["type"] == "multi_choice"
                            else q["options"][0]
                            if q["options"]
                            else "Başlangıç seviyesi, MVP odaklı.",
                        )
                        answers.append({"questionId": q["id"], "value": value})
                checked(
                    await client.post(
                        f"/api/v1/projects/{project_id}/discovery/answers", json={"answers": answers}
                    )
                )
            root = checked(await client.post(f"/api/v1/projects/{project_id}/roadmap/generate"))
            submaps = [n for n in root["nodes"] if n["type"] == "submap"]
            assert submaps, "Gerçek AI geniş teknik alanlar için alt harita üretmedi."

            async def complete(node_id):
                node = checked(await client.get(f"/api/v1/nodes/{node_id}"))
                if node["type"] == "submap":
                    child = checked(await client.post(f"/api/v1/nodes/{node_id}/submap"))
                    for _ in range(20):
                        child = checked(await client.get(f"/api/v1/maps/{child['id']}"))
                        available = [n for n in child["nodes"] if n["status"] in {"available", "in_progress"}]
                        if not available:
                            assert all(n["status"] == "completed" for n in child["nodes"])
                            break
                        await complete(available[0]["id"])
                elif node["type"] in {"learning", "remedial"}:
                    quiz = checked(await client.get(f"/api/v1/nodes/{node_id}/assessment"))
                    # Smoke test iç doğruları DB'den okur; public API cevap anahtarı döndürmez.
                    async with app.state.session_factory() as db:
                        internal = await db.scalar(select(Assessment).where(Assessment.id == quiz["id"]))
                        answers = [
                            {"questionId": q["id"], "selectedIndex": q["correct_index"]}
                            for q in internal.questions
                        ]
                    checked(
                        await client.post(
                            f"/api/v1/nodes/{node_id}/assessment/submit",
                            json={
                                "assessmentId": quiz["id"],
                                "version": quiz["version"],
                                "submissionId": str(uuid4()),
                                "answers": answers,
                            },
                        )
                    )
                else:
                    body = (
                        {"action": "complete_task", "expectedOutput": "Smoke test çıktı kanıtı"}
                        if node["type"] == "development_task"
                        else {"action": "start"}
                    )
                    checked(await client.patch(f"/api/v1/nodes/{node_id}", json=body))

            for _ in range(20):
                root = checked(await client.get(f"/api/v1/maps/{root['id']}"))
                available_submap = next(
                    (
                        n
                        for n in root["nodes"]
                        if n["type"] == "submap" and n["status"] in {"available", "in_progress", "completed"}
                    ),
                    None,
                )
                if available_submap:
                    child = checked(await client.post(f"/api/v1/nodes/{available_submap['id']}/submap"))
                    assert child["parentMapId"] == root["id"]
                    break
                await complete(next(n for n in root["nodes"] if n["status"] == "available")["id"])
            bundle = checked(await client.get(f"/api/v1/projects/{project_id}/export"))
            assert len(bundle["maps"]) >= 2
            assert not bundle["metadata"]["demo"]
            validate_bundle(ExportBundle.model_validate(bundle))
    finally:
        await app.state.gateway.close()
        await app.state.engine.dispose()
