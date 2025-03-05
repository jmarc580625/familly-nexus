# Project Workspace Initialization Action Plan : FamillyNexus

## Phase 1: Project Definition & Setup (High-Level)

**Objective:** Define the project's core purpose, scope, and basic structure.

**Actions:**

1.  **Define Project Goal:**

    - **Core Purpose:** To create a digital platform that allows family members to explore and share their collective memories through photos, genealogical information, and rich contextual details. The goal is to go beyond a simple photo album, providing tools for enhanced discovery and connection with family history.
    - **Problem Solved:** This addresses the challenge of preserving and accessing family memories scattered across various physical media and formats. It provides a centralized, searchable, and interactive platform, making it easier to share and discover family history.
    - **Desired Outcomes:**
      - A searchable and browsable archive of family photos, organized chronologically and thematically.
      - A detailed and linked family tree (genealogy) including relationships (blood, friendship, etc.) beyond basic family ties.
      - Ability to add rich contextual information (dates, locations, detailed stories/narratives) to photos and individuals.
      - Automated extraction of metadata from photos (location, date/time).
      - AI-powered features (e.g., face recognition for photo tagging, automated generation of photo descriptions) _(Considered for future phases)_
      - Natural language querying of the "augmented family album."
      - Interactive timelines visualizing family events and relationships.
      - Geographic visualization of locations mentioned in photos or family history on maps.
      - Secure sharing capabilities for family members.

2.  **Determine Project Scope (MVP - Minimum Viable Product):**

    - **In Scope (Initial):**

      - Ability to upload and store family photos (basic organization features)
      - Create and edit a family tree (basic linking of individuals) and ability to add relationships beyond basic family.
      - Adding descriptive text (short narratives) to photos and people.
      - Basic search functionality (by name, date, keywords).
      - **EXIF-based metadata extraction from uploaded photos (location, date/time).**

    - **Out of Scope (Initial):**
      - Advanced AI-powered features (face recognition, automated description generation).
      - Complex data extraction beyond basic EXIF data.
      - Natural language querying.
      - Interactive timelines and geographic visualizations.
      - Advanced sharing and permission settings.

3.  **Choose a Project Name:**

    - **Selected Project Name**: FamilyNexus
    - Check for name availability (domain, code repositories, etc.)

4.  **Select Tech Stack**

    - **Front-End:**
      - React
      - Material UI
    - **Back-End:**
      - Python
      - Flask
    - **API:**
      - RESTful API
    - **Database:**
      - PostgreSQL (with JSONB and pgvector extension)
      - Vector storage capabilities provided by pgvector extension.
      - Future: Consider dedicated vector database (e.g., Pinecone, Weaviate) if necessary.
    - **Object Storage:**
      - Local file system (initial development)
      - Future: Cloud storage (e.g., AWS S3)
    - **Source Repository**:
      - Github
    - **CI/CD**:
      - Poetry (for python)
      - Github actions (for CI/CD)
    - **Containerization**:
      - Docker
    - **Package Management:**
      - npm (front-end)
      - Poetry (back-end)

5.  **Create Project Directory:**

    - Create a main project folder on `D:\familly-nexus`

6.  **Create Repository:**

    - Code management platform: Github
    - Public empty repository with a README.md file and .gitignore based on Python template
    - URL is `https://github.com/jmarc580625/familly-nexus`

7.  **Initialize Version Control:**
    - in `D:\familly-nexus`
      - Initialize Git within the project directory
      ```
      git init
      ```
      - Connect with the Github code repository
        ```
        git remote add origin https://github.com/jmarc580625/familly-nexus
        ```
      - Retrieve repository from Github
        ```
        git pull origin main
        ```
      - Adapt `.gitignore` file (based on your tech stack Python & React)
      - Initialize local config with identity information if needed
        ```
        git config --global user.email "jmarc580625+github@gmail.com"
        git config --global user.name "jmarc580625"
        ```
      - Create an initial commit and push to the repository.
        ```
        git add .
        git commit -m "Add initial files and directory structure"
        git push -u origin main
        ```

## Phase 2: Environment Setup (Detailed)

