from sqlalchemy import select

from app.errors import AppError
from app.models.roadmap import RoadmapEdge, RoadmapMap, RoadmapNode


async def require_access(db, node):
    if node.status == "locked":
        raise AppError("NODE_LOCKED", "Ön koşullar tamamlanmalı.", 409)
    roadmap = await db.get(RoadmapMap, node.map_id)
    while roadmap.parent_map_id:
        target_id = roadmap.target_node_id if roadmap.kind == "adaptive" else roadmap.parent_node_id
        parent = await db.get(RoadmapNode, target_id)
        if parent.status == "locked" or (parent.status == "needs_review" and roadmap.kind != "adaptive"):
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
    for _ in range(len(nodes) + 1):
        changed = False
        for node in nodes:
            blockers = [by_id[e.source_node_id] for e in edges if e.target_node_id == node.id]
            blocked = any(n.status != "completed" for n in blockers)
            before = node.status
            if blocked:
                if node.status != "needs_review":
                    node.status = "locked"
            elif node.type == "milestone":
                node.status = "completed"
            elif node.status == "locked":
                node.status = "available"
            changed = changed or before != node.status
        if not changed:
            break
    roadmap.version += 1
    await db.flush()
    if roadmap.kind == "adaptive":
        # Dal tamamlanınca asıl durak otomatik geçilmez: kullanıcı ana bilgi testine geri döner.
        parent_map = await db.get(RoadmapMap, roadmap.parent_map_id)
        parent_map.version += 1
        await db.flush()
    elif roadmap.parent_node_id:
        parent = await db.get(RoadmapNode, roadmap.parent_node_id)
        # Bir durak testle zaten doğrulandıysa, kısmi alt harita bunu geri alamaz.
        if parent.status != "completed":
            parent.status = "completed" if all(n.status == "completed" for n in nodes) else "in_progress"
        await db.flush()
        await recalculate(db, roadmap.parent_map_id)
