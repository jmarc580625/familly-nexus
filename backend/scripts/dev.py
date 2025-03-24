import os
import sys
import time
import psycopg2
from dotenv import load_dotenv

# Add the backend directory to the Python path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from scripts.init_minio import wait_for_minio, create_bucket

def wait_for_postgres():
    """Wait for PostgreSQL to be ready"""
    print("Waiting for PostgreSQL to be ready...")
    max_retries = 30
    retry_interval = 2

    for i in range(max_retries):
        try:
            conn = psycopg2.connect(
                dbname='postgres',
                user='postgres',
                password='postgres',
                host='127.0.0.1',
                port='5432'
            )
            conn.close()
            print("PostgreSQL is ready!")
            return True
        except Exception as e:
            if i < max_retries - 1:
                print(f"Waiting for PostgreSQL... (attempt {i + 1}/{max_retries})")
                time.sleep(retry_interval)
            else:
                print(f"Failed to connect to PostgreSQL: {str(e)}")
                return False

def ensure_database_exists():
    """Create the database if it doesn't exist"""
    try:
        # Connect to default database first
        conn = psycopg2.connect(
            dbname='postgres',
            user='postgres',
            password='postgres',
            host='127.0.0.1',
            port='5432'
        )
        conn.autocommit = True
        cur = conn.cursor()
        
        # Check if our database exists
        cur.execute("SELECT 1 FROM pg_database WHERE datname='familly-nexus-database'")
        if cur.fetchone() is None:
            print("Creating database 'familly-nexus-database'...")
            cur.execute('CREATE DATABASE "familly-nexus-database"')
            print("Database created successfully!")
        else:
            print("Database 'familly-nexus-database' already exists")
            
        cur.close()
        conn.close()
        return True
    except Exception as e:
        print(f"Error ensuring database exists: {str(e)}")
        return False

def setup_environment():
    """Set up development environment variables"""
    # Load environment variables from file
    env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'config', 'development.env'))
    load_dotenv(env_path)
    
    # Ensure required environment variables are set
    os.environ['DATABASE_URL'] = 'postgresql://postgres:postgres@127.0.0.1:5432/familly-nexus-database'
    os.environ['FLASK_APP'] = 'app:app'
    os.environ['FLASK_DEBUG'] = '1'

def main():
    """Initialize development environment and start Flask"""
    # Set up environment
    setup_environment()
    
    # Wait for services
    if not wait_for_postgres():
        sys.exit(1)
    if not wait_for_minio():
        sys.exit(1)
        
    # Initialize services
    if not ensure_database_exists():
        sys.exit(1)
    create_bucket()
    
    # Start Flask from backend directory
    os.chdir(backend_dir)
    os.system('python -m flask run --debug')

if __name__ == '__main__':
    main()
