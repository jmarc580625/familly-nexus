"""add s3 key column

Revision ID: 20240318_add_s3_key
Revises: 
Create Date: 2024-03-18 12:01:59.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20240318_add_s3_key'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # Add s3_key column
    op.add_column('photo', sa.Column('s3_key', sa.String(500), nullable=True))
    
    # Make s3_key non-nullable for new records
    op.alter_column('photo', 's3_key',
                    existing_type=sa.String(500),
                    nullable=False,
                    postgresql_using="url")  # Use URL as initial s3_key value

def downgrade():
    op.drop_column('photo', 's3_key')
