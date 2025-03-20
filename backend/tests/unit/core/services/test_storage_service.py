import pytest
from unittest.mock import patch, Mock
from io import BytesIO
from botocore.exceptions import ClientError
from core.services.storage_service import StorageService

@pytest.fixture
def mock_s3_client():
    with patch('boto3.client') as mock_client:
        mock_s3 = Mock()
        mock_client.return_value = mock_s3
        yield mock_s3

@pytest.fixture
def storage_service(mock_s3_client):
    return StorageService()

def test_upload_file_success(storage_service, mock_s3_client):
    # Arrange
    test_file = BytesIO(b"test content")
    test_filename = "test.jpg"
    expected_s3_key = "photos/test.jpg"
    expected_url = "http://localhost:9000/family-nexus-photos/photos/test.jpg"
    
    # Act
    s3_key, url = storage_service.upload_file(test_file, test_filename)
    
    # Assert
    mock_s3_client.upload_fileobj.assert_called_once()
    assert s3_key.startswith("photos/")
    assert s3_key.endswith(".jpg")
    assert url.startswith("http://localhost:9000/family-nexus-photos/photos/")
    assert url.endswith(".jpg")

def test_delete_file_success(storage_service, mock_s3_client):
    # Arrange
    test_s3_key = "photos/test.jpg"
    
    # Act
    storage_service.delete_file(test_s3_key)
    
    # Assert
    mock_s3_client.delete_object.assert_called_once_with(
        Bucket='family-nexus-photos',
        Key=test_s3_key
    )

def test_ensure_bucket_exists_success(storage_service, mock_s3_client):
    # Arrange
    mock_s3_client.head_bucket.return_value = True
    
    # Act
    storage_service._ensure_bucket_exists()
    
    # Assert
    mock_s3_client.head_bucket.assert_called_once_with(Bucket='family-nexus-photos')
    mock_s3_client.create_bucket.assert_not_called()

def test_ensure_bucket_exists_create(storage_service, mock_s3_client):
    # Arrange
    mock_s3_client.head_bucket.side_effect = ClientError({
        'Error': {
            'Code': 'NoSuchBucket',
            'Message': 'The specified bucket does not exist'
        }
    }, 'HeadBucket')
    
    # Act
    storage_service._ensure_bucket_exists()
    
    # Assert
    mock_s3_client.head_bucket.assert_called_once_with(Bucket='family-nexus-photos')
    mock_s3_client.create_bucket.assert_called_once_with(Bucket='family-nexus-photos')
    mock_s3_client.put_bucket_policy.assert_called_once()