**Objective:** Configure the development environment and install essential tools.

**Actions:**

1.  **Install Dependencies:**
    - Identify and install the required language runtimes (e.g., Node.js, Python).
      ```
      cd d:\family-nexus
      poetry init
      poetry add flask psycopg2-binary python-dotenv gunicorn pgvector requests
      poetry add -D black isort flake8 pytest pytest-cov
      poetry install
      ```
    - Install project-specific libraries and frameworks (e.g., React, Django).
      ```
      cd d:\family-nexus
      npx create-react-app frontend
      cd frontend
      npm install @mui/material @emotion/react @emotion/styled react-router-dom
      npm install --save-dev @testing-library/react
      ```
2.  **Set Up Development Environment:**

    - IDE choice is VS Code
    - **VS Code extensions**:
      - **Python**: Microsoft's official Python extension. This is essential for Python language support, IntelliSense (code completion), linting, debugging, and more.
      - **JavaScript (ES6) code snippets**: This extensions enhances JavaScript language support, and include code snippets, code completion and debugging.
      - **Prettier - Code formatter**: For consistent code formatting (both Python and JavaScript).
      - **GitLens — Git supercharged**: Enhances Git integration with features like code authorship, history exploration, and more.
      - **Docker**: Microsoft's official Docker extension, for managing Docker containers and images.
      - **Material Icon Theme**: Adds beautiful icons to the file explorer.
      - **Indent-Rainbow**: Makes the indentation clearer.
      - **Better Comments**: Makes the comments clearer.
    - **VS Code Workspace Settings**:
      - Create a .vscode directory in the root of your project (d:\familly-nexus).
      - Inside .vscode, create a file named settings.json.
      - Add project-specific settings to settings.json. For example:
        ```
        {
            "python.defaultInterpreterPath": "${workspaceFolder}/.venv/Scripts/python.exe", // Adapt if different OS or different Python path
            "python.formatting.provider": "black",
            "python.linting.flake8Enabled": true,
            "editor.defaultFormatter": "esbenp.prettier-vscode",
            "editor.formatOnSave": true,
            "editor.tabSize": 4
        }
        ```
    - **Environment Variables**:
      - Create a .env file in the root of your project (d:\familly-nexus).
      - In the .env file, add your environment variables. For example:
        ```
        POSTGRES_HOST=db
        POSTGRES_PORT=5432
        POSTGRES_DB=familynexus
        POSTGRES_USER=postgres
        POSTGRES_PASSWORD=postgres
        ```

3.  **Setup the data storage:**

    - **Objective**: Get the database (PostgreSQL with pgvector) up and running in a Docker container.

    1. **Docker Compose File**:

    - Create a docker-compose.yml file in the root of your project (`d:\familly-nexus`).

      ```
      services:
        db:
          image: pgvector/pgvector:pg17 # Specify PostgreSQL version 17
          container_name: family-nexus-db
          restart: always
          environment:
            - POSTGRES_USER=postgres
            - POSTGRES_PASSWORD=postgres
            - POSTGRES_DB=familynexus
          ports:
            - "127.0.0.1:5432:5432"
          volumes:
            - db-data:/var/lib/postgresql/data
          healthcheck:
            test: ["CMD-SHELL", "pg_isready -U postgres"]
            interval: 5s
            timeout: 5s
            retries: 5
            start_period: 10s

      volumes:
        db-data:
      ```

    2. **Rebuild the image**:
       ```
       docker compose up -d --build
       ```
    3. \*Start the Database Container\*\*:
       ```
       cd d:\familly-nexus
       docker compose up -d
       docker compose ps
       docker exec -it family-nexus-db psql -U postgres -d familynexus
         CREATE EXTENSION vector;
         \q
       ```

