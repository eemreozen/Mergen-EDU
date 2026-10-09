from collections import deque

from app.errors import AppError


def invalid(message):
    raise AppError("ROADMAP_VALIDATION_FAILED", message, 502, True)


def validate_graph(nodes, edges):
    ids = [n.key if hasattr(n, "key") else n.id for n in nodes]
    if len(set(ids)) != len(ids):
        invalid("Düğüm kimlikleri benzersiz olmalı.")
    incoming = dict.fromkeys(ids, 0)
    adjacency = {key: [] for key in ids}
    seen = set()
    for edge in edges:
        source = edge.source if hasattr(edge, "source") else edge.source_node_id
        target = edge.target if hasattr(edge, "target") else edge.target_node_id
        if source not in incoming or target not in incoming:
            invalid("Bağlantı harita dışındaki düğüme işaret ediyor.")
        if source == target:
            invalid("Düğüm kendisine bağlanamaz.")
        identity = source, target, edge.kind
        if identity in seen:
            invalid("Aynı bağlantı birden fazla tanımlanamaz.")
        seen.add(identity)
        if edge.kind == "requires":
            adjacency[source].append(target)
            incoming[target] += 1
    queue = deque(key for key in ids if incoming[key] == 0)
    count = 0
    while queue:
        source = queue.popleft()
        count += 1
        for target in adjacency[source]:
            incoming[target] -= 1
            if not incoming[target]:
                queue.append(target)
    if count != len(ids):
        invalid("Zorunlu bağımlılık grafında döngü var.")


def validate_bundle(bundle):
    maps = {m.id: m for m in bundle.maps}
    if len(maps) != len(bundle.maps):
        invalid("Harita kimlikleri benzersiz olmalı.")
    nodes = {n.id: n for m in bundle.maps for n in m.nodes}
    if len(nodes) != sum(len(m.nodes) for m in bundle.maps):
        invalid("Düğüm kimlikleri tüm haritalarda benzersiz olmalı.")
    assessments = {a.id: a for a in bundle.assessments}
    if len(assessments) != len(bundle.assessments):
        invalid("Değerlendirme kimlikleri benzersiz olmalı.")
    edges = [e for m in bundle.maps for e in m.edges]
    if len({e.id for e in edges}) != len(edges):
        invalid("Bağlantı kimlikleri tüm haritalarda benzersiz olmalı.")
    roots = [m for m in bundle.maps if m.parent_map_id is None]
    if bundle.maps and len(roots) != 1:
        invalid("Tek bir kök harita bulunmalı.")
    for m in bundle.maps:
        validate_graph(m.nodes, m.edges)
        if m.project_id != bundle.project.id:
            invalid("Harita yanlış projeye bağlı.")
        if m.parent_map_id:
            parent = maps.get(m.parent_map_id)
            if not parent or m.parent_node_id not in {n.id for n in parent.nodes}:
                invalid("Alt harita ebeveyn ilişkisi geçersiz.")
            if nodes[m.parent_node_id].child_map_id != m.id:
                invalid("Üst düğüm alt haritayı göstermiyor.")
        elif m.parent_node_id:
            invalid("Kök harita ebeveyn düğüme sahip olamaz.")
        visited = {m.id}
        cursor = m
        while cursor.parent_map_id:
            if cursor.parent_map_id in visited:
                invalid("Alt harita hiyerarşisinde döngü var.")
            visited.add(cursor.parent_map_id)
            if cursor.parent_map_id not in maps:
                invalid("Üst harita bulunamadı.")
            cursor = maps[cursor.parent_map_id]
        for n in m.nodes:
            if n.map_id != m.id:
                invalid("Düğüm yanlış haritaya bağlı.")
            if n.child_map_id:
                child = maps.get(n.child_map_id)
                if not child or child.parent_node_id != n.id or child.parent_map_id != m.id:
                    invalid("Alt harita referansı geçersiz.")
            if n.assessment_id:
                assessment = assessments.get(n.assessment_id)
                if not assessment or assessment.node_id != n.id:
                    invalid("Değerlendirme referansı geçersiz.")
            if n.type == "remedial":
                original = nodes.get(n.remediation_for_node_id)
                if not original or original.map_id != m.id or original.type == "remedial":
                    invalid("Telafi düğümü asıl düğüme bağlı olmalı.")
                if not any(
                    e.source == n.id and e.target == original.id and e.kind == "requires" for e in m.edges
                ):
                    invalid("Telafi bağımlılığı eksik.")
            blockers = [nodes[e.source] for e in m.edges if e.target == n.id and e.kind == "requires"]
            expected_prerequisites = {b.id for b in blockers}
            if set(n.prerequisites) != expected_prerequisites:
                invalid("Ön koşul listesi bağlantılarla tutarsız.")
            blocked = any(b.status != "completed" for b in blockers)
            if blocked and n.status not in {"locked", "needs_review"}:
                invalid("Düğüm durumu ön koşullarla uyumsuz.")
            if not blocked and n.status == "locked":
                invalid("Ön koşulları tamamlanan düğüm kilitli kalamaz.")
    for assessment in bundle.assessments:
        if assessment.node_id not in nodes or nodes[assessment.node_id].assessment_id != assessment.id:
            invalid("Değerlendirme düğümü bulunamadı.")
    for resource in bundle.resources:
        if resource.node_id not in nodes:
            invalid("Kaynak düğümü bulunamadı.")
