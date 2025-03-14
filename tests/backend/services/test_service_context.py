import pytest
from flask import Flask
from familly_nexus.backend.services.service_context import ServiceContext

def test_singleton_pattern():
    # Test that ServiceContext follows singleton pattern
    context1 = ServiceContext()
    context2 = ServiceContext()
    assert context1 is context2

def test_db_property():
    context = ServiceContext()
    assert context.db is not None
    assert context.db == ServiceContext.db

def test_initialize_with_default_url(monkeypatch):
    # Test initialization with default database URL
    # Override default URL for testing to use SQLite
    app = Flask(__name__)
    
    # Mock the environment variable to avoid interference from .env
    monkeypatch.setenv("DATABASE_URL", "sqlite:///:memory:")
    ServiceContext.DEFAULT_DATABASE_URL = "sqlite:///:memory:"
    context = ServiceContext()

    context.initialize(app)
    
    assert app.config['SQLALCHEMY_DATABASE_URI'] == ServiceContext.DEFAULT_DATABASE_URL

def test_initialize_with_url():
    app = Flask(__name__)
    context = ServiceContext()
    test_db_url = "sqlite:///:memory:"
    
    # Test initialization with custom database URL
    context.initialize(app, database_url=test_db_url)
    
    assert app.config['SQLALCHEMY_DATABASE_URI'] == test_db_url
    assert app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] is False
    assert ServiceContext._initialized is True

