import pytest
from unittest.mock import patch, Mock
from flask import Flask
from core.services.service_context import ServiceContext

@pytest.fixture
def mock_db():
    with patch('core.services.service_context.db') as mock_db:
        yield mock_db

@pytest.fixture(autouse=True)
def reset_service_context():
    # Reset ServiceContext state before each test
    ServiceContext._instance = None
    ServiceContext._initialized = False
    yield

def test_singleton_pattern():
    # Test that ServiceContext follows singleton pattern
    context1 = ServiceContext()
    context2 = ServiceContext()
    assert context1 is context2

def test_db_property(mock_db):
    # Test that db property returns the SQLAlchemy db instance
    context = ServiceContext()
    db = context.db
    assert db is mock_db

def test_initialize_with_default_url(mock_db, monkeypatch):
    # Test initialization with default database URL
    app = Flask(__name__)
    
    # Mock the environment variable to avoid interference from .env
    monkeypatch.setenv("DATABASE_URL", "sqlite:///:memory:")
    test_db_url = "sqlite:///:memory:"
    
    context = ServiceContext()
    context.initialize(app, database_url=test_db_url)
    
    assert app.config['SQLALCHEMY_DATABASE_URI'] == test_db_url
    assert app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] is False
    mock_db.init_app.assert_called_once_with(app)

def test_initialize_with_url(mock_db):
    # Test initialization with custom database URL
    app = Flask(__name__)
    context = ServiceContext()
    test_db_url = "sqlite:///:memory:"
    
    context.initialize(app, database_url=test_db_url)
    
    assert app.config['SQLALCHEMY_DATABASE_URI'] == test_db_url
    assert app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] is False
    assert ServiceContext._initialized is True
    mock_db.init_app.assert_called_once_with(app)
