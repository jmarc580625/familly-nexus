import os
from flask import Flask
from flask_cors import CORS
from api.v1.routes import api
from core.services.service_context import ServiceContext
from utils.config import config

def create_app():
    """Create and configure the Flask application.
    
    The database URL must be set in the DATABASE_URL environment variable.
    """
    app = Flask(__name__)
    
    # Enable CORS for development
    if config.debug:
        CORS(app)
        print("Warning: CORS is enabled for all origins (development mode)")
    
    # Initialize ServiceContext
    service_context = ServiceContext()
    service_context.initialize(app, config.database.url)
    
    # Register routes
    app.register_blueprint(api, url_prefix='/api')
    
    # Development mode: disable authentication
    if config.debug:
        print("Warning: Authentication is disabled (development mode)")
        @app.before_request
        def skip_authentication():
            pass  # No authentication check in development
    
    return app

app = create_app()

if __name__ == '__main__':
    app.run(debug=config.debug)