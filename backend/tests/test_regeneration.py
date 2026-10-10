from unittest.mock import AsyncMock

import pytest
from conftest import finish_discovery
from sqlalchemy import select

from app.errors import AppError
from app.models.project import Project
from app.models.roadmap import RoadmapMap, RoadmapNode
from app.services.roadmap_regeneration import regenerate_root


async def test_regeneration_preserves_old_maps_and_reuses_project_answers(client, app, project_id):
    await finish_discovery(client, project_id)
    root = (await client.post(f"/api/v1/projects/{project_id}/roadmap/generate")).json()
    original = app.state.gateway.generate_structured
    generated = AsyncMock(side_effect=original)
    async with app.state.session_factory() as db:
        project = await db.get(Project, project_id)
        user_id = project.user_id
        app.state.gateway.generate_structured = generated
        archive_id, count = await regenerate_root(db, project_id, user_id, app.state.gateway)
        await db.commit()
        assert count >= 12
        assert (await db.get(RoadmapMap, root['id'])).project_id == archive_id
        assert (await db.get(RoadmapNode, root['nodes'][0]['id'])) is not None
        archive = await db.get(Project, archive_id)
        assert archive.discovery_data['archivedRevisionOf'] == project_id
        current = await db.scalar(select(RoadmapMap).where(RoadmapMap.project_id == project_id))
        assert current.id != root['id']
    generated.assert_called_once()
    payload = generated.call_args.args[2]
    assert payload['originalIdea'] and payload['discovery']
    assert (await client.get(f"/api/v1/projects/{project_id}/export")).status_code == 200
    assert (await client.get(f"/api/v1/projects/{archive_id}/export")).status_code == 200


async def test_provider_failure_does_not_replace_current_roadmap(client, app, project_id):
    await finish_discovery(client, project_id)
    root = (await client.post(f"/api/v1/projects/{project_id}/roadmap/generate")).json()
    app.state.gateway.generate_structured = AsyncMock(side_effect=AppError("AI_TIMEOUT", "Timeout", 504))
    async with app.state.session_factory() as db:
        project = await db.get(Project, project_id)
        with pytest.raises(AppError):
            await regenerate_root(db, project_id, project.user_id, app.state.gateway)
        await db.rollback()
        assert (await db.get(RoadmapMap, root['id'])).project_id == project_id
        assert len(list(await db.scalars(select(Project)))) == 1
