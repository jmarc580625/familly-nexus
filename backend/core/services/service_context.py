import os
from typing import Optional
from flask import Flask
from core.models.db import db

class ServiceContext:
    _instance: Optional['ServiceContext'] = None
    _initialized: bool = False

    def __new__(cls) -> 'ServiceContext':
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self) -> None:
        # Initialize only once
        if not self._initialized:
            self._db = db

    @property
    def db(self):
        return self._db
    
    def initialize(self, app: Flask, database_url: str) -> None:
        """Initialize the service context with database configuration.
        
        Args:
            app: Flask application instance
            database_url: Full database URL for SQLAlchemy. This should be provided
                        by the application setup code, not hardcoded here.
        """
        if not self.__class__._initialized:
            if not database_url:
                raise ValueError("database_url is required for ServiceContext initialization")

            app.config['SQLALCHEMY_DATABASE_URI'] = database_url
            app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

            try:
                self._db.init_app(app)
                with app.app_context():
                    self._db.create_all()
            except Exception as e:
                raise RuntimeError(f"Failed to initialize the database: {e}")
            self.__class__._initialized = True
