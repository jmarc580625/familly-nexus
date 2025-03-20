from core.models.db import db

class Person(db.Model):
    __tablename__ = 'people'

    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    birth_date = db.Column(db.Date, nullable=True)
    death_date = db.Column(db.Date, nullable=True)
    description = db.Column(db.Text, nullable=True)

    def __init__(self, first_name: str, last_name: str, birth_date=None, death_date=None, description=None):
        self.first_name = first_name
        self.last_name = last_name
        self.birth_date = birth_date
        self.death_date = death_date
        self.description = description

    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'firstName': self.first_name,
            'lastName': self.last_name,
            'birthDate': self.birth_date.isoformat() if self.birth_date else None,
            'deathDate': self.death_date.isoformat() if self.death_date else None,
            'description': self.description
        }
