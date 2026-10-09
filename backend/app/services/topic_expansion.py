"""Small, deterministic technology curricula; never change prerequisite semantics."""

import json
import re

from app.schemas.roadmap import EdgeDraft, NodeDraft, RoadmapDraft


def broad_topic(node):
    if node.type not in {"learning", "submap"}:
        return None
    title = node.title.casefold().replace("front-end", "frontend").replace("back-end", "backend")
    # A focused endpoint, validation or component lesson should remain a lesson.
    if len(title.split()) > 6 or any(
        word in title
        for word in (
            "jwt",
            "endpoint",
            "bileşen",
            "component",
            "validasyon",
            "validation",
            "test",
            "deploy",
        )
    ):
        return None
    if re.search(r"\bbackend\b|arka uç|sunucu tarafı", title):
        return "backend"
    if re.search(r"\bfrontend\b|ön yüz|önyüz|istemci tarafı", title):
        return "frontend"
    return None


def expand_topic(topic, project, discovery):
    # Discovery is authoritative; analysis may contain alternative suggestions.
    choices = json.dumps(discovery, ensure_ascii=False).casefold()
    analysis = json.dumps(project.analysis, ensure_ascii=False).casefold()
    context = (
        json.dumps(discovery["preferredStack"], ensure_ascii=False).casefold()
        if discovery.get("preferredStack")
        else choices or analysis
    )
    goal = project.title
    product = project.analysis.get("goal", project.original_idea)[:220]
    en = project.locale.startswith("en")
    if topic == "backend":
        stack = next(
            (
                name
                for key, name in (
                    ("django", "Django"),
                    ("nestjs", "NestJS"),
                    ("express", "Express / Node.js"),
                    ("node.js", "Express / Node.js"),
                    ("flask", "Flask / Python"),
                    (".net", "ASP.NET Core / C#"),
                    ("spring", "Spring Boot"),
                    ("fastapi", "FastAPI / Python"),
                )
                if key in context
            ),
            "FastAPI / Python",
        )
        database = next(
            (
                name
                for key, name in (("mongodb", "MongoDB"), ("sqlite", "SQLite"), ("mysql", "MySQL"))
                if key in context
            ),
            "PostgreSQL",
        )
        items = [
            (
                "runtime",
                f"{stack}: " + ("runtime basics" if en else "çalışma temelleri"),
                "backend.runtime",
                [],
            ),
            ("http", "HTTP, JSON & REST", "backend.http", []),
            (
                "model",
                f"{database}: " + ("data model" if en else "veri modeli"),
                "database.modeling",
                ["runtime"],
            ),
            (
                "auth",
                "Authentication & permissions" if en else "Kimlik doğrulama ve yetkiler",
                "backend.auth",
                ["runtime", "http"],
            ),
            (
                "api",
                "Project API & validation" if en else "Projeye özel API ve doğrulama",
                "backend.api",
                ["model", "http"],
            ),
            (
                "integration",
                "Client integration" if en else "İstemci ile entegrasyon",
                "backend.integration",
                ["auth", "api"],
            ),
            (
                "tests",
                "API & integration tests" if en else "API ve entegrasyon testleri",
                "backend.testing",
                ["integration"],
            ),
            (
                "delivery",
                "Deployment & observability" if en else "Yayınlama ve izleme",
                "backend.delivery",
                ["tests"],
            ),
        ]
    else:
        stack = next(
            (
                name
                for key, name in (
                    ("angular", "Angular / TypeScript"),
                    ("vue", "Vue / TypeScript"),
                    ("svelte", "Svelte"),
                    ("react", "React / TypeScript"),
                )
                if key in context
            ),
            "React / TypeScript",
        )
        items = [
            (
                "web",
                "HTML, CSS & accessibility" if en else "HTML, CSS ve erişilebilirlik",
                "frontend.web",
                [],
            ),
            ("language", "JavaScript & TypeScript", "frontend.language", []),
            (
                "components",
                f"{stack}: " + ("components" if en else "bileşenler"),
                "frontend.components",
                ["web", "language"],
            ),
            (
                "routing",
                "Screens & navigation" if en else "Proje ekranları ve yönlendirme",
                "frontend.routing",
                ["components"],
            ),
            (
                "forms",
                "Forms & validation" if en else "Formlar ve doğrulama",
                "frontend.forms",
                ["components"],
            ),
            (
                "state",
                "API, state & error handling" if en else "API, durum ve hata yönetimi",
                "frontend.state",
                ["routing", "forms"],
            ),
            (
                "tests",
                "UI & user flow tests" if en else "Arayüz ve kullanıcı akışı testleri",
                "frontend.testing",
                ["state"],
            ),
            (
                "delivery",
                "Performance & deployment" if en else "Performans ve yayınlama",
                "frontend.delivery",
                ["tests"],
            ),
        ]
    explicit = any(token in choices for token in stack.casefold().replace(" / ", " ").split())
    description = (
        (
            f"{goal}: {stack}. "
            + (
                "Uses your technology choices."
                if explicit
                else "Suggested stack; no explicit technology choice was found."
            )
        )
        if en
        else (
            f"{goal}: {stack}. "
            + (
                "Kaydedilmiş teknoloji tercihlerin kullanıldı."
                if explicit
                else "Açık teknoloji tercihi bulunmadığından önerilen başlangıç teknolojileri kullanıldı."
            )
        )
    )
    return RoadmapDraft(
        title=f"{topic.capitalize()} · {goal}"[:100],
        description=description,
        nodes=[
            NodeDraft(
                key=key,
                type="learning",
                title=title[:50],
                summary=(
                    f"For {goal}, learn and apply {title}. Product goal: {product}"
                    if en
                    else f"{goal} projesinde {title} konusunu öğren ve çalışan bir örnekle uygula. Proje hedefi: {product}"
                )[:500],
                skills=[skill],
                estimated_hours=3 if not parents else 5,
            )
            for key, title, skill, parents in items
        ],
        edges=[
            EdgeDraft(source=parent, target=key, kind="requires")
            for key, _, _, parents in items
            for parent in parents
        ],
    )
