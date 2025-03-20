# Family Nexus

A digital platform that allows family members to explore and share their collective memories through photos, genealogical information, and rich contextual details. The goal is to go beyond a simple photo album, providing tools for enhanced discovery and connection with family history.

## Project Structure

```
/
├── config/                 # Environment configurations
│   ├── development.env
│   ├── production.env
│   └── test.env
├── docker/                 # Docker configurations
│   ├── docker-compose.dev.yml
│   ├── docker-compose.prod.yml
│   └── dockerfiles/
│       ├── backend.Dockerfile
│       └── frontend.Dockerfile
├── docs/                   # Documentation
│   ├── architecture/      # System design docs
│   ├── api/              # API documentation
│   ├── setup/            # Setup guides
│   ├── deployment/       # Deployment guides
│   └── decisions/        # Design decisions
├── backend/               # Python/Flask backend
│   ├── core/             # Core business logic
│   │   ├── models/
│   │   └── services/
│   ├── api/             # API endpoints
│   │   └── v1/
│   ├── infrastructure/  # External services
│   │   ├── storage/
│   │   └── database/
│   └── tests/
│       ├── unit/
│       ├── integration/
│       └── e2e/
├── frontend/              # React/TypeScript frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── features/    # Feature-specific components
│   │   ├── hooks/      # Custom React hooks
│   │   ├── services/   # API clients
│   │   ├── store/      # State management
│   │   ├── types/      # TypeScript types
│   │   └── utils/      # Utility functions
│   └── tests/
│       ├── unit/
│       ├── integration/
│       └── e2e/
├── scripts/               # Utility scripts
│   ├── database/        # Database management
│   ├── deployment/      # Deployment scripts
│   ├── dev/            # Development utilities
│   └── ci/             # CI/CD scripts
└── tools/                 # Development tools
    ├── eslint/
    ├── prettier/
    └── husky/
```

## Getting Started

### Development

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/family-nexus.git
   cd family-nexus
   ```

2. Start development environment:
   ```bash
   docker-compose -f docker/docker-compose.dev.yml up
   ```

3. Access the application:
   - Frontend: http://localhost:3000
   - API: http://localhost:5000
   - MinIO Console: http://localhost:9001

### Production

1. Build and start production environment:
   ```bash
   docker-compose -f docker/docker-compose.prod.yml up -d
   ```

## Tech Stack

- **Frontend**: React, TypeScript, Material-UI
- **Backend**: Python, Flask, SQLAlchemy
- **Database**: PostgreSQL with pgvector
- **Storage**: MinIO (S3-compatible)
- **Containerization**: Docker, Docker Compose

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Run tests: `npm test` (frontend) and `poetry run pytest` (backend)
4. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
