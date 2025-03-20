FROM python:3.11-slim

# Build arguments
ARG ENV=development

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY pyproject.toml poetry.lock ./

# Install Python dependencies
RUN pip install poetry && \
    poetry config virtualenvs.create false && \
    if [ "$ENV" = "production" ]; then \
        poetry install --no-dev; \
    else \
        poetry install; \
    fi

# Copy the rest of the application
COPY . .

# Make scripts directory executable
RUN chmod +x /app/scripts/*

# Create entrypoint script
RUN echo '#!/bin/bash\n\
python /app/scripts/init_minio.py\n\
exec "$@"' > /entrypoint.sh && \
chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
CMD ["python", "-m", "flask", "run", "--host=0.0.0.0"]
