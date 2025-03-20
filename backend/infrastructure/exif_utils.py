from datetime import datetime
from typing import Dict, Any, Optional
from PIL import Image
from PIL.ExifTags import TAGS

def extract_exif_data(photo_file) -> Dict[str, Any]:
    """
    Extract relevant EXIF data from a photo file.
    
    Args:
        photo_file: File object containing the photo
        
    Returns:
        Dictionary containing:
            - date_taken: DateTime when the photo was taken
            - camera_make: Camera manufacturer
            - camera_model: Camera model
            - author: Photo author/artist
            - copyright: Copyright information
            - gps: Dictionary with latitude and longitude if available
    """
    try:
        image = Image.open(photo_file)
        exif_data = {}
        
        if not hasattr(image, '_getexif'):
            return exif_data
            
        exif_info = image._getexif()
        if not exif_info:
            return exif_data

        # Map common EXIF tags to our desired fields
        exif_mapping = {
            'DateTimeOriginal': 'date_taken',
            'Make': 'camera_make',
            'Model': 'camera_model',
            'Artist': 'author',
            'Copyright': 'copyright',
            'GPSInfo': 'gps'
        }

        for tag, value in exif_info.items():
            tag_name = TAGS.get(tag, tag)
            if tag_name in exif_mapping:
                field_name = exif_mapping[tag_name]
                
                # Special handling for dates
                if field_name == 'date_taken' and value:
                    try:
                        exif_data[field_name] = datetime.strptime(str(value), '%Y:%m:%d %H:%M:%S')
                    except ValueError:
                        pass
                
                # Special handling for GPS data
                elif field_name == 'gps' and value:
                    coords = _extract_gps_coords(value)
                    if coords:
                        exif_data[field_name] = coords
                
                # All other fields
                else:
                    exif_data[field_name] = value

        return exif_data

    except Exception as e:
        print(f"Error extracting EXIF data: {str(e)}")
        return {}

def _extract_gps_coords(gps_info: Dict) -> Optional[Dict[str, float]]:
    """
    Extract latitude and longitude from GPS EXIF data.
    
    Args:
        gps_info: Dictionary containing GPS EXIF data
        
    Returns:
        Dictionary with latitude and longitude if available, None otherwise
    """
    try:
        def _convert_to_degrees(value, ref):
            deg = value[0][0] / value[0][1]
            min = value[1][0] / value[1][1]
            sec = value[2][0] / value[2][1]
            
            coords = deg + (min / 60.0) + (sec / 3600.0)
            
            if ref in ['S', 'W']:
                coords = -coords
                
            return coords

        if 1 in gps_info and 2 in gps_info and 3 in gps_info and 4 in gps_info:
            lat = _convert_to_degrees(gps_info[2], gps_info[1])
            lon = _convert_to_degrees(gps_info[4], gps_info[3])
            
            return {
                'latitude': lat,
                'longitude': lon
            }
            
    except Exception as e:
        print(f"Error extracting GPS coordinates: {str(e)}")
        
    return None
