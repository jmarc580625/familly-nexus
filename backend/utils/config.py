"""Configuration module for the backend application."""
import os
from dataclasses import dataclass
from typing import Optional

@dataclass
class StorageConfig:
    """S3-compatible storage configuration."""
    endpoint: str
    access_key: str
    secret_key: str
    bucket_name: str
    region: str
    use_ssl: bool

@dataclass
class DatabaseConfig:
    """Database configuration."""
    url: str
    name: str

@dataclass
class Config:
    """Application configuration."""
    storage: StorageConfig
    database: DatabaseConfig
    debug: bool = False

def load_config() -> Config:
    """Load configuration from environment variables."""
    storage_config = StorageConfig(
        endpoint=os.getenv('STORAGE_ENDPOINT', '127.0.0.1:9000'),
        access_key=os.getenv('STORAGE_ACCESS_KEY', 'minioadmin'),
        secret_key=os.getenv('STORAGE_SECRET_KEY', 'minioadmin'),
        bucket_name=os.getenv('STORAGE_BUCKET_NAME', 'family-nexus-photos'),
        region=os.getenv('STORAGE_REGION', 'us-east-1'),
        use_ssl=os.getenv('STORAGE_USE_SSL', 'false').lower() == 'true'
    )

    database_config = DatabaseConfig(
        url=os.getenv('DATABASE_URL', 'postgresql://postgres:postgres@127.0.0.1:5432/familly-nexus-database'),
        name=os.getenv('DATABASE_NAME', 'familly-nexus-database')
    )

    return Config(
        storage=storage_config,
        database=database_config,
        debug=os.getenv('DEBUG', 'false').lower() == 'true'
    )

# Global configuration instance
config = load_config()
