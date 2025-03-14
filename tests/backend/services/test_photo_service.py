import pytest
from unittest.mock import Mock, patch, PropertyMock
from datetime import datetime
from io import BytesIO
from flask import Flask
from familly_nexus.backend.services.photo_service import PhotoService
from familly_nexus.backend.services.service_context import ServiceContext
from familly_nexus.backend.models.photo import Photo

@pytest.fixture
def app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    return app

@pytest.fixture
def mock_db():
    db = Mock()
    db.session = Mock()
    return db

@pytest.fixture
def service_context(mock_db):
    context = Mock(ServiceContext)
    context.db = mock_db
    return context

@pytest.fixture
def photo_service(service_context):
    return PhotoService(service_context)

def test_upload_photo_success(photo_service, mock_db):
    # Arrange
    photo_file = BytesIO(b"fake image data")
    filename = "test.jpg"
    description = "Test photo"
    mock_exif = {"date_taken": "2023-01-01"}
    
    with patch("familly_nexus.backend.services.photo_service.extract_exif_data") as mock_extract:
        mock_extract.return_value = mock_exif
        
        # Act
        photo_service.upload_photo(photo_file, filename, description)
        
        # Assert
        mock_db.session.add.assert_called_once()
        mock_db.session.commit.assert_called_once()

def test_get_photos_success(photo_service, app):
    # Arrange
    mock_photos = [
        Mock(to_dict=lambda: {"id": 1, "file_name": "test1.jpg"}),
        Mock(to_dict=lambda: {"id": 2, "file_name": "test2.jpg"})
    ]
    
    with app.app_context():
        with patch.object(Photo, 'query', new_callable=PropertyMock) as mock_query:
            mock_query.return_value.filter_by.return_value.all.return_value = mock_photos
            
            # Act
            result = photo_service.get_photos({"file_name": "test"})
            
            # Assert
            assert len(result) == 2
            assert result[0]["id"] == 1
            assert result[1]["file_name"] == "test2.jpg"

