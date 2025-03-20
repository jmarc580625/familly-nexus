import pytest
from unittest.mock import patch, Mock
from flask import Flask
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
def mock_person_service(mock_service_context):
    # Create a new mock for each test
    mock_instance = Mock()
    # Patch the get_person_service function instead of PersonService class
    with patch('api.v1.routes.get_person_service', return_value=mock_instance):
        yield mock_instance

def test_create_person_success(client, mock_person_service):
    # Arrange
    data = {
        'first_name': 'John',
        'last_name': 'Doe',
        'birth_date': '1990-01-01',
    }
    mock_person = {**data, 'id': 1}
    mock_person_service.create_person.return_value = mock_person
    
    # Act
    response = client.post('/persons',
                          json=data,
                          content_type='application/json')
    
    # Assert
    assert response.status_code == 200
    assert response.json['success'] is True
    assert response.json['data'] == mock_person
    mock_person_service.create_person.assert_called_once_with(data)

def test_create_person_validation_error(client, mock_person_service):
    # Arrange
    data = {
        'first_name': 'John',
        # Missing last_name
    }
    mock_person_service.create_person.side_effect = ValueError("Missing required fields")
    
    # Act
    response = client.post('/persons',
                          json=data,
                          content_type='application/json')
    
    # Assert
    assert response.status_code == 400
    assert response.json['success'] is False
    assert response.json['error']['code'] == 'VALIDATION_ERROR'
    assert 'Missing required fields' in response.json['error']['message']

def test_create_person_error(client, mock_person_service):
    # Arrange
    mock_person_service.create_person.side_effect = RuntimeError("Database error")
    data = {
        'first_name': 'John',
        'last_name': 'Doe',
        'birth_date': '1990-01-01',
    }
    
    # Act
    response = client.post('/persons',
                          json=data,
                          content_type='application/json')
    
    # Assert
    assert response.status_code == 500
    assert response.json['success'] is False
    assert response.json['error']['code'] == 'INTERNAL_ERROR'

def test_get_person_success(client, mock_person_service):
    # Arrange
    mock_person = {
        "id": 1,
        "first_name": "John",
        "last_name": "Doe",
        "birth_date": "1990-01-01"
    }
    mock_person_service.get_person.return_value = mock_person
    
    # Act
    response = client.get('/persons/1')
    
    # Assert
    assert response.status_code == 200
    assert response.json['success'] is True
    assert response.json['data'] == mock_person
    mock_person_service.get_person.assert_called_once_with(1)

def test_get_person_not_found(client, mock_person_service):
    # Arrange
    mock_person_service.get_person.side_effect = ValueError("Person not found")
    
    # Act
    response = client.get('/persons/999')
    
    # Assert
    assert response.status_code == 404
    assert response.json['success'] is False
    assert response.json['error']['code'] == 'NOT_FOUND'

def test_update_person_success(client, mock_person_service):
    # Arrange
    data = {
        'last_name': 'Updated Doe',
    }
    mock_person = {'id': 1, **data}
    mock_person_service.update_person.return_value = mock_person
    
    # Act
    response = client.put('/persons/1',
                         json=data,
                         content_type='application/json')
    
    # Assert
    assert response.status_code == 200
    assert response.json['success'] is True
    assert response.json['data'] == mock_person
    mock_person_service.update_person.assert_called_once_with(1, data)

def test_update_person_not_found(client, mock_person_service):
    # Arrange
    data = {'last_name': 'Updated Doe'}
    mock_person_service.update_person.side_effect = ValueError("Person not found")
    
    # Act
    response = client.put('/persons/999',
                         json=data,
                         content_type='application/json')
    
    # Assert
    assert response.status_code == 404
    assert response.json['success'] is False
    assert response.json['error']['code'] == 'NOT_FOUND'

def test_update_person_no_valid_fields(client, mock_person_service):
    # Arrange
    data = {'invalid_field': 'value'}
    mock_person_service.update_person.side_effect = ValueError("No valid fields to update")
    
    # Act
    response = client.put('/persons/1',
                         json=data,
                         content_type='application/json')
    
    # Assert
    assert response.status_code == 400
    assert response.json['success'] is False
    assert response.json['error']['code'] == 'VALIDATION_ERROR'
    assert 'No valid fields' in response.json['error']['message']

def test_update_person_error(client, mock_person_service):
    # Arrange
    mock_person_service.update_person.side_effect = RuntimeError("Database error")
    data = {
        'last_name': 'Updated Doe',
    }
    
    # Act
    response = client.put('/persons/999',
                         json=data,
                         content_type='application/json')
    
    # Assert
    assert response.status_code == 500
    assert response.json['success'] is False
    assert response.json['error']['code'] == 'INTERNAL_ERROR'

def test_delete_person_success(client, mock_person_service):
    # Arrange
    mock_person_service.delete_person.return_value = True
    
    # Act
    response = client.delete('/persons/1')
    
    # Assert
    assert response.status_code == 200
    assert response.json['success'] is True
    assert response.json.get('data') is None
    mock_person_service.delete_person.assert_called_once_with(1)

def test_delete_person_not_found(client, mock_person_service):
    # Arrange
    mock_person_service.delete_person.side_effect = ValueError("Person not found")
    
    # Act
    response = client.delete('/persons/999')
    
    # Assert
    assert response.status_code == 404
    assert response.json['success'] is False
    assert response.json['error']['code'] == 'NOT_FOUND'

def test_delete_person_error(client, mock_person_service):
    # Arrange
    mock_person_service.delete_person.side_effect = RuntimeError("Database error")
    
    # Act
    response = client.delete('/persons/1')
    
    # Assert
    assert response.status_code == 500
    assert response.json['success'] is False
    assert response.json['error']['code'] == 'INTERNAL_ERROR'

def test_list_persons_success(client, mock_person_service):
    # Arrange
    mock_persons = [
        {"id": 1, "first_name": "John", "last_name": "Doe"},
        {"id": 2, "first_name": "Jane", "last_name": "Doe"}
    ]
    mock_person_service.get_persons.return_value = mock_persons
    
    # Act
    response = client.get('/persons')
    
    # Assert
    assert response.status_code == 200
    assert response.json['success'] is True
    assert response.json['data'] == mock_persons
    mock_person_service.get_persons.assert_called_once_with({})

def test_list_persons_with_filters(client, mock_person_service):
    # Arrange
    mock_persons = [
        {"id": 1, "first_name": "John", "last_name": "Doe"}
    ]
    mock_person_service.get_persons.return_value = mock_persons
    
    # Act
    response = client.get('/persons?last_name=Doe')
    
    # Assert
    assert response.status_code == 200
    assert response.json['success'] is True
    assert response.json['data'] == mock_persons
    mock_person_service.get_persons.assert_called_once_with({'last_name': 'Doe'})

def test_list_persons_error(client, mock_person_service):
    # Arrange
    mock_person_service.get_persons.side_effect = RuntimeError("Database error")
    
    # Act
    response = client.get('/persons')
    
    # Assert
    assert response.status_code == 500
    assert response.json['success'] is False
    assert response.json['error']['code'] == 'INTERNAL_ERROR'
