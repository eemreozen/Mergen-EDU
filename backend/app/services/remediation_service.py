import hashlib

from sqlalchemy import select

from app.db.base import new_id
from app.models.roadmap import RoadmapEdge, RoadmapNode


async def add_remediation(db, node, weak_skills):
    if node.type == "remedial":
        # Telafinin telafisini üretme; mevcut kısa testi tekrar kullanılabilir tut.
        return False
    created = False
    prerequisites = list(
        await db.scalars(
            select(RoadmapEdge).where(RoadmapEdge.target_node_id == node.id, RoadmapEdge.kind == "requires")
        )
    )
    for skill in sorted(set(weak_skills)):
        key = "remedial." + node.id + "." + hashlib.sha256(skill.encode()).hexdigest()[:12]
        existing = await db.scalar(
            select(RoadmapNode).where(RoadmapNode.map_id == node.map_id, RoadmapNode.key == key)
        )
        if existing:
            if existing.status == "completed":
                existing.status = "available"
            continue
        title = "Python Fonksiyonları — Ek Pratik" if skill == "python.functions" else f"{skill} — Ek Pratik"
        remedial = RoadmapNode(
            id=new_id(),
            map_id=node.map_id,
            key=key,
            type="remedial",
            title=title,
            summary=f"{skill} değerlendirmesinde eksik kalan beceri için kısa pratik.",
            skills=[skill],
            estimated_hours=1,
            status="available",
            remediation_for_node_id=node.id,
        )
        db.add(remedial)
        await db.flush()
        db.add(
            RoadmapEdge(
                map_id=node.map_id, source_node_id=remedial.id, target_node_id=node.id, kind="requires"
            )
        )
        for edge in prerequisites:
            source = await db.get(RoadmapNode, edge.source_node_id)
            if source.type != "remedial":
                db.add(
                    RoadmapEdge(
                        map_id=node.map_id,
                        source_node_id=source.id,
                        target_node_id=remedial.id,
                        kind="requires",
                    )
                )
        created = True
    await db.flush()
    return created
