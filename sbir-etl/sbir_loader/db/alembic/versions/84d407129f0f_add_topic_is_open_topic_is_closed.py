"""add topic_is_open/topic_is_closed

Revision ID: 84d407129f0f
Revises: 5a24175e7ba1
Create Date: 2025-06-23 16:28:52.709874

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '84d407129f0f'
down_revision: Union[str, Sequence[str], None] = '5a24175e7ba1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('solicitation_topics', sa.Column('topic_is_open', sa.Boolean(), nullable=True))
    op.add_column('solicitation_topics', sa.Column('topic_is_closed', sa.Boolean(), nullable=True))
    op.add_column('solicitations', sa.Column('is_open', sa.Boolean(), nullable=True))
    op.add_column('solicitations', sa.Column('is_closed', sa.Boolean(), nullable=True))
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('solicitations', 'is_closed')
    op.drop_column('solicitations', 'is_open')
    op.drop_column('solicitation_topics', 'topic_is_closed')
    op.drop_column('solicitation_topics', 'topic_is_open')
    # ### end Alembic commands ###
