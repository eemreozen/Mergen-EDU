import os
import subprocess
import sys
from pathlib import Path

from httpx import ASGITransport, AsyncClient
from test_assessment import prepare_ml

from app.main import create_app

ROOT = Path(__file__).resolve().parents[1]


async def test_project_survives_app_restart(client, app, project_id):
    root, child, _ = await prepare_ml(client, project_id)
    before = (await client.get(f"/api/v1/projects/{project_id}/export")).json()
    restarted = create_app(app.state.settings)
    try:
        async with AsyncClient(
            transport=ASGITransport(app=restarted), base_url="http://test", headers=client.headers
        ) as other:
            after = (await other.get(f"/api/v1/projects/{project_id}/export")).json()
            assert before == after
    finally:
        await restarted.state.gateway.close()
        await restarted.state.engine.dispose()


def test_migration_roundtrip_and_postgres_ddl(tmp_path):
    env = {**os.environ, "DATABASE_URL": f"sqlite+aiosqlite:///{tmp_path}/migration.db"}

    def run(*args, env=env):
        result = subprocess.run(
            [sys.executable, "-m", "alembic", *args],
            cwd=ROOT,
            env=env,
            capture_output=True,
            text=True,
            timeout=30,
        )
        assert result.returncode == 0, result.stderr + result.stdout
        return result.stdout

    run("upgrade", "head")
    assert "No new upgrade operations" in run("check")
    run("downgrade", "base")
    run("upgrade", "head")
    ddl = run(
        "upgrade",
        "head",
        "--sql",
        env={**env, "DATABASE_URL": "postgresql+asyncpg://demo:demo@localhost/mergen"},
    )
    assert "JSONB" in ddl
    assert "ALTER TABLE roadmap_maps ADD CONSTRAINT fk_map_parent_node" in ddl
