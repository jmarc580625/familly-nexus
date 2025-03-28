from datetime import datetime, timezone
from typing import Dict, Any, List, BinaryIO
from werkzeug.utils import secure_filename
from sqlalchemy import or_
from core.services.service_context import ServiceContext
from core.services.storage_service import StorageService
from core.models.photo import Photo
from core.models.person import Person
from core.models.tag import Tag
from core.infrastructure.exif_utils import extract_exif_data

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename: str) -> bool:
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

class PhotoService:
    def __init__(self, context: ServiceContext):
        self.db = context.db
        self.storage = None  # Will be initialized in upload_photo

    def upload_photo(self, photo_file: BinaryIO, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """
        Upload a photo with metadata.
        
        Args:
            photo_file: The photo file object
            metadata: Dictionary containing:
                - title: str
                - description: str (optional)
                - tags: List[str]
                - people: List[str] (person IDs)
                - location: Dict with name, latitude, longitude (optional)
        """
        try:
            if not hasattr(photo_file, 'filename'):
                raise ValueError("photo_file must have a filename attribute")

            filename = secure_filename(photo_file.filename)
            if not allowed_file(filename):
                raise ValueError(f"Invalid file type. Allowed types: {ALLOWED_EXTENSIONS}")

            # Initialize storage service only when needed
            if self.storage is None:
                self.storage = StorageService()

            # Extract EXIF data before uploading (as file pointer will be consumed)
            exif_data = extract_exif_data(photo_file)
            
            # Reset file pointer to beginning for S3 upload
            photo_file.seek(0)
            
            # Upload to S3
            s3_key, url = self.storage.upload_file(photo_file, filename)
            
            # Create or get tags
            tags = []
            for tag_name in metadata.get('tags', []):
                tag = self.db.session.query(Tag).get(tag_name)
                if not tag:
                    tag = Tag(name=tag_name)
                    self.db.session.add(tag)
                tags.append(tag)

            # Get people
            people = []
            for person_id in metadata.get('people', []):
                person = self.db.session.query(Person).get(person_id)
                if person:
                    people.append(person)

            # Create photo record
            location = metadata.get('location') or {}
            current_time = datetime.now(timezone.utc)
            new_photo = Photo(
                file_name=filename,
                s3_key=s3_key,
                url=url,
                title=metadata.get('title', filename),
                upload_date=current_time,
                description=metadata.get('description', ''),
                location_name=location.get('name'),
                latitude=location.get('latitude'),
                longitude=location.get('longitude'),
                date_taken=exif_data.get('date_taken') or current_time,
                author=exif_data.get('author'),
                tags=tags,
                people=people
            )

            self.db.session.add(new_photo)
            self.db.session.commit()
            
            return new_photo.to_dict()

        except Exception as e:
            self.db.session.rollback()
            # Clean up S3 file if database operation fails
            if 's3_key' in locals():
                try:
                    self.storage.delete_file(s3_key)
                except Exception:
                    pass  # Best effort cleanup
            raise Exception(f"Failed to upload photo: {str(e)}")

    def get_photos(self, search_criteria: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Get photos based on structured search criteria.
        
        This method is optimized for filtering photos using exact criteria such as date ranges,
        specific tags, or people. It performs exact matches and is ideal for filtering through
        UI components like date pickers, tag selectors, etc.
        
        Args:
            search_criteria: Dictionary containing:
                - tags: List[str] - Tag names to filter by (AND condition - must have ALL tags)
                - people: List[int] - Person IDs to filter by
                - start_date: datetime - Filter photos taken after this date
                - end_date: datetime - Filter photos taken before this date
                - location: str - Exact location name to filter by
        
        Returns:
            List of photo dictionaries matching all the provided criteria
        
        Example:
            >>> criteria = {
            ...     'tags': ['family', 'vacation'],  # Photos must have BOTH 'family' AND 'vacation' tags
            ...     'start_date': datetime(2024, 1, 1),
            ...     'end_date': datetime(2024, 12, 31)
            ... }
            >>> photos = photo_service.get_photos(criteria)
        """
        try:
            query = self.db.session.query(Photo)

            if 'tags' in search_criteria and search_criteria['tags']:
                # Use AND condition for tags - photo must have ALL specified tags
                for tag_name in search_criteria['tags']:
                    query = query.filter(Photo.tags.any(Tag.name == tag_name))

            if 'people' in search_criteria:
                query = query.filter(Photo.people.any(Person.id.in_(search_criteria['people'])))

            if 'start_date' in search_criteria:
                query = query.filter(Photo.date_taken >= search_criteria['start_date'])

            if 'end_date' in search_criteria:
                query = query.filter(Photo.date_taken <= search_criteria['end_date'])

            if 'location' in search_criteria:
                query = query.filter(Photo.location_name.ilike(f"%{search_criteria['location']}%"))

            photos = query.order_by(Photo.date_taken.desc()).all()
            return [photo.to_dict() for photo in photos]

        except Exception as e:
            raise Exception(f"Failed to get photos: {str(e)}")

    def get_photo(self, photo_id: int) -> Dict[str, Any]:
        """Get a single photo by ID."""
        try:
            photo = self.db.session.query(Photo).get(photo_id)
            if not photo:
                raise ValueError(f"Photo with ID {photo_id} not found")
            return photo.to_dict()
        except Exception as e:
            raise Exception(f"Failed to get photo: {str(e)}")

    def delete_photo(self, photo_id: int) -> bool:
        """Delete a photo and its S3 object.
        
        Args:
            photo_id: ID of the photo to delete

        Returns:
            True if photo was successfully deleted

        Raises:
            ValueError: If photo is not found
            Exception: If deletion fails
        """
        try:
            photo = self.db.session.query(Photo).get(photo_id)
            if not photo:
                raise ValueError(f"Photo with ID {photo_id} not found")

            # Initialize storage service only when needed
            if self.storage is None:
                self.storage = StorageService()

            try:
                # Delete from S3
                self.storage.delete_file(photo.s3_key)

                # Delete from database
                self.db.session.delete(photo)
                self.db.session.commit()
                return True

            except Exception as e:
                self.db.session.rollback()
                raise Exception(f"Failed to delete photo: {str(e)}")

        except ValueError as e:
            self.db.session.rollback()
            raise e

    def get_tags(self) -> List[str]:
        """Get all unique tags."""
        try:
            tags = self.db.session.query(Tag).order_by(Tag.name).all()
            return [tag.name for tag in tags]
        except Exception as e:
            raise Exception(f"Failed to get tags: {str(e)}")

    def search_photos(self, query: str) -> List[Dict[str, Any]]:
        """
        Search photos using free-text search across multiple fields.
        
        This method performs a fuzzy text search across various photo fields including
        title, description, tags, location, and associated people's names. It's ideal
        for search bar functionality where users can enter any keywords.
        
        The search is:
        - Case-insensitive
        - Matches partial words
        - Searches across multiple fields
        - Supports multiple search terms (space-separated)
        
        Fields searched:
        - Photo title
        - Photo description
        - Location name
        - Tag names
        - Associated people's names
        
        Args:
            query: str - Space-separated search terms
                       Example: "Paris vacation 2024"
        
        Returns:
            List of photo dictionaries matching any of the search terms,
            ordered by date taken (most recent first), limited to 50 results
        
        Example:
            >>> photos = photo_service.search_photos("Paris summer")
            # Will find photos with "Paris" or "summer" in any of the searchable fields
        """
        if not query:
            return []

        # Split query into terms for better matching
        terms = [term.strip() for term in query.split() if term.strip()]
        
        # Start with the base query from get_photos
        search_criteria = {}
        base_query = self.db.session.query(Photo).distinct()

        # Add text search conditions
        text_conditions = []
        for term in terms:
            term_pattern = f"%{term}%"
            text_conditions.append(
                or_(
                    Photo.title.ilike(term_pattern),
                    Photo.description.ilike(term_pattern),
                    Photo.location_name.ilike(term_pattern),
                    Photo.tags.any(Tag.name.ilike(term_pattern)),
                    Photo.people.any(or_(
                        Person.first_name.ilike(term_pattern),
                        Person.last_name.ilike(term_pattern)
                    ))
                )
            )
        
        if text_conditions:
            base_query = base_query.filter(or_(*text_conditions))

        # Get photos with text search applied
        photos = base_query.order_by(Photo.date_taken.desc()).limit(50)
        
        return [photo.to_dict() for photo in photos.all()]
