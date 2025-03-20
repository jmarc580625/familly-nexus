import pytest
from unittest.mock import Mock, patch, PropertyMock
from datetime import date
from flask import Flask
from core.services.person_service import PersonService
from core.services.service_context import ServiceContext
from core.services.service_exceptions import NotFoundException
from core.models.person import Person

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
def person_service(service_context):
    return PersonService(service_context)

def test_create_person_success(person_service, mock_db):
    # Arrange
    person_data = {
        "first_name": "John",
        "last_name": "Doe",
        "birth_date": date(1990, 1, 1)
    }
    mock_person = Mock()
    mock_person.to_dict.return_value = {**person_data, "id": 1}
    
    # Mock Person class
    with patch('core.services.person_service.Person') as mock_person_class:
        mock_person_class.return_value = mock_person
        
        # Act
        result = person_service.create_person(person_data)
        
        # Assert
        mock_person_class.assert_called_once_with(**person_data)
        mock_db.session.add.assert_called_once_with(mock_person)
        mock_db.session.commit.assert_called_once()
        assert result == {**person_data, "id": 1}

def test_create_person_missing_required_fields(person_service):
    # Arrange
    person_data = {
        "first_name": "John"
        # Missing last_name
    }
    
    # Act/Assert
    with pytest.raises(ValueError) as exc_info:
        person_service.create_person(person_data)
    assert "Missing required fields" in str(exc_info.value)

def test_get_persons_success(person_service, mock_db):
    # Arrange
    mock_persons = [
        Mock(to_dict=lambda: {"id": 1, "first_name": "John", "last_name": "Doe"}),
        Mock(to_dict=lambda: {"id": 2, "first_name": "Jane", "last_name": "Doe"})
    ]
    
    # Set up mock query chain
    mock_query = Mock()
    mock_query.all.return_value = mock_persons
    mock_db.session.query.return_value = mock_query
    
    # Act
    result = person_service.get_persons()
    
    # Assert
    assert len(result) == 2
    assert result[0]["id"] == 1
    assert result[1]["id"] == 2

def test_get_persons_with_filters(person_service, mock_db):
    # Arrange
    mock_persons = [
        Mock(to_dict=lambda: {"id": 1, "first_name": "John", "last_name": "Doe"})
    ]
    
    # Set up mock query chain
    mock_query = Mock()
    mock_query.filter_by.return_value = mock_query
    mock_query.all.return_value = mock_persons
    mock_db.session.query.return_value = mock_query
    
    # Mock Person class attributes
    with patch('core.models.person.Person') as mock_person_class:
        setattr(mock_person_class, 'last_name', property())  # Mock the property
        
        # Act
        result = person_service.get_persons({"last_name": "Doe", "invalid_field": "value"})
        
        # Assert
        mock_query.filter_by.assert_called_once_with(last_name="Doe")
        assert len(result) == 1
        assert result[0]["last_name"] == "Doe"

def test_get_person_success(person_service, mock_db):
    # Arrange
    person_id = 1
    mock_person = Mock()
    mock_person.to_dict.return_value = {
        "id": person_id,
        "first_name": "John",
        "last_name": "Doe"
    }
    mock_db.session.get.return_value = mock_person
    
    # Act
    result = person_service.get_person(person_id)
    
    # Assert
    mock_db.session.get.assert_called_once_with(Person, person_id)
    assert result["id"] == person_id
    assert result["first_name"] == "John"

def test_get_person_not_found(person_service, mock_db):
    # Arrange
    person_id = 999
    mock_db.session.get.return_value = None
    
    # Act/Assert
    with pytest.raises(ValueError) as exc_info:
        person_service.get_person(person_id)
    assert f"Person with id {person_id} not found" in str(exc_info.value)

def test_update_person_success(person_service, mock_db):
    # Arrange
    person_id = 1
    update_data = {
        "first_name": "Jane",
        "last_name": "Smith"
    }
    mock_person = Mock(Person)
    mock_person.to_dict.return_value = {"id": person_id, **update_data}
    mock_db.session.get.return_value = mock_person
    
    # Mock Person class attributes
    with patch('core.services.person_service.Person') as mock_person_class:
        for field in update_data:
            setattr(mock_person_class, field, True)  # Just needs to exist
        
        # Act
        result = person_service.update_person(person_id, update_data)
        
        # Assert
        for key, value in update_data.items():
            assert getattr(mock_person, key) == value
        mock_db.session.commit.assert_called_once()
        assert result == {"id": person_id, **update_data}

def test_update_person_not_found(person_service, mock_db):
    # Arrange
    person_id = 999
    update_data = {"first_name": "Jane"}
    mock_db.session.get.return_value = None
    
    # Act/Assert
    with pytest.raises(ValueError) as exc_info:
        person_service.update_person(person_id, update_data)
    assert f"Person with id {person_id} not found" in str(exc_info.value)

def test_update_person_no_valid_fields(person_service, mock_db):
    # Arrange
    person_id = 1
    update_data = {"invalid_field": "value"}
    mock_person = Mock(Person)
    mock_db.session.get.return_value = mock_person
    
    # Act/Assert
    with pytest.raises(ValueError) as exc_info:
        person_service.update_person(person_id, update_data)
    assert "No valid fields to update" in str(exc_info.value)

def test_delete_person_success(person_service, mock_db):
    # Arrange
    person_id = 1
    mock_person = Mock(Person)
    mock_db.session.get.return_value = mock_person
    
    # Act
    result = person_service.delete_person(person_id)
    
    # Assert
    mock_db.session.delete.assert_called_once_with(mock_person)
    mock_db.session.commit.assert_called_once()
    assert result is True

def test_delete_person_not_found(person_service, mock_db):
    # Arrange
    person_id = 999
    mock_db.session.get.return_value = None
    
    # Act/Assert
    with pytest.raises(ValueError) as exc_info:
        person_service.delete_person(person_id)
    assert f"Person with id {person_id} not found" in str(exc_info.value)
