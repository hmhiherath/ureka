# Use a lightweight Python image
FROM python:3.11-slim

# Prevent Python from writing .pyc files and buffering stdout
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

# Install system dependencies for PostgreSQL
RUN apt-get update && apt-get install -y libpq-dev gcc && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend code
COPY . .

# Expose the Flask-SocketIO port
EXPOSE 5000

CMD ["python", "app.py"]