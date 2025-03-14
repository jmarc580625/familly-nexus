from PIL import Image
from PIL.ExifTags import TAGS

def extract_exif_data(photo_file):
    image = Image.open(photo_file)
    exif_data = {}
    if hasattr(image, '_getexif'):
        exif_info = image._getexif()
        if exif_info is not None:
            for tag, value in exif_info.items():
                tag_name = TAGS.get(tag, tag)
                exif_data[tag_name] = value
    return exif_data
