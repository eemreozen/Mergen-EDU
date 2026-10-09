"""Keep generated detail maps within their anchor; no extra provider requests."""

import re
import unicodedata
from types import SimpleNamespace

from sqlalchemy import select

from app.errors import AppError
from app.models.roadmap import RoadmapMap, RoadmapNode


def title_tokens(title):
    normalized = unicodedata.normalize("NFKD", title.casefold().replace("ı", "i"))
    normalized = "".join(c for c in normalized if not unicodedata.combining(c))
    return re.findall(r"[a-z0-9]+", normalized)


def same_topic(title, other):
    left, right = title_tokens(title), title_tokens(other)
    if left == right:
        return True
    ignored = {"ve", "ile", "icin", "and", "with", "for", "the", "konusu", "ogrenme", "learning"}
    a, b = set(left) - ignored, set(right) - ignored
    shared = a & b
    return len(shared) >= 2 and len(shared) / len(a | b) >= 0.8


async def branch_scope(db, parent, node):
    excluded = []
    # Include ancestor siblings too. Refining a nested Python lesson must not
    # pull an unrelated OpenCV or deployment stage down from the root roadmap.
    anchor, roadmap = node, parent
    while roadmap:
        siblings = await db.scalars(
            select(RoadmapNode)
            .where(RoadmapNode.map_id == roadmap.id, RoadmapNode.id != anchor.id)
            .order_by(RoadmapNode.created_at, RoadmapNode.id)
        )
        excluded.extend({"title": n.title, "skills": n.skills} for n in siblings)
        if not roadmap.parent_map_id:
            break
        anchor = await db.get(RoadmapNode, roadmap.parent_node_id or roadmap.target_node_id)
        roadmap = await db.get(RoadmapMap, roadmap.parent_map_id)
    return {
        "anchor": {"title": node.title, "summary": node.summary, "skills": node.skills},
        "otherRoadmapTopics": excluded,
    }


def topic_conflicts(candidate, scope):
    words = set(title_tokens(candidate.title))
    allowed = {p for skill in scope["anchor"]["skills"] for p in skill.split(".")}
    generic = {
        "basics",
        "fundamentals",
        "learning",
        "integration",
        "testing",
        "preparation",
        "development",
        "management",
        "delivery",
        "modeling",
        "processing",
    }
    for other in scope["otherRoadmapTopics"]:
        if same_topic(candidate.title, other["title"]):
            return True
        # Distinctive identifiers such as `opencv` cannot be smuggled into a
        # renamed Python basics lesson merely by giving it a python.basics tag.
        reserved = {skill.split(".")[-1] for skill in other["skills"] if len(skill.split(".")[-1]) >= 3}
        if words & (reserved - allowed - generic):
            return True
    return False


def validate_submap_scope(draft, scope):
    if any(topic_conflicts(n, scope) for n in draft.nodes):
        raise AppError(
            "AI_INVALID_OUTPUT",
            "Alt harita başka bir durağın konusunu tekrarlıyor; yalnız seçili konu detaylandırılmalı.",
            502,
            True,
        )


def focused_replacement(node, skills, index, locale):
    """Repair a copied lesson locally while keeping its key, edges and skill scope."""
    en = locale.startswith("en")
    if set(skills) <= {"python.basics"}:
        lessons = [
            (
                "Python: variables and data types" if en else "Python: değişkenler ve veri türleri",
                "Create variables, convert data types and inspect simple lists and dictionaries."
                if en
                else "Değişken oluştur, veri türlerini dönüştür; basit liste ve sözlüklerle çalış.",
            ),
            (
                "Python: conditions and loops" if en else "Python: koşullar ve döngüler",
                "Use conditions and loops to process a small list; test empty and invalid inputs."
                if en
                else "Küçük bir listeyi koşullar ve döngülerle işle; boş ve geçersiz girdileri dene.",
            ),
            (
                "Python: a small function exercise" if en else "Python: fonksiyonlarla küçük uygulama",
                "Write a small function with parameters and a return value; check expected outputs."
                if en
                else "Parametre ve dönüş değeri olan küçük bir fonksiyon yaz; beklenen çıktıları kontrol et.",
            ),
        ]
        title, summary = lessons[index % len(lessons)]
    else:
        label = "Focused practice" if en else "Konuya özel alıştırma"
        title = f"{node.title[:24]} · {label} {index + 1}"[:50]
        skill_names = ", ".join(skill.replace(".", " ") for skill in skills)
        summary = (
            f"Practice only the skills {skill_names} of {node.title}. "
            "Use a small input/output exercise and check edge cases; do not teach other roadmap stages."
            if en
            else f"Yalnız {node.title} durağındaki {skill_names} becerilerini çalış. "
            "Küçük bir girdi/çıktı alıştırması yap ve sınır durumlarını kontrol et; diğer durakları kapsamına alma."
        )
    return {"title": title, "summary": summary[:500]}


def focus_adaptive_draft(draft, scope, node, locale):
    for index, candidate in enumerate(draft.nodes):
        if topic_conflicts(candidate, scope):
            replacement = focused_replacement(node, candidate.skills, index, locale)
            candidate.title, candidate.summary = replacement["title"], replacement["summary"]
    validate_submap_scope(draft, scope)
    return draft


async def repair_unused_branch(db, branch, scope, node, locale):
    from app.models.assessment import Assessment

    nodes = list(
        await db.scalars(
            select(RoadmapNode)
            .where(RoadmapNode.map_id == branch.id)
            .order_by(RoadmapNode.created_at, RoadmapNode.id)
        )
    )
    changed = False
    for index, candidate in enumerate(nodes):
        if not topic_conflicts(candidate, scope):
            continue
        # Keep studied content, tests and progress intact. Repair only lessons
        # that have never been opened or assessed; IDs and edges stay unchanged.
        if candidate.status not in {"available", "locked"} or candidate.content is not None:
            continue
        if await db.scalar(select(Assessment.id).where(Assessment.node_id == candidate.id)):
            continue
        replacement = focused_replacement(node, candidate.skills, index, locale)
        if topic_conflicts(SimpleNamespace(**replacement), scope):
            continue
        candidate.title, candidate.summary = replacement["title"], replacement["summary"]
        changed = True
    if changed:
        branch.version += 1
        await db.flush()
    return changed
