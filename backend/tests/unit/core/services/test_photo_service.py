import pytest
from unittest.mock import Mock, patch, PropertyMock
from datetime import datetime, timezone
from io import BytesIO
from flask import Flask
from core.services.photo_service import PhotoService
from core.services.service_context import ServiceContext
from core.models.photo import Photo

@pytest.fixture
def app():
    return Flask(__name__)

@pytest.fixture
def mock_db():
    db = Mock()
    db.session = Mock()
    return db

@pytest.fixture
def service_context(mock_db):
    context = Mock(ServiceContext)
    type(context).db = PropertyMock(return_value=mock_db)
    return context

@pytest.fixture
def mock_storage():
    with patch('core.services.photo_service.StorageService') as mock_storage_class:
        mock_storage = Mock()
        mock_storage.upload_file.return_value = ('test_s3_key', 'http://example.com/test.jpg')
        mock_storage_class.return_value = mock_storage
        yield mock_storage

@pytest.fixture
def photo_service(service_context):
    return PhotoService(service_context)

def test_upload_photo_success(photo_service, mock_db, mock_storage, app):
    # Arrange
    photo_file = BytesIO(b"fake image data")
    photo_file.filename = "test.jpg"
    metadata = {
        'title': 'Test Photo',
        'description': 'Test photo description',
        'tags': ['family', 'vacation'],
        'people': [1, 2],
        'location': {
            'name': 'Test Location',
            'latitude': 12.34,
            'longitude': 56.78
        }
    }
    
    # Mock database queries
    mock_tag = Mock()
    mock_tag.name = 'family'
    mock_person = Mock()
    mock_person.id = 1
    mock_photo = Mock()
    mock_photo.to_dict.return_value = {
        'id': 1,
        'title': 'Test Photo',
        'url': 'http://example.com/test.jpg'
    }

    # Set up mock query chain
    mock_query = Mock()
    mock_query.get.side_effect = [mock_tag, None, mock_person, mock_person]
    mock_db.session.query.return_value = mock_query

    # Mock Tag and Photo classes
    mock_tag_class = Mock()
    mock_tag_class.return_value = mock_tag
    mock_photo_class = Mock()
    mock_photo_class.return_value = mock_photo
    
    with app.app_context():
        with patch('core.services.photo_service.Tag', mock_tag_class), \
             patch('core.services.photo_service.Photo', mock_photo_class), \
             patch('core.services.photo_service.extract_exif_data') as mock_extract:
            mock_extract.return_value = {
                'date_taken': datetime(2024, 1, 1, tzinfo=timezone.utc),
                'author': 'Test Author'
            }
            
            # Act
            result = photo_service.upload_photo(photo_file, metadata)
            
            # Assert
            mock_storage.upload_file.assert_called_once()
            mock_db.session.add.assert_called()
            mock_db.session.commit.assert_called_once()
            assert result is not None

def test_get_photos_success(photo_service, mock_db, app):
    # Arrange
    mock_photos = [
        Mock(to_dict=lambda: {"id": 1, "title": "Photo 1"}),
        Mock(to_dict=lambda: {"id": 2, "title": "Photo 2"})
    ]
    
    # Set up mock query chain
    mock_query = Mock()
    mock_query.order_by.return_value.all.return_value = mock_photos
    mock_db.session.query.return_value = mock_query
    
    with app.app_context():
        # Act
        result = photo_service.get_photos({})
        
        # Assert
        assert len(result) == 2
        assert result[0]["id"] == 1
        assert result[1]["id"] == 2

def test_delete_photo_success(photo_service, mock_db, mock_storage, app):
    # Arrange
    photo_id = 1
    mock_photo = Mock()
    mock_photo.s3_key = 'test_s3_key'
    
    # Set up mock query chain
    mock_query = Mock()
    mock_query.get.return_value = mock_photo
    mock_db.session.query.return_value = mock_query
    
    with app.app_context():
        # Act
        result = photo_service.delete_photo(photo_id)
        
        # Assert
        assert result is True
        mock_storage.delete_file.assert_called_once_with('test_s3_key')
        mock_db.session.delete.assert_called_once_with(mock_photo)
        mock_db.session.commit.assert_called_once()

def test_delete_photo_not_found(photo_service, mock_db, app):
    # Arrange
    photo_id = 999
    mock_query = Mock()
    mock_query.get.return_value = None
    mock_db.session.query.return_value = mock_query
    
    with app.app_context():
        # Act/Assert
        with pytest.raises(ValueError) as exc_info:
            photo_service.delete_photo(photo_id)
        assert f"Photo with ID {photo_id} not found" in str(exc_info.value)
