"""Persist spaced retrieval practice without changing roadmap completion."""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision = "a82b4f719c03"
down_revision = "d31d4c6f29ab"
branch_labels = None
depends_on = None


def upgrade():
    json_type = sa.JSON().with_variant(postgresql.JSONB(), "postgresql")
    op.create_table(
        "memory_reviews",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("project_id", sa.String(), sa.ForeignKey("projects.id"), nullable=False),
        sa.Column("source_node_id", sa.String(), sa.ForeignKey("roadmap_nodes.id"), nullable=False),
        sa.Column("skill", sa.String(), nullable=False),
        sa.Column("level", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(), nullable=False),
        sa.Column("due_progress", sa.Integer(), nullable=False),
        sa.Column("due_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("source_node_id", "skill"),
    )
    op.create_index("ix_memory_reviews_project_id", "memory_reviews", ["project_id"])
    op.create_index("ix_memory_reviews_source_node_id", "memory_reviews", ["source_node_id"])
    op.create_table(
        "memory_checks",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("review_id", sa.String(), sa.ForeignKey("memory_reviews.id"), nullable=False),
        sa.Column("draft", json_type, nullable=False),
        sa.Column("submission_id", sa.String(), nullable=True),
        sa.Column("selected_index", sa.Integer(), nullable=True),
        sa.Column("result", json_type, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_memory_checks_review_id", "memory_checks", ["review_id"])


def downgrade():
    op.drop_table("memory_checks")
    op.drop_table("memory_reviews")
