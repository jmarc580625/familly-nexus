from datetime import date, datetime, timezone
import pytest
from flask import Flask

from core.models.db import db
from core.models.person import Person
from core.models.photo import Photo

@pytest.fixture(scope='module')
def test_app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    return app

@pytest.fixture(scope='module')
def test_db(test_app):
    db.init_app(test_app)
    with test_app.app_context():
        db.create_all()
        yield db
        db.session.remove()
        db.drop_all()

@pytest.fixture(autouse=True)
def setup_method(test_db, test_app):
    with test_app.app_context():
        test_db.session.begin_nested()
        yield
        test_db.session.rollback()

def test_person_model(test_db):
    # Test creating a person with all fields
    person = Person(
        first_name="John",
        last_name="Doe",
        birth_date=date(1990, 1, 1),
        death_date=None,
        description="Test person"
    )
    test_db.session.add(person)
    test_db.session.commit()

    # Verify all fields
    assert person.id is not None
    assert person.first_name == "John"
    assert person.last_name == "Doe"
    assert person.birth_date == date(1990, 1, 1)
    assert person.death_date is None
    assert person.description == "Test person"

    # Test retrieving the person
    retrieved_person = test_db.session.get(Person, person.id)
    assert retrieved_person.first_name == "John"
    assert retrieved_person.last_name == "Doe"

def test_photo_model(test_db):
    # Create a test person first
    person = Person(
        first_name="John",
        last_name="Doe"
    )
    test_db.session.add(person)
    test_db.session.commit()

    # Test creating a photo with all fields
    test_date = datetime(2024, 1, 1, tzinfo=timezone.utc)
    photo = Photo(
        file_name="test.jpg",
        s3_key="photos/test.jpg",
        url="https://example.com/photos/test.jpg",
        title="Test Photo",
        upload_date=test_date,
        description="Test photo",
        location_name="Seattle",
        latitude=47.6062,
        longitude=-122.3321,
        date_taken=test_date,
        author="Test Author",
        people=[person]
    )
    test_db.session.add(photo)
    test_db.session.commit()

    # Verify all fields
    assert photo.id is not None
    assert photo.file_name == "test.jpg"
    assert photo.title == "Test Photo"
    assert photo.description == "Test photo"
    assert photo.location_name == "Seattle"
    assert photo.latitude == 47.6062
    assert photo.longitude == -122.3321
    
    # Normalize timezone for comparison
    stored_date_taken = photo.date_taken.replace(tzinfo=timezone.utc) if photo.date_taken else None
    stored_upload_date = photo.upload_date.replace(tzinfo=timezone.utc) if photo.upload_date else None
    
    assert stored_date_taken == test_date
    assert stored_upload_date == test_date
    assert photo.author == "Test Author"
    assert photo.s3_key == "photos/test.jpg"
    assert photo.url == "https://example.com/photos/test.jpg"
    assert len(photo.people) == 1
    assert photo.people[0].id == person.id

    # Test retrieving the photo
    retrieved_photo = test_db.session.get(Photo, photo.id)
    assert retrieved_photo.file_name == "test.jpg"
    assert retrieved_photo.description == "Test photo"

def test_person_model_constraints(test_db):
    # Test required fields
    with pytest.raises(Exception) as exc_info:
        empty_person = Person()
        test_db.session.add(empty_person)
        test_db.session.commit()
    assert "first_name" in str(exc_info.value) or "last_name" in str(exc_info.value)
    test_db.session.rollback()

def test_photo_model_constraints(test_db):
    # Test required fields
    with pytest.raises(Exception) as exc_info:
        empty_photo = Photo()
        test_db.session.add(empty_photo)
        test_db.session.commit()
    assert "file_name" in str(exc_info.value) or "s3_key" in str(exc_info.value) or "url" in str(exc_info.value)
    test_db.session.rollback()
