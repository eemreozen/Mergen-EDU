"""Bilgi açığı ve sıfırdan öğrenme dallarını ayrı haritalarda sakla."""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision = "d31d4c6f29ab"
down_revision = "f95c4e15293b"
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table("roadmap_maps") as batch:
        batch.add_column(sa.Column("kind", sa.String(), nullable=False, server_default="root"))
        batch.add_column(sa.Column("trigger", sa.String(), nullable=True))
        batch.add_column(sa.Column("target_node_id", sa.String(), nullable=True))
        batch.add_column(
            sa.Column(
                "weak_skills",
                sa.JSON().with_variant(postgresql.JSONB(), "postgresql"),
                nullable=False,
                server_default="[]",
            )
        )
        batch.create_foreign_key("fk_map_target_node", "roadmap_nodes", ["target_node_id"], ["id"])
        batch.create_index("ix_roadmap_maps_target_node_id", ["target_node_id"])
    op.execute(sa.text("UPDATE roadmap_maps SET kind = 'submap' WHERE parent_node_id IS NOT NULL"))


def downgrade():
    with op.batch_alter_table("roadmap_maps") as batch:
        batch.drop_index("ix_roadmap_maps_target_node_id")
        batch.drop_constraint("fk_map_target_node", type_="foreignkey")
        batch.drop_column("weak_skills")
        batch.drop_column("target_node_id")
        batch.drop_column("trigger")
        batch.drop_column("kind")
