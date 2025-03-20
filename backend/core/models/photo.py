# Description: Models for the photos in the family nexus application.
from datetime import datetime
from core.models.db import db
from core.models.tag import Tag
from datetime import timezone

# Association table for photos and tags
photo_tags = db.Table('photo_tags',
    db.Column('photo_id', db.Integer, db.ForeignKey('photos.id'), primary_key=True),
    db.Column('tag_name', db.String(50), db.ForeignKey('tags.name'), primary_key=True)
)

# Association table for photos and people
photo_people = db.Table('photo_people',
    db.Column('photo_id', db.Integer, db.ForeignKey('photos.id'), primary_key=True),
    db.Column('person_id', db.Integer, db.ForeignKey('people.id'), primary_key=True)
)

class Photo(db.Model):
    __tablename__ = 'photos'

    id = db.Column(db.Integer, primary_key=True)
    file_name = db.Column(db.String(255), nullable=False)
    s3_key = db.Column(db.String(255), unique=True, nullable=False)
    url = db.Column(db.String(1024), nullable=False)
    title = db.Column(db.String(255))
    description = db.Column(db.Text)
    upload_date = db.Column(db.DateTime(timezone=True), nullable=False, default=datetime.now(timezone.utc))
    date_taken = db.Column(db.DateTime(timezone=True))
    author = db.Column(db.String(255))
    location_name = db.Column(db.String(255))
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)

    # Relationships
    tags = db.relationship('Tag', secondary=photo_tags, backref=db.backref('photos', lazy='dynamic'))
    people = db.relationship('Person', secondary=photo_people, backref=db.backref('photos', lazy='dynamic'))

    def __init__(self, file_name: str, s3_key: str, url: str, title: str = None, description: str = None,
                 upload_date: datetime = None, date_taken: datetime = None, author: str = None,
                 location_name: str = None, latitude: float = None, longitude: float = None,
                 tags: list = None, people: list = None):
        self.file_name = file_name
        self.s3_key = s3_key
        self.url = url
        self.title = title or file_name
        self.description = description
        self.upload_date = upload_date if upload_date else datetime.now(timezone.utc)
        self.date_taken = date_taken
        self.author = author
        self.location_name = location_name
        self.latitude = latitude
        self.longitude = longitude
        if tags:
            self.tags.extend(tags)
        if people:
            self.people.extend(people)

    def to_dict(self):
        return {
            'id': self.id,
            'file_name': self.file_name,
            's3_key': self.s3_key,
            'url': self.url,
            'title': self.title,
            'description': self.description,
            'upload_date': self.upload_date.isoformat() if self.upload_date else None,
            'date_taken': self.date_taken.isoformat() if self.date_taken else None,
            'author': self.author,
            'location_name': self.location_name,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'tags': [tag.name for tag in self.tags],
            'people': [person.id for person in self.people]
        }
