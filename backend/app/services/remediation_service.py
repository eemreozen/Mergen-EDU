from sqlalchemy import select

from app.ai.prompts.adaptive_roadmap import SYSTEM
from app.db.base import new_id
from app.errors import AppError
from app.graph.validator import validate_graph
from app.models.project import Project
from app.models.roadmap import RoadmapEdge, RoadmapMap, RoadmapNode
from app.schemas.roadmap import AdaptiveRoadmapDraft
from app.services.branch_scope import branch_scope, focus_adaptive_draft, repair_unused_branch


async def adaptive_nodes(db, roadmap):
    return list(await db.scalars(select(RoadmapNode).where(RoadmapNode.map_id == roadmap.id)))


async def branch_complete(db, roadmap):
    nodes = await adaptive_nodes(db, roadmap)
    return bool(nodes) and all(n.status == "completed" for n in nodes)


async def active_branch(db, node):
    branch = await db.scalar(
        select(RoadmapMap).where(RoadmapMap.target_node_id == node.id, RoadmapMap.kind == "adaptive")
    )
    return branch if branch and not await branch_complete(db, branch) else None


async def add_remediation(db, node, weak_skills, gateway, trigger="knowledge_gap", failed_questions=None):
    parent = await db.get(RoadmapMap, node.map_id)
    # Öğrenme dalının içinde tekrar tekrar yeni dallar üretme: aynı içerikte tekrar çalışılabilir.
    if parent.kind == "adaptive":
        return None, False
    skills = sorted(set(weak_skills))
    if not skills or not set(skills) <= set(node.skills):
        raise AppError(
            "INVALID_WEAK_SKILLS", "Öğrenme dalı yalnız ilgili durağın becerilerini kapsamalı.", 422
        )
    project = await db.get(Project, parent.project_id)
    from app.services.project_service import ensure_ai_source

    ensure_ai_source(project, gateway)
    existing = await db.scalar(
        select(RoadmapMap).where(
            RoadmapMap.project_id == project.id, RoadmapMap.generation_key == f"adaptive:{node.id}"
        )
    )
    missing = skills
    previous_exits = []
    if existing:
        await repair_unused_branch(db, existing, await branch_scope(db, parent, node), node, project.locale)
        nodes = await adaptive_nodes(db, existing)
        outgoing = set(
            await db.scalars(
                select(RoadmapEdge.source_node_id).where(
                    RoadmapEdge.map_id == existing.id, RoadmapEdge.kind == "requires"
                )
            )
        )
        previous_exits = [n.id for n in nodes if n.id not in outgoing]
        covered = {s for n in nodes for s in n.skills}
        missing = [s for s in skills if s not in covered]
        for n in nodes:
            if set(n.skills) & set(skills):
                n.status = "available"
        existing.weak_skills = sorted(set(existing.weak_skills) | set(skills))
        existing.trigger = trigger
    if not existing or missing:
        scope = await branch_scope(db, parent, node)
        draft = await gateway.generate_structured(
            "adaptive_roadmap",
            SYSTEM,
            {
                "project": {"goal": project.analysis["goal"], "title": project.title},
                "locale": project.locale,
                "node": {"id": node.id, "title": node.title, "summary": node.summary, "skills": node.skills},
                "branchScope": scope,
                "weakSkills": missing,
                "trigger": trigger,
                "failedQuestions": failed_questions or [],
            },
            AdaptiveRoadmapDraft,
        )
        validate_graph(draft.nodes, draft.edges)
        if any(n.type != "learning" or not set(n.skills) <= set(missing) for n in draft.nodes):
            raise AppError(
                "AI_INVALID_OUTPUT", "Öğrenme dalı kapsam dışı beceri veya düğüm içeriyor.", 502, True
            )
        if not set(missing) <= {s for n in draft.nodes for s in n.skills}:
            raise AppError("AI_INVALID_OUTPUT", "Öğrenme dalı eksik becerileri kapsamıyor.", 502, True)
        draft = focus_adaptive_draft(draft, scope, node, project.locale)
        if not existing:
            existing = RoadmapMap(
                id=new_id(),
                project_id=project.id,
                parent_map_id=parent.id,
                parent_node_id=None,
                target_node_id=node.id,
                generation_key=f"adaptive:{node.id}",
                kind="adaptive",
                trigger=trigger,
                weak_skills=skills,
                title=draft.title,
                description=draft.description,
            )
            db.add(existing)
            await db.flush()
        ids = {n.key: new_id() for n in draft.nodes}
        required = {e.target for e in draft.edges if e.kind == "requires"}
        for n in draft.nodes:
            db.add(
                RoadmapNode(
                    id=ids[n.key],
                    map_id=existing.id,
                    key=f"{ids[n.key]}-{n.key}",
                    **n.model_dump(exclude={"key"}),
                    status="locked" if n.key in required else "available",
                )
            )
        await db.flush()
        for e in draft.edges:
            db.add(
                RoadmapEdge(
                    map_id=existing.id,
                    source_node_id=ids[e.source],
                    target_node_id=ids[e.target],
                    kind=e.kind,
                )
            )
        # A later failed test may reveal a previously uncovered skill. Extend
        # the existing learning route instead of appending a disconnected DAG.
        for source in previous_exits:
            for entry in draft.nodes:
                if entry.key not in required:
                    db.add(
                        RoadmapEdge(
                            map_id=existing.id,
                            source_node_id=source,
                            target_node_id=ids[entry.key],
                            kind="requires",
                        )
                    )
    await db.flush()
    from app.graph.progression import recalculate

    await recalculate(db, existing.id)
    return existing, True


async def start_learning(db, node_id, user_id, gateway):
    from app.graph.progression import require_access
    from app.services.roadmap_service import map_view, owned_map, owned_node

    node = await owned_node(db, node_id, user_id, lock=True)
    await require_access(db, node)
    if node.status == "completed":
        raise AppError("NODE_ALREADY_COMPLETED", "Tamamlanmış durakta yeni öğrenme dalı açılmaz.", 409)
    parent = await owned_map(db, node.map_id, user_id)
    if parent.kind == "adaptive":
        raise AppError(
            "ALREADY_LEARNING", "Zaten öğrenme dalındasın; bu durağın içeriğiyle çalışabilirsin.", 409
        )
    existing = await db.scalar(
        select(RoadmapMap).where(RoadmapMap.target_node_id == node.id, RoadmapMap.kind == "adaptive")
    )
    if existing:
        project = await db.get(Project, parent.project_id)
        await repair_unused_branch(db, existing, await branch_scope(db, parent, node), node, project.locale)
        return await map_view(db, existing)
    branch, _ = await add_remediation(db, node, node.skills, gateway, trigger="learn_from_scratch")
    node.status = "needs_review"
    parent.version += 1
    await db.flush()
    return await map_view(db, branch)
