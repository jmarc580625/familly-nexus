# Description: Models for the photos in the family nexus application.
from familly_nexus.backend.models.db import db

class Photo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    file_name = db.Column(db.String(100), nullable=False)
    upload_date = db.Column(db.DateTime, nullable=False)
    uploader = db.Column(db.Integer, nullable=True)  
    description = db.Column(db.Text, nullable=True)
    location = db.Column(db.String(100), nullable=True)  # GPS coordinates where the photo was taken
    date_taken = db.Column(db.Date, nullable=True)
    author = db.Column(db.String(100), nullable=True)  # Id of the photo's author
