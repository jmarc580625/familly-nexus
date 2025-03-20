import pytest
from PIL import Image
from infrastructure.exif_utils import extract_exif_data
from io import BytesIO

@pytest.fixture
def sample_image_with_exif():
    # Create a test image with EXIF data
    img = Image.new('RGB', (100, 100))
    img_io = BytesIO()
    img.save(img_io, 'JPEG', exif=Image.Exif())
    img_io.seek(0)
    return img_io

@pytest.fixture
def sample_image_without_exif():
    # Create a test image without EXIF data
    img = Image.new('RGB', (100, 100))
    img_io = BytesIO()
    img.save(img_io, 'PNG')
    img_io.seek(0)
    return img_io

def test_extract_exif_data_with_exif(sample_image_with_exif):
    exif_data = extract_exif_data(sample_image_with_exif)
    assert isinstance(exif_data, dict)
    
def test_extract_exif_data_without_exif(sample_image_without_exif):
    exif_data = extract_exif_data(sample_image_without_exif)
    assert isinstance(exif_data, dict)
    assert len(exif_data) == 0
