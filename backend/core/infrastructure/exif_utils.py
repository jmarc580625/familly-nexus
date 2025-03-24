from datetime import datetime
from typing import Dict, Any, BinaryIO
from PIL import Image, ExifTags

def extract_exif_data(photo_file: BinaryIO) -> Dict[str, Any]:
    """
    Extract EXIF data from a photo file.
    
    Args:
        photo_file: The photo file object
    
    Returns:
        Dictionary containing EXIF data:
            - date_taken: datetime
            - author: str
            - camera_make: str
            - camera_model: str
            - focal_length: float
            - f_number: float
            - exposure_time: str
            - iso: int
    """
    try:
        # Reset file pointer to beginning before reading
        photo_file.seek(0)
        img = Image.open(photo_file)
        if not hasattr(img, '_getexif') or not img._getexif():
            return {}

        exif = {
            ExifTags.TAGS[k]: v
            for k, v in img._getexif().items()
            if k in ExifTags.TAGS
        }

        # Extract date taken
        date_taken = None
        if 'DateTimeOriginal' in exif:
            try:
                date_taken = datetime.strptime(exif['DateTimeOriginal'], '%Y:%m:%d %H:%M:%S')
            except ValueError:
                pass

        # Extract author
        author = None
        if 'Artist' in exif:
            author = exif['Artist']

        # Extract camera info
        camera_make = exif.get('Make')
        camera_model = exif.get('Model')
        focal_length = exif.get('FocalLength')
        f_number = exif.get('FNumber')
        exposure_time = exif.get('ExposureTime')
        iso = exif.get('ISOSpeedRatings')

        # Reset file pointer to beginning after reading
        photo_file.seek(0)

        return {
            'date_taken': date_taken,
            'author': author,
            'camera_make': camera_make,
            'camera_model': camera_model,
            'focal_length': float(focal_length) if focal_length else None,
            'f_number': float(f_number) if f_number else None,
            'exposure_time': str(exposure_time) if exposure_time else None,
            'iso': int(iso) if iso else None
        }
    except Exception:
        # If anything goes wrong, return empty dict
        return {}
    finally:
        # Always make sure to reset the file pointer
        try:
            photo_file.seek(0)
        except:
            pass
