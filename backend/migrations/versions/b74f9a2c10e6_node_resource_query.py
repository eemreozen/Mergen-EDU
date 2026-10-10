"""Store generated, lesson-specific educational search phrases."""
import sqlalchemy as sa
from alembic import op

revision = "b74f9a2c10e6"
down_revision = "a82b4f719c03"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("roadmap_nodes", sa.Column("resource_query", sa.String(), nullable=False, server_default=""))


def downgrade():
    op.drop_column("roadmap_nodes", "resource_query")
