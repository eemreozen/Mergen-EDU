from sqlalchemy import select

from app.errors import AppError
from app.models.roadmap import RoadmapEdge, RoadmapMap, RoadmapNode


async def require_access(db, node):
    if node.status == "locked":
        raise AppError("NODE_LOCKED", "Ön koşullar tamamlanmalı.", 409)
    roadmap = await db.get(RoadmapMap, node.map_id)
    while roadmap.parent_node_id:
        parent = await db.get(RoadmapNode, roadmap.parent_node_id)
        if parent.status in {"locked", "needs_review"}:
            raise AppError("PARENT_NODE_LOCKED", "Üst haritadaki ön koşullar tamamlanmalı.", 409)
        roadmap = await db.get(RoadmapMap, roadmap.parent_map_id)


async def recalculate(db, map_id):
    roadmap = await db.get(RoadmapMap, map_id)
    nodes = list(await db.scalars(select(RoadmapNode).where(RoadmapNode.map_id == map_id)))
    edges = list(
        await db.scalars(
            select(RoadmapEdge).where(RoadmapEdge.map_id == map_id, RoadmapEdge.kind == "requires")
        )
    )
    by_id = {n.id: n for n in nodes}
    # Sabit noktaya kadar; milestone zincirleri de aynı işlemde açılır.
    for _ in range(len(nodes) + 1):
        changed = False
        for node in nodes:
            prerequisites = [by_id[e.source_node_id] for e in edges if e.target_node_id == node.id]
            blocked = any(n.status != "completed" for n in prerequisites)
            previous = node.status
            if blocked:
                if node.status != "needs_review":
                    node.status = "locked"
            elif node.type == "milestone":
                node.status = "completed"
            elif node.status == "locked":
                node.status = "available"
            changed = changed or previous != node.status
        if not changed:
            break
    roadmap.version += 1
    await db.flush()
    if roadmap.parent_node_id:
        parent = await db.get(RoadmapNode, roadmap.parent_node_id)
        parent.status = "completed" if all(n.status == "completed" for n in nodes) else "in_progress"
        await db.flush()
        await recalculate(db, roadmap.parent_map_id)