4.  **Create Initial File Structure:**

    - Set up a basic file and folder structure within the project directory.

    ```
    d:\familly-nexus/
    ├── frontend/          # React application
    │   ├── public/
    │   ├── src/
    │   │   ├── components/
    │   │   ├── pages/
    │   │   ├── services/  # API calls
    │   │   ├── ...
    │   ├── ...
    ├── backend/          # Flask application
    │   ├── app.py        # Main Flask application file
    │   ├── models.py     # Database models
    │   ├── routes.py     # API routes
    │   ├── schemas.py    # Data validation schemas (optional, but recommended)
    │   ├── services/     # Business logic
    │   ├── utils/        # Utility functions
    │   ├── tests/        # Unit tests
    │   ├── ...
    ├── docker-compose.yml
    ├── Dockerfile
    ├── .env              # Environment variables
    ├── README.md
    └── ...
    ```

5.  **Test the Environment:** - Run a simple "Hello, World!" program to ensure everything is working.

    - **Simple frontend**:

      - Create a flask `.backend/app.py` (python) which connects to the database and respond back with database details

        ```
        import os
        from flask import Flask
        import psycopg2
        from flask_cors import CORS

              app = Flask(__name__)
              CORS(app) # Enable CORS for all origins (for development only!)

              DATABASE_URL = os.environ.get('DATABASE_URL')

              @app.route("/")
              def hello():
                  try:
                      conn = psycopg2.connect(DATABASE_URL)
                      cur = conn.cursor()
                      cur.execute("SELECT version();")
                      db_version = cur.fetchone()[0]
                      conn.close()
                      return f"Hello from Flask! Database version: {db_version}"
                  except Exception as e:
                      return f"Error connecting to database: {e}"

              if __name__ == "__main__":
                  port = int(os.environ.get("PORT", 5000))  # Default to 5000 if PORT is not set
                  app.run(debug=True, host='0.0.0.0', port=port)
        ```

      - Create a `.backend/requirements.txt` which list the python packages needed by the app

        ```
        Flask
        flask_cors
        psycopg2-binary
        python-dotenv # For loading environment variables from a .env file
        gunicorn # For production-ready WSGI HTTP server
        ```

      - Create a `.backend/Dockerfile` to build the image running the flask app and connect to the db

        ```
        FROM python:3.9-slim-buster

        WORKDIR /app

        COPY requirements.txt .
        RUN pip install --no-cache-dir -r requirements.txt

        COPY . .

        ENV DATABASE_URL=postgresql://postgres:postgres@db:5432/familynexus
        ENV FLASK_ENV=development

        CMD ["gunicorn", "-b", "0.0.0.0:5000", "app:app"]
        ```

      - Update the `docker-compose.yml`

        ```
        services:
          db:
            # ... (same as before)

          api: # Your Flask application
            build:
              context: ./backend
              dockerfile: Dockerfile
            ports:
              - "5000:5000" # Map port 5000 for local access (optional, remove for production)
            depends_on:
              - db
            environment:
              - DATABASE_URL=postgresql://postgres:postgres@db:5432/familynexus
              - FLASK_ENV=development # Or "production" in production

        volumes:
          db-data:
        ```

    - **Simple backend**:

      - Create a React `.frontend/src/App.js`

        ```
        import React from "react";

        function App() {
          const [message, setMessage] = React.useState("");

          React.useEffect(() => {
            fetch("http://localhost:5000/") // Or http://api:5000/ if you aren't mapping to localhost
              .then((response) => response.text())
              .then((data) => setMessage(data));
          }, []);

          return (
            <div>
              <h1>FamilyNexus</h1>
              <p>Message from backend: {message}</p>
            </div>
          );
        }

        export default App;
        ```

      - Create a `./frontend/Dokerfile` to build the image running the React app and connect to the api

## Phase 3: Initial Code Structure (Basic)

**Objective:** Set up the minimal viable code structure to start development.

**Actions:**

1.  **Create Core Modules:**

    - Set up the basic modules or components of your application.
    - (This will be clarified in Q&A)

2.  **Write Initial Tests:**

    - Create basic unit tests for the core modules.
    - (This will be clarified in Q&A)

3.  **Document Setup:**

    - Add a description to your README.md file.
    - Consider adding a more in depth documentation like a "doc" folder.
    - Consider adding a wiki to your repository

4.  **Review and Refine:**
    - Review the initial setup and make any necessary adjustments.
    - Seek feedback from other developers (if applicable).
