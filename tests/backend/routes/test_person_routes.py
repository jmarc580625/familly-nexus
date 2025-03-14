from unittest.mock import patch, Mock
import pytest
from flask import Flask
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
def mock_person_service():
    mock = Mock()
    with patch('familly_nexus.backend.routes.routes.PersonService', autospec=True) as mock_service:
        mock_service.return_value = mock
        yield mock

def test_create_person_success(client, mock_person_service):
    mock_person_service.create_person.return_value = None
    data = {
        'first_name': 'John',
        'last_name': 'Doe',
        'birth_date': '1990-01-01',
    }
    
    response = client.post('/persons',
                          json=data,
                          content_type='application/json')
    
    assert response.status_code == 200
    mock_person_service.create_person.assert_called_once_with(data)

def test_get_person_success(client, mock_person_service):
    return # Remove this line when route is implemented
    mock_person_service.get_person.return_value = {
        "id": 1,
        "name": "John Doe",
        "birth_date": "1990-01-01",
        "gender": "M"
    }
    
    response = client.get('/persons/1')
    
    assert response.status_code == 200
    assert response.json["name"] == "John Doe"
    mock_person_service.get_person.assert_called_once_with(1)

def test_get_person_not_found(client, mock_person_service):
    return # Remove this line when route is implemented
    mock_person_service.get_person.return_value = None
    
    response = client.get('/persons/999')
    
    assert response.status_code == 404
    assert response.json == {"error": "Person not found"}

def test_update_person_success(client, mock_person_service):
    mock_person_service.update_person.return_value = None
    data = {
        'last_name': 'Updated Doe',
    }
    
    response = client.put('/persons/1',
                         json=data,
                         content_type='application/json')
    
    assert response.status_code == 200
    mock_person_service.update_person.assert_called_once_with(1, data)

def test_delete_person_success(client, mock_person_service):
    return # Remove this line when route is implemented
    mock_person_service.delete_person.return_value = True
    
    response = client.delete('/persons/1')
    
    assert response.status_code == 204
    mock_person_service.delete_person.assert_called_once_with(1)

def test_list_persons_success(client, mock_person_service):
    return # Remove this line when route is implemented
    mock_persons = [
        {"id": 1, "name": "John Doe"},
        {"id": 2, "name": "Jane Doe"}
    ]
    mock_person_service.list_persons.return_value = mock_persons
    
    response = client.get('/persons')
    
    assert response.status_code == 200
    assert len(response.json) == 2
    assert response.json == mock_persons
    mock_person_service.list_persons.assert_called_once()
