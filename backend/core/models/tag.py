from datetime import datetime
from core.models.db import db

class Tag(db.Model):
    __tablename__ = 'tags'
    
    name = db.Column(db.String(50), primary_key=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    
    def __init__(self, name: str):
        self.name = name
    
    def to_dict(self):
        return {
            'name': self.name,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
