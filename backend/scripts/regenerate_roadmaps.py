"""Explicit maintenance command: real generation, atomic replacement, preserved history.

Run from backend: PYTHONPATH=. .venv/bin/python scripts/regenerate_roadmaps.py --all
"""
import argparse
import asyncio
import logging

from sqlalchemy import select

from app.ai.gateway import AIGateway
from app.config import Settings
from app.db.session import make_database
from app.errors import AppError
from app.models.project import Project
from app.models.roadmap import RoadmapMap
from app.services.roadmap_regeneration import regenerate_root


async def run(args):
    settings = Settings()
    if settings.demo_fixtures or settings.llm_provider != "gemini":
        raise SystemExit("Real Gemini configuration is required.")
    engine, sessions = make_database(settings.database_url)
    gateway = AIGateway(settings)
    try:
        async with sessions() as db:
            projects = list(await db.scalars(select(Project).where(Project.id.in_(select(RoadmapMap.project_id))).order_by(Project.created_at)))
            targets = [(p.id, p.user_id) for p in projects if not p.discovery_data.get("archivedRevisionOf") and (args.all or p.id in args.project)]
        if not targets:
            raise SystemExit("No matching active roadmaps.")
        print(f"Generating {len(targets)} project roadmap(s) with {settings.llm_model_strong}", flush=True)
        failures = 0
        for project_id, user_id in targets:
            async with sessions() as db:
                try:
                    archive_id, count = await regenerate_root(db, project_id, user_id, gateway)
                    await db.commit()
                    print(f"OK project={project_id} nodes={count} previous={archive_id}", flush=True)
                except AppError as exc:
                    await db.rollback()
                    failures += 1
                    print(f"FAILED project={project_id} code={exc.code} reason={exc.message}; previous roadmap preserved", flush=True)
        if failures:
            raise SystemExit(f"{failures} generation(s) failed.")
    finally:
        await gateway.close()
        await engine.dispose()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--all", action="store_true")
    group.add_argument("--project", action="append", default=[])
    logging.basicConfig(level=logging.INFO)
    logging.getLogger("httpx").setLevel(logging.WARNING)
    asyncio.run(run(parser.parse_args()))
