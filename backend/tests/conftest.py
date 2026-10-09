from uuid import uuid4

import pytest
from httpx import ASGITransport, AsyncClient

from app.config import Settings
from app.db.base import Base
from app.main import create_app
from app.models import advisor, assessment, project, roadmap, skill  # noqa: F401


@pytest.fixture
async def app(tmp_path):
    app = create_app(Settings(database_url=f"sqlite+aiosqlite:///{tmp_path}/test.db", demo_fixtures=True))
    async with app.state.engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)
    yield app
    await app.state.gateway.close()
    await app.state.engine.dispose()


@pytest.fixture
async def client(app):
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test", headers={"X-Demo-Session": str(uuid4())}
    ) as client:
        yield client


@pytest.fixture
async def project_id(client):
    response = await client.post(
        "/api/v1/projects", json={"idea": "Yapay zekâ destekli fitness uygulaması geliştirmek istiyorum."}
    )
    assert response.status_code == 201, response.text
    return response.json()["id"]


async def finish_discovery(client, project_id):
    defaults = {
        "goal": "mvp",
        "experienceLevel": "beginner",
        "knownTechnologies": "JavaScript",
        "platform": "mobile",
        "weeklyHours": "10",
        "mobileStack": "react_native",
        "aiStrategy": "train_model",
        "pythonExperience": "Hiç deneyimim yok",
    }
    for _ in range(3):
        discovery = (await client.get(f"/api/v1/projects/{project_id}/discovery")).json()
        if discovery["readyForRoadmap"]:
            return
        answers = [
            {
                "questionId": q["id"],
                "value": defaults.get(q["targetField"], q["options"][0] if q["options"] else "none"),
            }
            for q in discovery["questions"]
            if not q["completed"]
        ]
        result = await client.post(
            f"/api/v1/projects/{project_id}/discovery/answers", json={"answers": answers}
        )
        assert result.status_code == 200, result.text
    raise AssertionError("Discovery did not finish")
