from app.schemas.export import ExportBundle
from app.services.discovery_service import discovery_view
from app.services.project_service import project_view
from app.services.skill_service import learner_profile


async def export_project(db, project, mode="public"):
    view = project_view(project)
    from sqlalchemy import select

    from app.graph.validator import validate_bundle
    from app.models.roadmap import RoadmapMap
    from app.services.roadmap_service import map_view

    maps = [
        await map_view(db, m)
        for m in await db.scalars(
            select(RoadmapMap).where(RoadmapMap.project_id == project.id).order_by(RoadmapMap.created_at)
        )
    ]
    from app.models.assessment import Assessment
    from app.services.assessment_service import assessment_view

    node_ids = [n.id for m in maps for n in m.nodes]
    assessments = [
        assessment_view(a, demo=mode == "demo")
        for a in await db.scalars(select(Assessment).where(Assessment.node_id.in_(node_ids)))
    ]
    bundle = ExportBundle(
        project=view,
        learner_profile=await learner_profile(db, project),
        discovery=discovery_view(project),
        metadata=view.metadata,
        maps=maps,
        assessments=assessments,
        resources=[r for m in maps for n in m.nodes for r in n.resources],
    )
    validate_bundle(bundle)
    return bundle
