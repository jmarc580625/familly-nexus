# Project Workspace Initialization Action Plan : FamillyNexus

## Phase 1: Project Definition & Setup (High-Level)

**Objective:** Define the project's core purpose, scope, and basic structure.

**Actions:**

1.  **Define Project Goal:**
    *   **Core Purpose:** To create a digital platform that allows family members to explore and share their collective memories through photos, genealogical information, and rich contextual details.  The goal is to go beyond a simple photo album, providing tools for enhanced discovery and connection with family history.
    *   **Problem Solved:** This addresses the challenge of preserving and accessing family memories scattered across various physical media and formats. It provides a centralized, searchable, and interactive platform, making it easier to share and discover family history.
    *   **Desired Outcomes:**
        *   A searchable and browsable archive of family photos, organized chronologically and thematically.
        *   A detailed and linked family tree (genealogy) including relationships (blood, friendship, etc.) beyond basic family ties.
        *   Ability to add rich contextual information (dates, locations, detailed stories/narratives) to photos and individuals.
        *   Automated extraction of metadata from photos (location, date/time).
        *   AI-powered features (e.g., face recognition for photo tagging, automated generation of photo descriptions)  *(Considered for future phases)*
        *   Natural language querying of the "augmented family album."
        *   Interactive timelines visualizing family events and relationships.
        *   Geographic visualization of locations mentioned in photos or family history on maps.
        *   Secure sharing capabilities for family members.

2.  **Determine Project Scope (MVP - Minimum Viable Product):**
    *   **In Scope (Initial):**
        *   Ability to upload and store family photos (basic organization features)
        *   Create and edit a family tree (basic linking of individuals) and ability to add relationships beyond basic family.
        *   Adding descriptive text (short narratives) to photos and people.
        *   Basic search functionality (by name, date, keywords).
        *   **EXIF-based metadata extraction from uploaded photos (location, date/time).**

    *   **Out of Scope (Initial):**
        *   Advanced AI-powered features (face recognition, automated description generation).
        *   Complex data extraction beyond basic EXIF data.
        *   Natural language querying.
        *   Interactive timelines and geographic visualizations.
        *   Advanced sharing and permission settings.

3.  **Choose a Project Name:**
    *   **Selected Project Name**: FamilyNexus
    *   Check for name availability (domain, code repositories, etc.)

4. **Select Tech Stack**
    *   **Front-End:**
        *   React
        *   Material UI
    *   **Back-End:**
        *   Python
        *   Flask
    *   **API:**
        *   RESTful API
    *   **Database:**
        *   PostgreSQL (with JSONB and pgvector extension)
        *   Vector storage capabilities provided by pgvector extension.
        *   Future: Consider dedicated vector database (e.g., Pinecone, Weaviate) if necessary.
    *   **Object Storage:**
        * Local file system (initial development)
        * Future: Cloud storage (e.g., AWS S3)
    * **Source Repository**:
        * Github
    * **CI/CD**:
        * Poetry (for python)
        * Github actions (for CI/CD)
    * **Containerization**:
        * Docker
    *   **Package Management:**
        *   npm (front-end)
        *   Poetry (back-end)

5.  **Create Project Directory:**
    *   Create a main project folder on your local system.
    *   Choose a logical location for the project (e.g., `~/Projects/`).

6. **Create Repository:**
    * Choose a code management platform: Github, Gitlab, etc.
    * Set the repository as public or private.
    * Create an empty repository with a README.md file.

7.  **Initialize Version Control:**
    *   Initialize Git within the project directory ( `git init`).
    *   Add a `.gitignore` file (based on your tech stack).
    *   Create an initial commit and push to the repository.

## Phase 2: Environment Setup (Detailed)

**Objective:** Configure the development environment and install essential tools.

**Actions:**

1.  **Install Dependencies:**
    *   Identify and install the required language runtimes (e.g., Node.js, Python).
    *   Install project-specific libraries and frameworks (e.g., React, Django).
    *   Use a package manager (e.g., npm, pip) if applicable.
    * (This will be clarified in Q&A)

2.  **Set Up Development Environment:**
    *   Configure your code editor (e.g., VS Code, IntelliJ) with necessary extensions.
    *   Set up any required environment variables.

3. **Setup the data storage:**
    * If you need a database, set it up.
    * If you need a bucket, set it up.

4.  **Create Initial File Structure:**
    *   Set up a basic file and folder structure within the project directory.
    *   (This will be clarified in Q&A)

5.  **Test Environment:**
    *   Run a simple "Hello, World!" program to ensure everything is working.

## Phase 3: Initial Code Structure (Basic)

**Objective:** Set up the minimal viable code structure to start development.

**Actions:**

1.  **Create Core Modules:**
    *   Set up the basic modules or components of your application.
    *   (This will be clarified in Q&A)

2.  **Write Initial Tests:**
    *   Create basic unit tests for the core modules.
    *   (This will be clarified in Q&A)

3.  **Document Setup:**
    * Add a description to your README.md file.
    * Consider adding a more in depth documentation like a "doc" folder.
    * Consider adding a wiki to your repository

4.  **Review and Refine:**
    *   Review the initial setup and make any necessary adjustments.
    *   Seek feedback from other developers (if applicable).
