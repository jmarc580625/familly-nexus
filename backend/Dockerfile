FROM python:3.9-slim-buster

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV DATABASE_URL=postgresql://postgres:postgres@db:5432/familynexus
ENV FLASK_ENV=development
CMD ["gunicorn", "-b", "0.0.0.0:5000", "app:app"]
