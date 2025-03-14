import pytest
from unittest.mock import Mock, patch, PropertyMock
from flask import Flask
from familly_nexus.backend.services.person_service import PersonService
from familly_nexus.backend.services.service_context import ServiceContext
from familly_nexus.backend.services.service_exceptions import NotFoundException
from familly_nexus.backend.models.person import Person

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
def person_service(service_context):
    return PersonService(service_context)

def test_create_person_success(person_service, mock_db):
    # Arrange
    person_data = {
        "first_name": "John",
        "last_name": "Doe",
        "birth_date": "1990-01-01"
    }
    
    # Act
    person_service.create_person(person_data)
    
    # Assert
    mock_db.session.add.assert_called_once()
    mock_db.session.commit.assert_called_once()

def test_get_persons_success(person_service, app):
    # Arrange
    mock_persons = [
        Mock(to_dict=lambda: {"id": 1, "name": "John Doe"}),
        Mock(to_dict=lambda: {"id": 2, "name": "Jane Doe"})
    ]
    
    with app.app_context():
        with patch.object(Person, 'query', new_callable=PropertyMock) as mock_query:
            mock_query.return_value.filter_by.return_value.all.return_value = mock_persons
            
            # Act
            result = person_service.get_persons({"name": "Doe"})
            
            # Assert
            assert len(result) == 2
            assert result[0]["id"] == 1
            assert result[1]["name"] == "Jane Doe"

def test_update_person_success(person_service, mock_db, app):
    # Arrange
    mock_person = Mock()
    mock_person.id = 1
    with app.app_context():
        with patch.object(Person, 'query') as mock_query:
            mock_query.get.return_value = mock_person
            
            # Act
            person_service.update_person(1, {"first_name": "John Updated"})
            
            # Assert
            mock_db.session.commit.assert_called_once()

def test_update_person_not_found(person_service, app):
    # Arrange
    with app.app_context():
        with patch.object(Person, 'query') as mock_query:
            mock_query.get.return_value = None
            
            # Act & Assert
            with pytest.raises(Exception) as e:
                person_service.update_person(999, {"first_name": "John"})
            
    
def test_delete_person_success(person_service, mock_db, app):
    # Arrange
    mock_person = Mock()
    mock_person.id = 1
    with app.app_context():
        with patch.object(Person, 'query') as mock_query:
            mock_query.get.return_value = mock_person
            
            # Act
            person_service.delete_person(1)
            
            # Assert
            mock_db.session.delete.assert_called_once_with(mock_person)
            mock_db.session.commit.assert_called_once()

def test_delete_person_not_found(person_service, app):
    # Arrange
    with app.app_context():
        with patch.object(Person, 'query') as mock_query:
            mock_query.get.return_value = None
            
            # Act & Assert
            with pytest.raises(Exception) as e:
                person_service.delete_person(999)


