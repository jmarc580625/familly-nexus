from io import BytesIO
import pytest
from flask import Flask
from unittest.mock import patch, Mock
from api.v1.routes import api

@pytest.fixture
def app():
    app = Flask(__name__)
    return app

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture(autouse=True)
def setup_api(app):
    app.register_blueprint(api)

@pytest.fixture
def mock_service_context():
    with patch('api.v1.routes.ServiceContext') as mock_service:
        mock_instance = Mock()
        mock_service.return_value = mock_instance
        yield mock_instance

@pytest.fixture
def mock_photo_service(mock_service_context):
    # Create a new mock for each test
    mock_instance = Mock()
    # Patch the get_photo_service function instead of PhotoService class
    with patch('api.v1.routes.get_photo_service', return_value=mock_instance):
        print(f"\nCreate mock: {mock_instance}")
        yield mock_instance

def test_upload_photo_success(client, mock_photo_service):
    # Arrange
    mock_photo_service.upload_photo.return_value = {"id": 1, "filename": "test.jpg"}
    data = {
        'photo': (BytesIO(b'test photo content'), 'test.jpg'),
        'description': 'Test photo description'
    }
    
    # Act
    response = client.post('/photos', 
                          data=data,
                          content_type='multipart/form-data')
    
    # Assert
    assert response.status_code == 200
    assert response.json['success'] is True
    assert 'data' in response.json
    mock_photo_service.upload_photo.assert_called_once()

def test_upload_photo_no_file(client, mock_photo_service):
    # Act
    response = client.post('/photos',
                          data={'description': 'Test description'},
                          content_type='multipart/form-data')
    
    # Assert
    assert response.status_code == 400
    assert response.json['success'] is False
    assert response.json['error']['code'] == 'NO_PHOTO_PROVIDED'
    mock_photo_service.upload_photo.assert_not_called()

def test_upload_photo_service_error(client, mock_photo_service):
    # Arrange
    print(f"\nSetting up error mock: {mock_photo_service}")
    mock_photo_service.upload_photo.side_effect = RuntimeError("Upload failed")
    print(f"Mock side effect set: {mock_photo_service.upload_photo.side_effect}")
    print(f"Mock return value: {mock_photo_service.upload_photo.return_value}")
    
    data = {
        'photo': (BytesIO(b'test photo content'), 'test.jpg'),
        'description': 'Test photo'
    }
    
    # Act
    response = client.post('/photos',
                          data=data, 
                          content_type='multipart/form-data')
    
    print(f"\nResponse status: {response.status_code}")
    print(f"Response data: {response.json}")
    
    # Assert
    assert response.status_code == 500
    assert response.json['success'] is False
    assert response.json['error']['code'] == 'INTERNAL_ERROR'
    mock_photo_service.upload_photo.assert_called_once()
