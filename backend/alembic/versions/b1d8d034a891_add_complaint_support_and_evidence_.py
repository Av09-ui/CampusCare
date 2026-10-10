"""add complaint support and evidence tables

Revision ID: b1d8d034a891
Revises: e4dbc176c1e6
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "b1d8d034a891"
down_revision: Union[str, Sequence[str], None] = "e4dbc176c1e6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "supports",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("complaint_id", sa.Integer(), nullable=False),
        sa.Column("student_id", sa.Integer(), nullable=False),
        sa.Column("comment", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["complaint_id"], ["complaints.id"]),
        sa.ForeignKeyConstraint(["student_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_supports_id", "supports", ["id"], unique=False)

    op.create_table(
        "progress_updates",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("complaint_id", sa.Integer(), nullable=False),
        sa.Column("admin_id", sa.Integer(), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["admin_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["complaint_id"], ["complaints.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_progress_updates_id", "progress_updates", ["id"], unique=False
    )

    op.create_table(
        "resolutions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("complaint_id", sa.Integer(), nullable=False),
        sa.Column("admin_id", sa.Integer(), nullable=False),
        sa.Column("resolution_text", sa.Text(), nullable=False),
        sa.Column("resolved_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["admin_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["complaint_id"], ["complaints.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("complaint_id"),
    )
    op.create_index("ix_resolutions_id", "resolutions", ["id"], unique=False)

    op.create_table(
        "evidence",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("complaint_id", sa.Integer(), nullable=True),
        sa.Column("support_id", sa.Integer(), nullable=True),
        sa.Column("resolution_id", sa.Integer(), nullable=True),
        sa.Column("file_name", sa.String(length=255), nullable=False),
        sa.Column("file_path", sa.String(length=500), nullable=False),
        sa.Column("file_type", sa.String(length=100), nullable=False),
        sa.Column("uploaded_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["complaint_id"], ["complaints.id"]),
        sa.ForeignKeyConstraint(["support_id"], ["supports.id"]),
        sa.ForeignKeyConstraint(["resolution_id"], ["resolutions.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_evidence_id", "evidence", ["id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_evidence_id", table_name="evidence")
    op.drop_table("evidence")

    op.drop_index("ix_resolutions_id", table_name="resolutions")
    op.drop_table("resolutions")

    op.drop_index("ix_progress_updates_id", table_name="progress_updates")
    op.drop_table("progress_updates")

    op.drop_index("ix_supports_id", table_name="supports")
    op.drop_table("supports")
