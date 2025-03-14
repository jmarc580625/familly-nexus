from datetime import date, datetime
import pytest
from flask import Flask

from familly_nexus.backend.models.db import db
from familly_nexus.backend.models.person import Person
from familly_nexus.backend.models.photo import Photo

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
    # Test creating a photo with all fields
    photo = Photo(
        file_name="test.jpg",
        upload_date=datetime.now(),
        uploader=1,
        description="Test photo",
        location="47.6062° N, 122.3321° W",
        date_taken=date(2024, 1, 1),
        author="Test Author"
    )
    test_db.session.add(photo)
    test_db.session.commit()

    # Verify all fields
    assert photo.id is not None
    assert photo.file_name == "test.jpg"
    assert photo.uploader == 1
    assert photo.description == "Test photo"
    assert photo.location == "47.6062° N, 122.3321° W"
    assert photo.date_taken == date(2024, 1, 1)
    assert photo.author == "Test Author"

    # Test retrieving the photo
    retrieved_photo = test_db.session.get(Photo, photo.id)
    assert retrieved_photo.file_name == "test.jpg"
    assert retrieved_photo.description == "Test photo"

def test_person_model_constraints(test_db):
    # Test required fields
    empty_person = Person()
    with pytest.raises(Exception):
        test_db.session.add(empty_person)
        test_db.session.commit()
    test_db.session.rollback()

def test_photo_model_constraints(test_db):
    # Test required fields
    empty_photo = Photo()
    with pytest.raises(Exception):
        test_db.session.add(empty_photo)
        test_db.session.commit()
    test_db.session.rollback()
