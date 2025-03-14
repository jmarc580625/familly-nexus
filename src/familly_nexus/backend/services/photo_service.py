from datetime import datetime
from typing import Dict, Any, List, BinaryIO
from flask_sqlalchemy import SQLAlchemy
from familly_nexus.backend.utils.exif_utils import extract_exif_data
from familly_nexus.backend.services.service_context import ServiceContext
from familly_nexus.backend.models.photo import Photo

class PhotoService:
    def __init__(self, context: ServiceContext):
        self.db = context.db

    def upload_photo(self, photo_file: BinaryIO, filename: str, description: str) -> None:
        try:
            exif_data = extract_exif_data(photo_file)
            new_photo = Photo(
                file_name=filename,
                upload_date=datetime.now(),
                description=description,
                **exif_data
            )
            self.db.session.add(new_photo)
            self.db.session.commit()
        except Exception as e:
            self.db.session.rollback()
            raise Exception(f"Failed to upload photo: {str(e)}")

    def get_photos(self, search_criteria: Dict[str, Any]) -> List[Dict[str, Any]]:
        try:
            photos = Photo.query.filter_by(**search_criteria).all()
            return [photo.to_dict() for photo in photos]
        except Exception as e:
            raise Exception(f"Failed to get photos: {str(e)}")
