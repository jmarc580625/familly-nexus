import os
from flask import Flask
from flask_cors import CORS
from familly_nexus.backend.routes.routes import api
from familly_nexus.backend.services.service_context import ServiceContext

app = Flask(__name__)
CORS(app)  # Enable CORS for all origins (for development only!)

def create_app():
    app = Flask(__name__)
    CORS(app)  # Enable CORS for all origins (for development only!)
    
    # Initialize ServiceContext
    service_context = ServiceContext()
    service_context.initialize(app)
    
    # Register routes
    app.register_blueprint(api, url_prefix='/api')
    
    return app

app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))  # Default to 5000 if PORT is not set
    app.run(debug=True, host='0.0.0.0', port=port)