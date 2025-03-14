from io import BytesIO
import pytest
from flask import Flask
from unittest.mock import patch, Mock
from familly_nexus.backend.routes.routes import api

@pytest.fixture
def app():
    app = Flask(__name__)
    app.register_blueprint(api)
    return app

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def mock_photo_service():
    # Create mock instance with pre-configured methods
    mock = Mock()
    
    # Ensure we're patching the correct import path
    with patch('familly_nexus.backend.routes.routes.PhotoService', autospec=True) as mock_service:
        # Configure the mock class to return our pre-configured instance
        mock_service.return_value = mock
        yield mock

def test_upload_photo_success(client, mock_photo_service):
    mock_photo_service.upload_photo.return_value = None
    data = {
        'photo': (BytesIO(b'test photo content'), 'test.jpg'),
        'description': 'Test photo description'
    }
    
    response = client.post('/photos', 
                          data=data,
                          content_type='multipart/form-data')
    
    assert response.status_code == 200
    mock_photo_service.upload_photo.assert_called_once()

def test_upload_photo_no_file(client, mock_photo_service):
    response = client.post('/photos',
                          data={'description': 'Test description'},
                          content_type='multipart/form-data')
    
    assert response.status_code == 400
    mock_photo_service.upload_photo.assert_not_called()

def test_upload_photo_service_error(client, mock_photo_service):
    mock_photo_service.upload_photo.side_effect = Exception("Upload failed")
    data = {
        'photo': (BytesIO(b'test photo content'), 'test.jpg'),
        'description': 'Test photo'
    }
    
    response = client.post('/photos',
                          data=data, 
                          content_type='multipart/form-data')
    
    assert response.status_code == 500

def test_mock_photo_service_setup(mock_photo_service):
    """Verify the mock is properly configured"""
    mock_photo_service.upload_photo.return_value = {"id": 1, "filename": "test.jpg"}
    result = mock_photo_service.upload_photo("test", "test.jpg", "description")
    assert result == {"id": 1, "filename": "test.jpg"}
    mock_photo_service.upload_photo.assert_called_once_with("test", "test.jpg", "description")

