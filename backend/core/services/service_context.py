import os
from typing import Optional
from dotenv import load_dotenv
from flask import Flask
from core.models.db import db

class ServiceContext:
    _instance: Optional['ServiceContext'] = None
    _initialized: bool = False
    DEFAULT_DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/familly-nexus-database'

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
    
    def initialize(self, app : Flask, database_url : str = None) -> None:
        if not self.__class__._initialized:
            load_dotenv()

            database_url = database_url or os.getenv('DATABASE_URL', ServiceContext.DEFAULT_DATABASE_URL)
            app.config['SQLALCHEMY_DATABASE_URI'] = database_url
            app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

            try:
                self._db.init_app(app)
                with app.app_context():
                    self._db.create_all()
            except Exception as e:
                raise RuntimeError(f"Failed to initialize the database: {e}")
            self.__class__._initialized = True
